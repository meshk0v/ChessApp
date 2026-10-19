import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import axios from 'axios';

// Подписанные данные Telegram — бэкенд по ним проверяет, кто делает запрос
axios.defaults.headers.common['X-Telegram-Init-Data'] = window.Telegram?.WebApp?.initData || '';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
