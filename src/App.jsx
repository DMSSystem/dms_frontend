import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeContextProvider>
          <AuthProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: '12px',
                  fontFamily: '"Outfit", "Inter", sans-serif',
                },
                success: {
                  style: {
                    background: '#10B981',
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#10B981',
                  },
                },
                error: {
                  style: {
                    background: '#EF4444',
                    color: '#fff',
                  },
                  iconTheme: {
                    primary: '#fff',
                    secondary: '#EF4444',
                  },
                },
              }}
            />
          </AuthProvider>
        </ThemeContextProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
