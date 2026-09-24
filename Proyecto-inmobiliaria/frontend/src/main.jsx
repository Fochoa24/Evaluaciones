import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { prepararDatosDemo } from './services/semilla.js';
import './styles/styles.css';
import './styles/responsive.css';

prepararDatosDemo();

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>
);
