import { useState, useEffect } from 'react'
import axios from 'axios'
import { API, getError } from '../api'

function Vehicles(props) {
  const user = props.user

  const [vehicles, setVehicles] = useState([])

  // the form boxes
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [vehicleType, setVehicleType] = useState('Car')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')

  // editId is empty when adding a new vehicle, and has the vehicle id when editing
  const [editId, setEditId] = useState(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // useEffect runs this code when the page opens
  useEffect(() => {
    loadVehicles()
  }, [])

  async function loadVehicles() {
    try {
      // a customer sees only his vehicles. The admin sees all vehicles.
      let url = API + '/vehicles'
      if (user.role === 'CUSTOMER') {
        url = API + '/vehicles?ownerId=' + user.id
      }
      const response = await axios.get(url)
      setVehicles(response.data)
    } catch (err) {
      setError(getError(err))
    }
  }

  function clearForm() {
    setRegistrationNumber('')
    setBrand('')
    setModel('')
    setVehicleType('Car')
    setYear('')
    setMileage('')
    setEditId(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    // check the boxes
    if (registrationNumber === '' || brand === '' || model === '') {
      setError('Registration number, brand and model are required')
      return
    }
    if (year < 1950) {
      setError('Enter a correct manufacturing year')
      return
    }
    if (mileage === '' || mileage < 0) {
      setError('Mileage must be 0 or more')
      return
    }

    const vehicle = {
      registrationNumber: registrationNumber,
      brand: brand,
      model: model,
      vehicleType: vehicleType,
      manufacturingYear: Number(year),
      mileage: Number(mileage),
      owner: { id: user.id },
    }

    try {
      if (editId === null) {
        await axios.post(API + '/vehicles', vehicle) // add new
        setMessage('Vehicle added')
      } else {
        await axios.put(API + '/vehicles/' + editId, vehicle) // update old
        setMessage('Vehicle updated')
      }
      clearForm()
      loadVehicles()
    } catch (err) {
      setError(getError(err))
    }
  }

  // puts the vehicle data into the form boxes
  function startEdit(v) {
    setEditId(v.id)
    setRegistrationNumber(v.registrationNumber)
    setBrand(v.brand)
    setModel(v.model)
    setVehicleType(v.vehicleType)
    setYear(v.manufacturingYear)
    setMileage(v.mileage)
  }

  async function deleteVehicle(id) {
    if (!window.confirm('Delete this vehicle?')) {
      return
    }
    setError('')
    setMessage('')
    try {
      await axios.delete(API + '/vehicles/' + id)
      setMessage('Vehicle deleted')
      loadVehicles()
    } catch (err) {
      setError(getError(err))
    }
  }

  return (
    <div>
      <h1>{user.role === 'ADMIN' ? 'All Vehicles' : 'My Vehicles'}</h1>

      {error && <p className="error">{error}</p>}
      {message && <p className="success">{message}</p>}

      {/* Only customers can add vehicles */}
      {user.role === 'CUSTOMER' && (
        <form onSubmit={handleSubmit} className="box">
          <h2>{editId === null ? 'Add a Vehicle' : 'Edit Vehicle'}</h2>

          <p>Registration Number</p>
          <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} />

          <p>Brand</p>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} />

          <p>Model</p>
          <input value={model} onChange={(e) => setModel(e.target.value)} />

          <p>Type</p>
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            <option>Car</option>
            <option>Bike</option>
            <option>Scooter</option>
            <option>Truck</option>
          </select>

          <p>Manufacturing Year</p>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />

          <p>Mileage (km)</p>
          <input type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} />

          <br /><br />
          <button type="submit">{editId === null ? 'Add Vehicle' : 'Update Vehicle'}</button>
          {editId !== null && <button type="button" onClick={clearForm}>Cancel</button>}
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Number</th>
            <th>Brand</th>
            <th>Model</th>
            <th>Type</th>
            <th>Year</th>
            <th>Mileage</th>
            {user.role === 'ADMIN' && <th>Owner</th>}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {/* map() makes one table row for each vehicle in the list */}
          {vehicles.map((v) => (
            <tr key={v.id}>
              <td>{v.registrationNumber}</td>
              <td>{v.brand}</td>
              <td>{v.model}</td>
              <td>{v.vehicleType}</td>
              <td>{v.manufacturingYear}</td>
              <td>{v.mileage}</td>
              {user.role === 'ADMIN' && <td>{v.owner.name}</td>}
              <td>
                {user.role === 'CUSTOMER' && <button onClick={() => startEdit(v)}>Edit</button>}
                <button onClick={() => deleteVehicle(v.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {vehicles.length === 0 && <p>No vehicles yet.</p>}
    </div>
  )
}

export default Vehicles
