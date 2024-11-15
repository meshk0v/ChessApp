// src/components/SplashScreen/SplashScreen.js
import React, { useEffect } from 'react';
import Lottie from 'react-lottie';
import animationData from '../../assets/loading.json';
import './SplashScreen.css';

const SplashScreen = () => {
  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.ready();
    tg.expand();
    tg.disableVerticalSwipes();
  });

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

return (
  <div className="splash-screen">
    <Lottie options={defaultOptions} height={350} width={350} className="lottie-animation" />
  </div>
);

};

export default SplashScreen;
