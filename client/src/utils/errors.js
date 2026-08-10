export function getErrorMessage(error) {
  if (!error) return 'Something went wrong'

  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Cannot connect to the server. Please check your connection.'
  }

  if (error.response) {
    const { status, data } = error.response
    const serverMsg =
      data?.message || data?.error || data?.details ||
      (typeof data === 'string' ? data : null)

    if (status === 401) return 'Session expired. Please sign in again.'
    if (status === 400) return serverMsg || 'Invalid request. Please check your input.'
    if (status === 404) return serverMsg || 'The requested resource was not found.'
    if (status === 500) return 'Server error. Please try again later.'
    if (status >= 500) return 'Something went wrong on our end. Please try again.'
    if (status >= 400) return serverMsg || 'Request failed. Please try again.'
  }

  return error.message || 'An unexpected error occurred'
}
