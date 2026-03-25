// src/lib/axios.ts

import { config } from '@/config/environment'
import { applySecurityHeaders } from '@/utils/securityHeaders'
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

// La URL base para el ejemplo de JSONPlaceholder.
// Ahora usa la configuración segura que funciona tanto en servidor como en cliente.
const baseURL = config.apiBaseUrl

// Crear una instancia de Axios
const httpClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  headers: applySecurityHeaders({
    'Content-Type': 'application/json',
  }),
})

// Interceptor de Solicitudes (Request)
// NOTA: Este interceptor se deja como ejemplo de cómo añadir un token.
// Como JSONPlaceholder no requiere autenticación, no se usará activamente en nuestra llamada.
// Para que esto funcione, el token debería ser leído desde un lugar accesible
// fuera de los componentes React, como directamente de document.cookie si es necesario.
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // En una app real, podrías leer la cookie aquí si es necesario
    // const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config
  },
  (error: AxiosError) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptor de Respuestas (Response)
httpClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Procesar la respuesta antes de devolverla
    return response
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response
      console.error(`HTTP Error ${status}:`, data)

      // Ejemplo de manejo de errores comunes
      switch (status) {
        case 401:
          console.error('Unauthorized. Redirecting to login...')
          // En un proyecto real, esto debería limpiar el estado de autenticación
          // y redirigir. La redirección en un interceptor es delicada.
          // Es mejor que la lógica de la UI maneje la redirección al recibir el error 401.
          if (typeof window !== 'undefined') {
            // window.location.href = '/login'; // Esta es una redirección dura
          }
          break
        case 403:
          console.error('Forbidden access.')
          break
        case 404:
          console.error('Resource not found.')
          break
        case 500:
          console.error('Internal server error.')
          break
        default:
          break
      }
    } else if (error.request) {
      console.error('Network Error: No response received from server.', error.request)
    } else {
      console.error('Axios Error:', error.message)
    }

    return Promise.reject(error)
  }
)

export default httpClient
