import axios from 'axios'
import { env } from '../config/env.js'
import { getAccessToken } from './tokenStorage.js'

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

export const getApiErrorMessage = (error) =>
  error?.response?.data?.error?.message || error?.message || 'Something went wrong. Please try again.'
