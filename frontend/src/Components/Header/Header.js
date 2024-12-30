import React from "react";
import "./Header.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
// import { Socket } from "socket.io-client";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080");
const Header = () => {
  const location = useLocation();
  const username = location.state?.username;

  const handleGlobal = () => {
    socket.emit("join room", { room: global });
  };

  return (
    <>
      <h1>Welcome {username}</h1>
      <header>
        <nav className="navigation">
          <ul>
            <li onClick={handleGlobal}>Global</li>
            <li>About</li>
            <li>List</li>
          </ul>
        </nav>
      </header>
    </>
  );
};

export default Header;
