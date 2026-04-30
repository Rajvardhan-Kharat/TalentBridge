import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: 1 } } })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#1a1a26', color: '#f1f5f9', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '12px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#1a1a26' } },
              error:   { iconTheme: { primary: '#ef4444', secondary: '#1a1a26' } },
            }}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
)
