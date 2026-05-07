import { Toaster } from 'react-hot-toast'
import AppRoutes from './app/router/AppRoutes'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
            borderRadius: '16px',
          },
          success: {
            iconTheme: { primary: '#3b82f6', secondary: '#fff' },
          },
        }}
      />
      <AppRoutes />
    </>
  )
}

export default App