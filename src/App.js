import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import Lobby from './components/Lobby/Lobby';
import Lobby from './components/Board/Board';
import Leaderboard from './components/Leaderboard/Leaderboard';
import Profile from './components/Profile/Profile';
import BottomNav from './components/BottomNav/BottomNav';
import SplashScreen from './components/SplashScreen/SplashScreen';
import './App.css';

function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(false);
  const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
   <div className="App">
     <Router>
       {isSplashVisible ? (
          <SplashScreen />
      ) : (
          <>
            <Routes>
              <Route path="/" element={<Lobby setBottomNavVisible={setIsBottomNavVisible} />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            {isBottomNavVisible && <BottomNav />}
          </>
        )}
      </Router>
      </div>

  );
}

export default App;
