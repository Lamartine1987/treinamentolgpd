import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Map from './pages/Map';
import Lesson from './pages/Lesson';
import Certificate from './pages/Certificate';
import Admin from './pages/Admin';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is stored locally
    const storedUser = localStorage.getItem('lgpd_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleUpdateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('lgpd_user', JSON.stringify(userData));
  };

  return (
    <Router>
      <Routes>
        <Route path="/admin" element={user ? <Admin user={user} /> : <Navigate to="/" />} />
        
        <Route path="*" element={
          <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'white', boxShadow: '0 0 20px rgba(0,0,0,0.1)' }}>
            <Routes>
              <Route path="/" element={!user ? <Home onLogin={handleUpdateUser} /> : <Navigate to="/map" />} />
              <Route path="/map" element={user ? <Map user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/" />} />
              <Route path="/lesson/:moduleId" element={user ? <Lesson user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/" />} />
              <Route path="/certificate" element={user ? <Certificate user={user} /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
