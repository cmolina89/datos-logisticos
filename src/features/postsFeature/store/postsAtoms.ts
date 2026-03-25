// src/features/postsFeature/store/postsAtoms.ts
import { atom } from 'jotai'
import { fetchPosts } from '../api/postsService'
import type { PostsState } from '../types'

// Átomo principal para el estado de los posts
export const postsStateAtom = atom<PostsState>({
  posts: [],
  status: 'idle',
  error: null,
})

// Átomos derivados para un acceso más fácil
export const postsAtom = atom(get => get(postsStateAtom).posts)
export const postsStatusAtom = atom(get => get(postsStateAtom).status)
export const postsErrorAtom = atom(get => get(postsStateAtom).error)

// Átomo de "solo escritura" para cargar los posts.
// Este es el corazón de la lógica de carga.
export const loadPostsAtom = atom(
  null, // Este átomo no tiene un valor de "lectura" directo
  async (get, set) => {
    const currentStatus = get(postsStateAtom).status
    if (currentStatus === 'loading') {
      return // Prevenir cargas múltiples
    }

    try {
      set(postsStateAtom, prev => ({
        ...prev,
        status: 'loading',
        error: null,
      }))
      const posts = await fetchPosts()
      set(postsStateAtom, { posts, status: 'succeeded', error: null })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      set(postsStateAtom, prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
      }))
    }
  }
)
