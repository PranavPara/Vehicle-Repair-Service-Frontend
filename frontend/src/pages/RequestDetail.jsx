import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, STEPS, getError } from '../api'

// This page shows one request. What you see and what buttons you get depends on
// who you are (customer, mechanic or admin) and on the status of the request.
function RequestDetail(props) {
  const user = props.user

  const [request, setRequest] = useState(null)
  const [mechanics, setMechanics] = useState([])

  // admin: the mechanic chosen in the list
  const [mechanicId, setMechanicId] = useState('')

  // mechanic: the form boxes
  const [diagnosis, setDiagnosis] = useState('')
  const [partsCost, setPartsCost] = useState('0')
  const [labourCost, setLabourCost] = useState('0')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadRequest()
    if (user.role === 'ADMIN') {
      loadMechanics()
    }
  }, [])

  async function loadRequest() {
    try {
      const response = await axios.get(API + '/requests/' + props.requestId)
      const r = response.data
      setRequest(r)
      // fill the mechanic's form boxes with the saved values
      setDiagnosis(r.diagnosis || '')
      setPartsCost(String(r.partsCost))
      setLabourCost(String(r.labourCost))
    } catch (err) {
      setError(getError(err))
    }
  }

  async function loadMechanics() {
    try {
      const response = await axios.get(API + '/users/mechanics')
      setMechanics(response.data)
    } catch (err) {
      setError(getError(err))
    }
  }

  // ----- ADMIN: choose a mechanic -----
  async function assignMechanic() {
    setError('')
    setMessage('')
    if (mechanicId === '') {
      setError('Please choose a mechanic')
      return
    }
    try {
      await axios.put(API + '/requests/' + props.requestId + '/assign/' + mechanicId)
      setMessage('Mechanic chosen')
      loadRequest()
    } catch (err) {
      setError(getError(err))
    }
  }

  // ----- EVERYONE: move the request to the next step -----
  async function changeStatus(newStatus, question) {
    if (question && !window.confirm(question)) {
      return
    }
    setError('')
    setMessage('')
    try {
      await axios.put(API + '/requests/' + props.requestId + '/status/' + newStatus)
      setMessage('Status is now ' + newStatus)
      loadRequest()
    } catch (err) {
      setError(getError(err))
    }
  }

  // ----- MECHANIC: save diagnosis and costs. Gives back true if it worked. -----
  async function saveRepair() {
    if (partsCost === '' || labourCost === '' || partsCost < 0 || labourCost < 0) {
      setError('Costs must be 0 or more')
      return false
    }
    try {
      await axios.put(API + '/requests/' + props.requestId + '/repair', {
        diagnosis: diagnosis,
        partsCost: Number(partsCost),
        labourCost: Number(labourCost),
      })
      return true
    } catch (err) {
      setError(getError(err))
      return false
    }
  }

  async function handleSave() {
    setError('')
    setMessage('')
    const saved = await saveRepair()
    if (saved) {
      setMessage('Saved')
      loadRequest()
    }
  }

  // save first, then go to the next step
  async function saveAndChange(newStatus, question) {
    setError('')
    setMessage('')
    const saved = await saveRepair()
    if (saved) {
      changeStatus(newStatus, question)
    }
  }

  // ----- ADMIN: the customer has paid -----
  async function markPaid() {
    setError('')
    setMessage('')
    try {
      await axios.put(API + '/requests/' + props.requestId + '/pay')
      setMessage('Invoice marked as paid')
      loadRequest()
    } catch (err) {
      setError(getError(err))
    }
  }

  // while the data is loading
  if (request === null) {
    return <div>{error ? <p className="error">{error}</p> : <p>Loading...</p>}</div>
  }

  const status = request.status
  const stepNumber = STEPS.indexOf(status)

  // The mechanic can type in the boxes only in DIAGNOSIS and REPAIR
  const mechanicCanEdit = user.role === 'MECHANIC' && (status === 'DIAGNOSIS' || status === 'REPAIR')

  // The customer sees the costs only after the estimate is sent (then totalCost is more than 0)
  const showCosts = user.role !== 'CUSTOMER' || request.totalCost > 0

  return (
    <div>
      <button onClick={props.goBack}>&larr; Back</button>
      <h1>Service Request No. {request.id}</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {/* ----- the steps ----- */}
      {status === 'CANCELLED' ? (
        <p className="error">This request is cancelled.</p>
      ) : (
        <div className="steps">
          {STEPS.map((step, index) => {
            let css = 'step'
            if (index < stepNumber) css = 'step done'
            if (index === stepNumber) css = 'step now'
            return <span key={step} className={css}>{step}</span>
          })}
        </div>
      )}

      {/* ----- details ----- */}
      <div className="box">
        <h2>Details</h2>
        <p>Vehicle: {request.vehicle.registrationNumber} ({request.vehicle.brand} {request.vehicle.model})</p>
        <p>Customer: {request.vehicle.owner.name}</p>
        <p>Mechanic: {request.mechanic ? request.mechanic.name : 'not chosen yet'}</p>
        <p>Date: {request.requestDate}</p>
        <p>Problem: {request.description}</p>
        <p>Status: <b>{status}</b></p>
      </div>

      {/* ----- ADMIN: choose a mechanic ----- */}
      {user.role === 'ADMIN' && (status === 'REPORTED' || status === 'DIAGNOSIS') && (
        <div className="box">
          <h2>Choose a Mechanic</h2>
          <select value={mechanicId} onChange={(e) => setMechanicId(e.target.value)}>
            <option value="">-- choose --</option>
            {mechanics.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <button onClick={assignMechanic}>Save</button>
        </div>
      )}

      {/* ----- messages for the customer while waiting ----- */}
      {user.role === 'CUSTOMER' && status === 'REPORTED' && <p className="info">Please wait. The workshop will choose a mechanic.</p>}
      {user.role === 'CUSTOMER' && status === 'DIAGNOSIS' && <p className="info">The mechanic is checking your vehicle. The estimate will come here.</p>}

      {/* ----- repair details: diagnosis and costs ----- */}
      {showCosts && request.mechanic && (
        <div className="box">
          <h2>Repair Details</h2>

          <p>Diagnosis:</p>
          {mechanicCanEdit && status === 'DIAGNOSIS' ? (
            <textarea rows="3" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}></textarea>
          ) : (
            <p><b>{request.diagnosis || 'not written yet'}</b></p>
          )}

          <p>Parts cost (Rs.):</p>
          {mechanicCanEdit ? (
            <input type="number" value={partsCost} onChange={(e) => setPartsCost(e.target.value)} />
          ) : (
            <p><b>{request.partsCost}</b></p>
          )}

          <p>Labour cost (Rs.):</p>
          {mechanicCanEdit ? (
            <input type="number" value={labourCost} onChange={(e) => setLabourCost(e.target.value)} />
          ) : (
            <p><b>{request.labourCost}</b></p>
          )}

          <p>Total: <b>Rs. {request.totalCost}</b> {mechanicCanEdit && '(updates after you save)'}</p>

          {mechanicCanEdit && (
            <div>
              <button onClick={handleSave}>Save</button>
              {status === 'DIAGNOSIS' && (
                <button onClick={() => saveAndChange('ESTIMATE', 'Send the estimate to the customer?')}>
                  Send Estimate
                </button>
              )}
              {status === 'REPAIR' && (
                <button onClick={() => saveAndChange('COMPLETED', 'Is the repair completed?')}>
                  Repair Completed
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ----- buttons for each person ----- */}
      <div className="box">
        <h2>What can you do?</h2>

        {/* customer: approve or decline the estimate */}
        {user.role === 'CUSTOMER' && status === 'ESTIMATE' && (
          <div>
            <p>The estimate is Rs. {request.totalCost}. Do you want the repair?</p>
            <button onClick={() => changeStatus('APPROVED', 'Approve the estimate?')}>Approve</button>
            <button onClick={() => changeStatus('CANCELLED', 'Decline and cancel this request?')}>Decline</button>
          </div>
        )}

        {/* mechanic: start the repair */}
        {user.role === 'MECHANIC' && status === 'APPROVED' && (
          <button onClick={() => changeStatus('REPAIR')}>Start Repair</button>
        )}

        {/* admin: give the vehicle back to the customer */}
        {user.role === 'ADMIN' && status === 'COMPLETED' && (
          <button onClick={() => changeStatus('DELIVERED', 'Give the vehicle to the customer?')}>Vehicle Delivered</button>
        )}

        {/* customer or admin: cancel before the repair starts */}
        {user.role !== 'MECHANIC' &&
          (status === 'REPORTED' || status === 'DIAGNOSIS' || status === 'APPROVED') && (
            <button onClick={() => changeStatus('CANCELLED', 'Cancel this request?')}>Cancel Request</button>
          )}

        {/* when there is nothing to do */}
        {(status === 'DELIVERED' || status === 'CANCELLED') && <p>Nothing more to do.</p>}
        {user.role === 'MECHANIC' && (status === 'ESTIMATE' || status === 'COMPLETED') && <p>Waiting for others. Nothing to do now.</p>}
      </div>

      {/* ----- the invoice ----- */}
      {(status === 'COMPLETED' || status === 'DELIVERED') && user.role !== 'MECHANIC' && (
        <div className="box invoice">
          <h2>Invoice</h2>
          <p>Invoice for service request No. {request.id}</p>
          <p>Customer: {request.vehicle.owner.name}</p>
          <p>Vehicle: {request.vehicle.registrationNumber}</p>
          <table>
            <tbody>
              <tr><td>Parts cost</td><td>Rs. {request.partsCost}</td></tr>
              <tr><td>Labour cost</td><td>Rs. {request.labourCost}</td></tr>
              <tr><td><b>Total</b></td><td><b>Rs. {request.totalCost}</b></td></tr>
            </tbody>
          </table>
          <p>Payment: <b>{request.paymentStatus}</b></p>

          <button onClick={() => window.print()}>Print</button>
          {user.role === 'ADMIN' && request.paymentStatus === 'PENDING' && (
            <button onClick={markPaid}>Mark as Paid</button>
          )}
        </div>
      )}
    </div>
  )
}

export default RequestDetail
