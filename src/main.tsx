// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
// import React from 'react';


createRoot(document.getElementById('root')!).render(
  //removed strictmode when in production, as it causes double rendering of components, which stops websocket connections from working properly (closing immediately after opening)
  // <React.StrictMode>
  <BrowserRouter>
    <App />
  </BrowserRouter>
// </React.StrictMode>,
)
