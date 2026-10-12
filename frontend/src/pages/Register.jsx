import { useState } from 'react'
import axios from 'axios'
import { API, getError } from '../api'

function Register(props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (name === '' || email === '' || password === '') {
      setError('Please fill all the boxes')
      return
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    try {
      const response = await axios.post(API + '/users/register', {
        name: name,
        email: email,
        password: password,
      })
      props.onLogin(response.data) // log in directly after registering
    } catch (err) {
      setError(getError(err))
    }
  }

  return (
    <div className="small-page">
      <h1>Vehicle Service</h1>
      <h2>Customer Registration</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <p>Name</p>
        <input value={name} onChange={(e) => setName(e.target.value)} />

        <p>Email</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <p>Password</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <br /><br />
        <button type="submit">Register</button>
      </form>

      <p>
        Already registered?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); props.goToLogin() }}>Login</a>
      </p>
    </div>
  )
}

export default Register
