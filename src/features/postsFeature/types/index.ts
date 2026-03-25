// src/features/postsFeature/types/index.ts
export interface Post {
  id: number // JSONPlaceholder usa number para id
  userId: number
  title: string
  body: string
}

export interface PostsState {
  posts: Post[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}
