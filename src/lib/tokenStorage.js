export const ACCESS_TOKEN_KEY = 'fundbloom.accessToken'

export const getAccessToken = () => window.localStorage.getItem(ACCESS_TOKEN_KEY)

export const saveAccessToken = (token) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const clearAccessToken = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}
