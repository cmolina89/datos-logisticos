// src/features/postsFeature/api/postsService.ts
import httpClient from '@/lib/httpClient'
import type { Post } from '../types'

export const fetchPosts = async (): Promise<Post[]> => {
  // Usamos la instancia de Axios configurada
  const response = await httpClient.get<Post[]>('/posts')
  // Limitar a los primeros 5 para no saturar la UI
  return response.data.slice(0, 5)
}
