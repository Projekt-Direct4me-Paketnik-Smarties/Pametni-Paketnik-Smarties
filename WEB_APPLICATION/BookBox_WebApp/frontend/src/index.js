import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { UserContext } from "./userContext.js";
import './index.css'
import App from './App.js'


createRoot(document.getElementById('root')).render(
  <StrictMode>
        

        
      <App />
  </StrictMode>,
)
