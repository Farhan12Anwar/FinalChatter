import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import "./Global.css";
import Header from "../../Components/Header/Header";

const socket = io("http://localhost:8080");

const Global = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [currentRoom, setCurrentRoom] = useState("global");
  const [rooms, setRooms] = useState(["global"]);
  const location = useLocation();
  const username = location.state?.username || "Guest";

  useEffect(() => {
    // Handle room creation
    socket.on("room created", (newRoom) => {
      setRooms((prevRooms) => [...prevRooms, newRoom]);
      setCurrentRoom(newRoom);
    });

    // Handle existing room notification
    socket.on("room exists", (roomName) => {
      alert(`Room ${roomName} already exists.`);
    });

    // Fetch the list of available rooms
    socket.emit("request rooms list");
    socket.on("rooms list", (availableRooms) => {
      setRooms(availableRooms);
    });

    return () => {
      socket.off("room created");
      socket.off("room exists");
      socket.off("rooms list");
    };
  }, []);

  useEffect(() => {
    socket.emit("join room", { room: currentRoom, username });
  }, [currentRoom, username]);

  useEffect(() => {
    // Listen for chat messages
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off("chat message");
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!message.trim()) return;

    if (message.startsWith("/createRoom ")) {
      const newRoom = message.split(" ")[1];
      if (
        newRoom &&
        /^[a-zA-Z0-9]+$/.test(newRoom) &&
        !rooms.includes(newRoom)
      ) {
        socket.emit("create room", newRoom, username);
      } else {
        alert("Invalid room name or room already exists.");
      }
    } else if (message.startsWith("/")) {
      const newRoom = message.substring(1).trim();
      if (newRoom && newRoom !== currentRoom) {
        setCurrentRoom(newRoom);
      }
    } else {
      socket.emit("chat message", {
        sender: username,
        text: message,
        room: currentRoom,
      });
    }

    setMessage("");
  };

  return (
    <div className="App">
      <Header />
      <h1>Current Room: {currentRoom}</h1>

      <div id="chat-window">
        <ul id="messages">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={
                msg.sender === username ? "my-message" : "other-message"
              }
            >
              <span className="sender">{msg.sender}:</span>
              <p className="message-text">{msg.text}</p>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message or /createRoom room_name"
        />
        <button type="submit">Send</button>
      </form>

      <h2>Available Rooms</h2>
      <ul>
        {rooms.map((room, index) => (
          <li key={index} onClick={() => setCurrentRoom(room)}>
            {room}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Global;
