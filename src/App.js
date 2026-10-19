import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Lobby from './components/Lobby/Lobby';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Profile from './components/Profile/Profile';
import BottomNav from './components/BottomNav/BottomNav';
import SplashScreen from './components/SplashScreen/SplashScreen';
import './App.css';
import MarketPlace from './components/MarketPlace/MarketPlace';

function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
  const [resetLobbyState, setResetLobbyState] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location.pathname !== '/') {
      setResetLobbyState(true);
    } else {
      setResetLobbyState(false);
    }
  }, [location]);

  return (
    <div className="App">
      {isSplashVisible ? (
        <SplashScreen />
      ) : (
        <>
          <Routes>
            <Route
              path="/"
              element={
                <Lobby
                  setBottomNavVisible={setIsBottomNavVisible}
                  resetLobbyState={resetLobbyState}
                />
              }
            />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/marketplace" element={<MarketPlace />} />

          </Routes>
          {isBottomNavVisible && <BottomNav />}
        </>
      )}
    </div>
  );
}

export default App;
