import { useState } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Vehicles from './pages/Vehicles'
import Requests from './pages/Requests'
import RequestDetail from './pages/RequestDetail'

function App() {
  // "user" is the person who is logged in. It is null when nobody is logged in.
  // We read it from the browser memory (localStorage) so a page refresh does not log you out.
  const saved = localStorage.getItem('user')
  const [user, setUser] = useState(saved ? JSON.parse(saved) : null)

  // "page" says which page to show: 'login', 'register', 'requests', 'vehicles' or 'detail'
  const [page, setPage] = useState('requests')

  // the number of the request we are looking at (used on the 'detail' page)
  const [requestId, setRequestId] = useState(null)

  function handleLogin(loggedInUser) {
    localStorage.setItem('user', JSON.stringify(loggedInUser))
    setUser(loggedInUser)
    setPage('requests')
  }

  function handleLogout() {
    localStorage.removeItem('user')
    setUser(null)
    setPage('login')
  }

  function openRequest(id) {
    setRequestId(id)
    setPage('detail')
  }

  // ----- nobody is logged in: show the login or register page -----
  if (user === null) {
    if (page === 'register') {
      return <Register onLogin={handleLogin} goToLogin={() => setPage('login')} />
    }
    return <Login onLogin={handleLogin} goToRegister={() => setPage('register')} />
  }

  // ----- somebody is logged in: show the menu and the page -----
  return (
    <div>
      <div className="menu">
        <b>Vehicle Service</b>
        <button onClick={() => setPage('requests')}>
          {user.role === 'MECHANIC' ? 'My Jobs' : 'Service Requests'}
        </button>
        {user.role !== 'MECHANIC' && <button onClick={() => setPage('vehicles')}>Vehicles</button>}
        <span className="right">{user.name} ({user.role})</span>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="page">
        {page === 'requests' && <Requests user={user} openRequest={openRequest} />}
        {page === 'vehicles' && user.role !== 'MECHANIC' && <Vehicles user={user} />}
        {page === 'detail' && (
          <RequestDetail user={user} requestId={requestId} goBack={() => setPage('requests')} />
        )}
      </div>
    </div>
  )
}

export default App
