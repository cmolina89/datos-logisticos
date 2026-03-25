import { useAtomValue, useSetAtom } from 'jotai'
import { Accordion, AccordionTab } from 'primereact/accordion' // <-- 1. Importar Accordion
import { Message } from 'primereact/message'
import { ProgressSpinner } from 'primereact/progressspinner'
// src/features/postsFeature/pages/PostsListPage.tsx
import type React from 'react'
import { useEffect } from 'react'
import PostCard from '../components/PostCard'
import { loadPostsAtom, postsAtom, postsErrorAtom, postsStatusAtom } from '../store/postsAtoms'
import './PostsListPage.scss'

const PostsListPage: React.FC = () => {
  const posts = useAtomValue(postsAtom)
  const status = useAtomValue(postsStatusAtom)
  const error = useAtomValue(postsErrorAtom)
  const loadPosts = useSetAtom(loadPostsAtom)

  // Cargar los posts cuando el componente se monta
  useEffect(() => {
    // Solo carga si el estado es 'idle' para no recargar en cada render
    if (status === 'idle') {
      loadPosts()
    }
  }, [loadPosts, status])

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="spinner-container">
          <ProgressSpinner />
        </div>
      )
    }
    if (status === 'failed') {
      return <Message severity="error" text={error || 'No se pudieron cargar los posts.'} />
    }
    if (status === 'succeeded' && posts.length > 0) {
      return (
        <div className="posts-grid">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )
    }
    // Para el caso de 'succeeded' pero sin posts
    if (status === 'succeeded' && posts.length === 0) {
      return <Message severity="info" text="No se encontraron posts." />
    }
    // Estado inicial 'idle'
    return null
  }

  return (
    <div className="container posts-list-page">
      <header>
        <h1>Lista de Posts</h1>
        <p>Ejemplo de consumo de API con Axios y manejo de estado con Jotai.</p>
      </header>

      {/* 2. Sección de Documentación con Accordion */}
      <Accordion className="mb-4">
        <AccordionTab header="¿Cómo Funciona esta Página? (Arquitectura de la Feature)">
          <div className="p-text-left">
            <p>
              Esta página es un ejemplo práctico de cómo construir una "feature" siguiendo el
              estándar. La lógica está organizada en varias partes dentro de{' '}
              <code>src/features/postsFeature/</code>:
            </p>
            <ol>
              <li className="p-mb-2">
                <strong>
                  1. Servicio de API (<code>api/postsService.ts</code>):
                </strong>
                <ul>
                  <li>
                    Define la función <code>fetchPosts</code> que utiliza la instancia de{' '}
                    <strong>Axios</strong> configurada en <code>src/lib/httpClient.ts</code> para
                    realizar la petición GET a{' '}
                    <code>https://jsonplaceholder.typicode.com/posts</code>.
                  </li>
                  <li>Esta capa se encarga exclusivamente de la comunicación con el backend.</li>
                </ul>
              </li>
              <li className="p-mb-2">
                <strong>
                  2. Manejo de Estado (<code>store/postsAtoms.ts</code>):
                </strong>
                <ul>
                  <li>
                    Utilizamos <strong>Jotai</strong> para manejar el estado de esta feature de
                    forma atómica.
                  </li>
                  <li>
                    <code>postsStateAtom</code>: Es el átomo principal que contiene la lista de
                    posts, el estado de la petición (
                    <code>'idle' | 'loading' | 'succeeded' | 'failed'</code>) y cualquier mensaje de
                    error.
                  </li>
                  <li>
                    <code>loadPostsAtom</code>: Es un "átomo de escritura" asíncrono. Al llamarlo,
                    este átomo cambia el estado a 'loading', ejecuta la llamada a la API a través de{' '}
                    <code>fetchPosts</code>, y finalmente actualiza <code>postsStateAtom</code> con
                    los datos o con un error.
                  </li>
                </ul>
              </li>
              <li className="p-mb-2">
                <strong>
                  3. Componentes y UI (<code>pages/PostsListPage.tsx</code> y{' '}
                  <code>components/</code>):
                </strong>
                <ul>
                  <li>
                    Este componente de página utiliza los hooks de Jotai (<code>useAtomValue</code>,{' '}
                    <code>useSetAtom</code>) para suscribirse al estado y para disparar la acción de
                    carga.
                  </li>
                  <li>
                    Un <code>useEffect</code> llama a <code>loadPosts()</code> cuando el componente
                    se monta por primera vez (si el estado es 'idle').
                  </li>
                  <li>
                    Dependiendo del valor de <code>status</code> (leído desde{' '}
                    <code>postsStatusAtom</code>), el componente renderiza condicionalmente un
                    spinner de carga, un mensaje de error, o la lista de posts (mapeando sobre el
                    array de <code>postsAtom</code> y renderizando un <code>PostCard</code> para
                    cada uno).
                  </li>
                </ul>
              </li>
            </ol>
            <p>
              {
                'Este patrón (Servicio API -> Estado Atómico -> UI Reactiva) crea un flujo de datos unidireccional, predecible y fácil de depurar, manteniendo cada parte de la lógica bien separada.'
              }
            </p>
          </div>
        </AccordionTab>
      </Accordion>

      {/* 3. Contenido de la página (lista de posts, spinner o error) */}
      {renderContent()}
    </div>
  )
}

export default PostsListPage
