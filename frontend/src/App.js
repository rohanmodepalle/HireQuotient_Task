import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Chat from './components/Chat';
import './App.css';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <div className="App">
        <header>
          <nav>
            <ul>
              {user ? (
                <>
                  <Chat user={user} setUser={setUser}/>
                  {/* <li><Link to="/chat">Chat</Link></li> */}
                  {/* <li><button onClick={handleLogout}>Logout</button></li> */}
                </>
              ) : (
                <>
                  <li><Link to="/register">Register</Link></li>
                  <li><Link to="/login">Login</Link></li>
                </>
              )}
            </ul>
          </nav>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
  return (
    <div className="home">
      <h1>Welcome to the Chat App</h1>
      <p>Please register or login to continue.</p>
    </div>
  );
}

export default App;
