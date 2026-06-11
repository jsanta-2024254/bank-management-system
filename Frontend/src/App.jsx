import { Toaster } from 'react-hot-toast'
import AppRoutes from './app/router/AppRoutes'

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#fffaf0',
            color: '#3b2a14',
            border: '1px solid rgba(184, 132, 38, 0.36)',
            borderRadius: '18px',
            boxShadow: '0 18px 50px rgba(92, 64, 19, 0.16)',
          },
          success: {
            iconTheme: { primary: '#9a6b16', secondary: '#fffaf0' },
          },
          error: {
            iconTheme: { primary: '#b91c1c', secondary: '#fffaf0' },
          },
        }}
      />

      <AppRoutes />
    </>
  )
}

export default App