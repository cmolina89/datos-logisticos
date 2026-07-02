// src/lib/axios.ts

import { config } from '@/config/environment'
import { applySecurityHeaders, validateSecurityHeaders } from '@/utils/securityHeaders'
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

const createClient = (baseURL: string): AxiosInstance => {
  const client: AxiosInstance = axios.create({
    baseURL,
    timeout: 10000,
    headers: applySecurityHeaders({
      'Content-Type': 'application/json',
    }),
  })

  client.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      return requestConfig
    },
    (error: AxiosError) => {
      console.error('Request Error:', error)
      return Promise.reject(error)
    }
  )

  client.interceptors.response.use(
    (response: AxiosResponse) => {
      try {
        validateSecurityHeaders(response as unknown as Response)
      } catch (error) {
        console.error('Security headers validation error:', error)
      }

      return response
    },
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response
        console.error(`HTTP Error ${status}:`, data)

        switch (status) {
          case 401:
            console.error('Unauthorized access.')
            break
          case 403:
            console.error('Forbidden access.')
            break
          case 404:
            console.error('Resource not found.')
            break
          case 500:
            console.error('Server error.')
            break
          default:
            break
        }
      } else if (error.request) {
        console.error('Network Error: No response received.', error.request)
      } else {
        console.error('Axios Error:', error.message)
      }

      return Promise.reject(error)
    }
  )

  return client
}

export const httpClient = createClient(config.apiBaseUrl)
export const configHttpClient = createClient(config.configApiBaseUrl)

export default httpClient
