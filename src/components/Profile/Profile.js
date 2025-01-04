import React, { useState, useEffect } from 'react';
import './Profile.css';
import GameHistory from './GameHistory';
import { TonConnectButton, TonConnectUIProvider } from '@tonconnect/ui-react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState(null); // Данные пользователя
  const [showHistory, setShowHistory] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Режим редактирования
  const [newUsername, setNewUsername] = useState(''); // Новое имя пользователя
  const userId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  console.log(userData);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Получаем данные пользователя
        const response = await axios.get(`/api/users/${userId}`);
        setUserData(response.data);
        setNewUsername(response.data.username || ''); // Заполняем поле для редактирования
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const openGameHistory = () => {
    setShowHistory(true);
  };

  const closeGameHistory = () => {
    setShowHistory(false);
  };

  const handleEditClick = () => {
    setIsEditing(true); // Включаем режим редактирования
  };

const handleSaveClick = async () => {
  try {
    // Проверка на пустое имя
    if (!newUsername.trim()) {
      alert('Имя не может быть пустым.');
      return;
    }

    // Отправляем данные на сервер
    const response = await axios.put(`/api/users/${userId}`, { username: newUsername.trim() });

    if (response.status === 200) {
      setUserData((prev) => ({ ...prev, username: newUsername.trim() })); // Обновляем локальные данные
      setIsEditing(false); // Выключаем режим редактирования
      alert('Имя успешно обновлено.');
    }
  } catch (error) {
    console.error('Ошибка при обновлении имени пользователя:', error);

    // Проверяем код ошибки от сервера
    if (error.response && error.response.status === 400) {
      // Если сервер вернул ошибку 400 (имя занято)
      alert('Данное имя уже занято. Попробуйте другое.');
    } else {
      // Для других ошибок
      alert('Не удалось сохранить имя. Попробуйте снова.');
    }
  }
};


  if (showHistory) {
    return <GameHistory onBack={closeGameHistory} />;
  }


  return (
    <TonConnectUIProvider manifestUrl="https://chess-battle.space/tonconnect-manifest.json">
      <div className="profile-container">
        {/* Показываем спиннер, если данные еще загружаются */}
        {!userData && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}
        {userData && (
          <>
            <div className="profile-card">
              <div className="avatar-container">
                {userData.avatar_url ? (
                  <img className="avatar" src={userData.avatar_url} alt="Avatar" />
                ) : (
                  <div className="avatar-placeholder">
                    {userData.username ? userData.username[0] : '?'}
                  </div>
                )}
              </div>

              <div className="user-info">
                {!isEditing ? (
                  <h2 className="username">
                    {userData.username || 'Неизвестный пользователь'}
                    <button className="edit-button" onClick={handleEditClick}>
                      ✏️
                    </button>
                  </h2>
                ) : (
                  <div className="edit-username-container">
                    <input
                      type="text"
                      className="edit-username-input"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                    />
                    <button className="save-button" onClick={handleSaveClick}>
                      Save
                    </button>
                  </div>
                )}
                <div className="rating">
                  {userData.rating?.toLocaleString() || 1200} rank
                </div>
              </div>
            </div>

            {/* Общая статистика */}
            <div className="statistics">
              <div className="stat">
                <div className="stat-label">Games played</div>
                <div className="stat-value">{userData.games_played || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Wins</div>
                <div className="stat-value">{userData.games_won || 0}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Losses</div>
                <div className="stat-value">
                  {(userData.games_played || 0) - (userData.games_won || 0)}
                </div>
              </div>
            </div>

            {/* Кнопка истории */}
            <button className="history-button" onClick={openGameHistory}>
              Game History
            </button>

            {/* Подключение кошелька */}
            <div className="wallet-section">
              <TonConnectButton />
            </div>
          </>
        )}
      </div>
    </TonConnectUIProvider>
  );
};
export default Profile;
