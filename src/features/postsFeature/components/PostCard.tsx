import { Card } from 'primereact/card'
// src/features/postsFeature/components/PostCard.tsx
import type React from 'react'
import type { Post } from '../types'
import './PostCard.scss' // Importamos el SCSS

interface PostCardProps {
  post: Post
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <article className="post-card">
      <Card
        title={post.title}
        className="post-card-content"
        pt={{
          title: {
            'aria-level': 3,
            role: 'heading',
          },
        }}
      >
        <p className="post-body">{post.body}</p>
        <div className="sr-only">
          Post número {post.id} de {post.userId ? `usuario ${post.userId}` : 'usuario desconocido'}
        </div>
      </Card>
    </article>
  )
}

export default PostCard
