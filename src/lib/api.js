import axios from 'axios'
import { env } from '../config/env.js'
import { clearAccessToken, getAccessToken } from './tokenStorage.js'

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
})

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken()

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) clearAccessToken()
    return Promise.reject(error)
  },
)

export const getApiErrorMessage = (error) =>
  error?.response?.data?.error?.message || error?.message || 'Something went wrong. Please try again.'
