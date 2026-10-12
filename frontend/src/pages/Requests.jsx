import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, getError } from '../api'

function Requests(props) {
  const user = props.user

  const [requests, setRequests] = useState([])
  const [vehicles, setVehicles] = useState([])

  // the "new request" form (only for customers)
  const [vehicleId, setVehicleId] = useState('')
  const [description, setDescription] = useState('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadRequests()
    if (user.role === 'CUSTOMER') {
      loadVehicles()
    }
  }, [])

  async function loadRequests() {
    try {
      // customer: his requests, mechanic: his jobs, admin: everything
      let url = API + '/requests'
      if (user.role === 'CUSTOMER') {
        url = API + '/requests?customerId=' + user.id
      }
      if (user.role === 'MECHANIC') {
        url = API + '/requests?mechanicId=' + user.id
      }
      const response = await axios.get(url)
      setRequests(response.data)
    } catch (err) {
      setError(getError(err))
    }
  }

  async function loadVehicles() {
    try {
      const response = await axios.get(API + '/vehicles?ownerId=' + user.id)
      setVehicles(response.data)
    } catch (err) {
      setError(getError(err))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (vehicleId === '') {
      setError('Please choose a vehicle')
      return
    }
    if (description.length < 5) {
      setError('Please write the problem (at least 5 letters)')
      return
    }

    try {
      await axios.post(API + '/requests', {
        vehicle: { id: Number(vehicleId) },
        description: description,
      })
      setMessage('Request sent')
      setVehicleId('')
      setDescription('')
      loadRequests()
    } catch (err) {
      setError(getError(err))
    }
  }

  return (
    <div>
      <h1>{user.role === 'MECHANIC' ? 'My Jobs' : 'Service Requests'}</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {user.role === 'CUSTOMER' && (
        <form onSubmit={handleSubmit} className="box">
          <h2>New Service Request</h2>

          <p>Vehicle</p>
          <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
            <option value="">-- choose --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registrationNumber} ({v.brand} {v.model})
              </option>
            ))}
          </select>
          {vehicles.length === 0 && <p>You have no vehicles. Add one in the Vehicles page first.</p>}

          <p>What is the problem?</p>
          <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

          <br /><br />
          <button type="submit">Send Request</button>
        </form>
      )}

      {user.role === 'CUSTOMER' && <p>Your finished repairs (DELIVERED) in this list are your service history.</p>}

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Date</th>
            <th>Vehicle</th>
            {user.role !== 'CUSTOMER' && <th>Customer</th>}
            <th>Problem</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.requestDate}</td>
              <td>{r.vehicle.registrationNumber}</td>
              {user.role !== 'CUSTOMER' && <td>{r.vehicle.owner.name}</td>}
              <td>{r.description}</td>
              <td>{r.status}</td>
              <td><button onClick={() => props.openRequest(r.id)}>Open</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {requests.length === 0 && <p>No requests yet.</p>}
    </div>
  )
}

export default Requests
