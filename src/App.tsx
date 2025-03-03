import React from "react";
// import logo from './logo.svg';
// import './App.css';
import AuthForm from "./Auth";
import ChatRoom from "./ChatRoom";
import Queue from "./Queue";
import { Route, Routes } from "react-router-dom";
import Navbar from "./NavBar";
// import Navbar from "./Navbar"

const App: React.FC = () => {
  return (
    <div className="bg-white min-h-screen w-full">
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/" element={<Navbar />}>
          <Route path="/chat" element={<ChatRoom />} />
          <Route path="/queue" element={<Queue />} />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
