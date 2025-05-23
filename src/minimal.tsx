import React from 'react';
import { createRoot } from 'react-dom/client';

// Try to get the root element
const rootElement = document.getElementById('root');

// If there's no root element, create one
if (!rootElement) {
  const newRoot = document.createElement('div');
  newRoot.id = 'root';
  document.body.appendChild(newRoot);
}

// The simplest possible component
const MinimalApp = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Minimal React App</h1>
      <p>This is a minimal React app with no dependencies.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

// Try to render
try {
  const root = createRoot(document.getElementById('root')!);
  root.render(<MinimalApp />);
} catch (error) {
  document.body.innerHTML = `
    <div style="padding: 20px; color: red; font-family: sans-serif;">
      <h1>React Error</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <pre>${error instanceof Error && error.stack ? error.stack : 'No stack trace'}</pre>
    </div>
  `;
} 