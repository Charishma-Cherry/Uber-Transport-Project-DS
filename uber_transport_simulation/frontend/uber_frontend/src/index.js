// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.render(
  <React.StrictMode>
    <Router> {/* Wrap the whole app here */}
      <App />
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
