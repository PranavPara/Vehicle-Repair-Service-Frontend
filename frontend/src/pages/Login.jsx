import { useState } from 'react'
import axios from 'axios'
import { API, getError } from '../api'

function Login(props) {
  // useState keeps the value of each input box
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault() // stops the page from refreshing
    setError('')

    // check the boxes are not empty
    if (email === '' || password === '') {
      setError('Please enter your email and password')
      return
    }

    // send the email and password to the backend
    try {
      const response = await axios.post(API + '/users/login', { email: email, password: password })
      props.onLogin(response.data)
    } catch (err) {
      setError(getError(err))
    }
  }

  return (
    <div className="small-page">
      <h1>Vehicle Service</h1>
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <p>Email</p>
        <input value={email} onChange={(e) => setEmail(e.target.value)} />

        <p>Password</p>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <br /><br />
        <button type="submit">Login</button>
      </form>

      <p>
        New customer?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); props.goToRegister() }}>Register</a>
      </p>
    </div>
  )
}

export default Login
