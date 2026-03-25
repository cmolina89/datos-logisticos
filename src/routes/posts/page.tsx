import SEOHead from '@/components/common/SEOHead/SEOHead'
import { ProgressSpinner } from 'primereact/progressspinner'
import React, { Suspense } from 'react'
// src/routes/posts/page.tsx
import withAuthentication from '@/features/authFeature/components/withAuthentication'
import type { MetaData } from '@/types/globals'

const PostsListPageContent = React.lazy(() => import('@/features/postsFeature/pages/PostsListPage'))
const ProtectedPostsPage = withAuthentication(PostsListPageContent)

// Configura los metadatos para la página usando tu tipo global
export const meta = (): MetaData => ({
  title: 'Posts Recientes - CoppelFramework',
  description:
    'Explora la lista de posts recientes en nuestra plataforma. Contenido actualizado y relevante.',
  keywords: 'posts, artículos, contenido, blog, CoppelFramework',
})

export default function PostsRoute() {
  return (
    <>
      <SEOHead
        title="Posts Recientes - CoppelFramework"
        description="Explora la lista de posts recientes en nuestra plataforma. Contenido actualizado y relevante para desarrolladores."
        keywords="posts, artículos, contenido, blog, CoppelFramework, desarrollo"
        url="https://coppelframework.com/posts"
      />
      <Suspense
        fallback={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <ProgressSpinner aria-label="Cargando lista de posts" />
          </div>
        }
      >
        <ProtectedPostsPage />
      </Suspense>
    </>
  )
}
