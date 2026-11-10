import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'
import { StickyWindow } from './components/sticky/StickyWindow'

// Stesso bundle per la finestra principale e per i post-it: è l'URL a decidere la vista.
const params = new URLSearchParams(window.location.search)
const stickyId = params.get('mode') === 'sticky' ? params.get('id') : null

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>{stickyId ? <StickyWindow noteId={stickyId} /> : <App />}</StrictMode>,
)
