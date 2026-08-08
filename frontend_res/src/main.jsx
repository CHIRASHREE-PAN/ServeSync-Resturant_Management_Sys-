import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { CustomerSessionProvider } from './context/CustomerSessionContext';
import { CartProvider } from './context/CartContext';
import './index.css';
import './styles/theme.css';

const rootElement = document.getElementById('root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CustomerSessionProvider>
            <CartProvider>
              <BrowserRouter>
                <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-background text-sm text-secondary-text">Loading experience…</div>}>
                  <App />
                </Suspense>
                <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
              </BrowserRouter>
            </CartProvider>
          </CustomerSessionProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
