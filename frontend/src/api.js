// The address of our Spring Boot backend
export const API = 'http://localhost:8080/api'

// The steps of a repair, in order
export const STEPS = ['REPORTED', 'DIAGNOSIS', 'ESTIMATE', 'APPROVED', 'REPAIR', 'COMPLETED', 'DELIVERED']

// When something fails, this finds the message to show on the screen
export function getError(error) {
  if (error.response && error.response.data && error.response.data.message) {
    return error.response.data.message
  }
  return 'Cannot connect to the server. Is the backend running?'
}
