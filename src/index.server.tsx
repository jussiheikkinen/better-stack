import ReactDOMServer from 'react-dom/server';
import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';

export function render(url: string) {
  return ReactDOMServer.renderToString(
    <ErrorBoundary>
      <App req={{ url }} />
    </ErrorBoundary>,
  );
}
