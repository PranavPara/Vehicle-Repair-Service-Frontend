// The address of our Spring Boot backend.
// When deployed, Render gives the real address in VITE_API_URL. On your PC it is localhost.
export const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// The steps of a repair, in order
export const STEPS = ['REPORTED', 'DIAGNOSIS', 'ESTIMATE', 'APPROVED', 'REPAIR', 'COMPLETED', 'DELIVERED']

// When something fails, this finds the message to show on the screen
export function getError(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  return 'Cannot connect to the server. Is the backend running?'
}
