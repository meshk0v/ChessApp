// src/components/Profile.js
import React, { useEffect } from 'react';
import './Profile.css'; // Импортируем CSS для стилей

const Profile = () => {


  useEffect(() => {
    window.Telegram.WebApp.BackButton.hide(); // Скрываем кнопку "Назад" при размонтировании
  }, []);

    return (
    <div className="profile-container">
      <h2>Soon</h2>
      {/* Ваш контент здесь */}
    </div>
  );
};

export default Profile;
