// Entry point for the Vite + React application.
// Responsibilities:
// - Import global styles.
// - Mount the root React component into #root.
// - Enable React StrictMode for dev-time checks.
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
