/**
 * React Application Entry Point
 * Renders the main AutoYield AI application with strict mode enabled
 * 
 * @file main.jsx
 * @module frontend
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '../index.css'

// Create root and render the main application
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
