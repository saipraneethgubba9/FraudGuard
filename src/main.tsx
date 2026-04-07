import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#121212', color: '#fff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
          <h1 style={{ color: '#1DB954', marginBottom: '1rem' }}>FraudGuard</h1>
          <p style={{ color: '#b3b3b3', marginBottom: '0.5rem' }}>Something went wrong:</p>
          <code style={{ background: '#282828', padding: '1rem', borderRadius: '8px', color: '#ff6b6b', maxWidth: '600px', wordBreak: 'break-all' }}>{this.state.error}</code>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
