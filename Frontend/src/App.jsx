import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import VideoRoom from './pages/VideoRoom';
import ScheduleMeeting from './pages/ScheduleMeeting';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<VideoRoom />} />
          <Route path="/schedule" element={<ScheduleMeeting />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
