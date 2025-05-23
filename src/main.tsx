import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Get the basename from import.meta.env.BASE_URL for GitHub Pages
const basename = import.meta.env.BASE_URL

const root = createRoot(document.getElementById('root')!)

root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
