import '@ant-design/v5-patch-for-react-19';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'

const CLIENT_ID = "669722085806-tndlq599pij9qj6bt3g3psh2f2ce7mu0.apps.googleusercontent.com"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
