import React from 'react';
// import logo from './logo.svg';
// import './App.css';
import AuthForm from './Auth'
import ChatRoom from './ChatRoom'
import Queue from './Queue'
import {Route, Routes} from 'react-router-dom'
// import Navbar from "./Navbar"

const App: React.FC = ()=>  {
  return (
    <div className="bg-white min-h-screen w-full">
      {/* <ChatRoom /> */}

      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/queue" element={<Queue />} />
      </Routes>
    </div>
  );
}

export default App;



