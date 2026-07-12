import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/sora/400.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/newsreader/500.css'
import '@fontsource/newsreader/600.css'
import App from './App.jsx'
import AppProviders from './app/AppProviders.jsx'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </StrictMode>,
)
