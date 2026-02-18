import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';

const rootEl = document.getElementById('root');
if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App req={{ url: window.location.pathname }} />
      </ErrorBoundary>
    </StrictMode>,
  );
}
