import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState(location.pathname);

  // Функция для обработки вибрации с разными стилями
  const triggerHapticFeedback = (style = 'light') => {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
    }
  };

  const handleClick = (path, style) => {
    setActiveItem(path);
    triggerHapticFeedback(style); // Вызов вибрации при нажатии
  };

  return (
    <div className="bottom-nav">
      {/* Home */}
      <Link
        to="/"
        className={`nav-item ${activeItem === '/' ? 'active' : ''}`}
        onClick={() => handleClick('/', 'medium')}
      >
        <svg viewBox="0 0 320 512" xmlns="http://www.w3.org/2000/svg" fill={activeItem === '/' ? 'white' : 'rgba(255, 255, 255, 0.7)'}>
          <path d="M105.1 224H80C71.12 224 64 231.1 64 240v32c0 8.875 7.125 15.1 16 15.1L96 288v5.5C96 337.5 91.88 380.1 72 416h176C228.1 380.1 224 337.5 224 293.5V288l16-.0001c8.875 0 16-7.125 16-15.1v-32C256 231.1 248.9 224 240 224h-25.12C244.3 205.6 264 173.2 264 136C264 78.5 217.5 32 159.1 32S56 78.5 56 136C56 173.2 75.74 205.6 105.1 224zM272 448H47.1C21.49 448 0 469.5 0 495.1C0 504.8 7.163 512 16 512h288c8.837 0 16-7.163 16-16C320 469.5 298.5 448 272 448z"/>
        </svg>
        Home
      </Link>

      {/* Leaderboard */}
      <Link
        to="/leaderboard"
        className={`nav-item ${activeItem === '/leaderboard' ? 'active' : ''}`}
        onClick={() => handleClick('/leaderboard', 'medium')}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill={activeItem === '/leaderboard' ? 'white' : 'rgba(255, 255, 255, 0.7)'}>
          <path d="M22,7H16.333V4a1,1,0,0,0-1-1H8.667a1,1,0,0,0-1,1v7H2a1,1,0,0,0-1,1v8a1,1,0,0,0,1,1H22a1,1,0,0,0,1-1V8A1,1,0,0,0,22,7ZM7.667,19H3V13H7.667ZM14.333,8V19H9.667V5h4.666ZM21,19H16.333V9H21Z"/>
        </svg>
        Leaderboard
      </Link>

      {/* Profile */}
      <Link
        to="/profile"
        className={`nav-item ${activeItem === '/profile' ? 'active' : ''}`}
        onClick={() => handleClick('/profile', 'medium')}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill={activeItem === '/profile' ? 'white' : 'rgba(255, 255, 255, 0.7)'}>
          <ellipse cx="12" cy="8" rx="5" ry="6"/>
          <path d="M21.8,19.1c-0.9-1.8-2.6-3.3-4.8-4.2c-0.6-0.2-1.3-0.2-1.8,0.1c-1,0.6-2,0.9-3.2,0.9s-2.2-0.3-3.2-0.9C8.3,14.8,7.6,14.7,7,15c-2.2,0.9-3.9,2.4-4.8,4.2C1.5,20.5,2.6,22,4.1,22h15.8C21.4,22,22.5,20.5,21.8,19.1z"/>
        </svg>
        Profile
      </Link>

      {/* MarketPlace */}
      <Link
        to="/marketplace"
        className={`nav-item ${activeItem === '/marketplace' ? 'active' : ''}`}
        onClick={() => handleClick('/marketplace', 'medium')}
      >
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill={activeItem === '/marketplace' ? 'white' : 'rgba(255, 255, 255, 0.7)'}>
          <path d="M31.4,11.2l-3-3.998c-0.117-0.157-0.256-0.293-0.4-0.423V2c0-1.104-0.896-2-2-2H6C4.895,0,4,0.896,4,2v4.78C3.856,6.909,3.717,7.044,3.6,7.2l-2.999,3.999C0.213,11.715,0,12.354,0,13v1c0,1.654,1.346,3,3,3h0v13c0,1.104,0.896,2,2,2h22c1.104,0,2-0.896,2-2V17l0,0c1.654,0,3-1.346,3-3v-1C32,12.354,31.787,11.715,31.4,11.2z M26,2v4H6h0V2H26z M10.193,15H6.004l4-7h2.189L10.193,15z M13.234,8H15.5v7h-4.266L13.234,8z M16.5,8h2.266l2,7H16.5V8z M19.805,8h2.189l4,7h-4.189L19.805,8z M2,14v-1c0-0.217,0.07-0.427,0.2-0.6l3-4C5.389,8.148,5.685,8,6,8h2.852l-4,7H3C2.448,15,2,14.553,2,14z M20,30h-7.5V20H20V30z M27,30h-6V20c0-0.553-0.449-1-1-1h-7.5c-0.552,0-1,0.447-1,1v10H5V17h22V30z M30,14c0,0.553-0.447,1-1,1h-1.854l-4-7H26l0,0c0.314,0,0.611,0.148,0.799,0.4l3,4C29.93,12.573,30,12.783,30,13V14z"/>
        </svg>
        MarketPlace
      </Link>
    </div>
  );
};

export default BottomNav;
