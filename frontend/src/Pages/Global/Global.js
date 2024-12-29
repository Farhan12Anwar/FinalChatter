import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Global.css";
import Header from "../../Components/Header/Header";

const socket = io("http://localhost:8080"); // Corrected socket connection URL

const Global = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Prompt the user to set their username only once
    if (!username) {
      const name = prompt("Enter your username:");
      setUsername(name || "Anonymous"); // Default to "Anonymous" if the user cancels or leaves blank
    }

    // Listen for messages from the server
    socket.on("chat message", (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    // Clean up the listener on component unmount
    return () => {
      socket.off("chat message");
    };
  }, [username]); // Depend only on `username`

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = { sender: username, text: message };
      socket.emit("chat message", newMessage); // Send the message to the server
      setMessage(""); // Clear input field
    }
  };

  return (
    <div className="App">
      <Header />
      <h1>Global Chat</h1>
      <div id="chat-window">
        <ul id="messages">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={
                msg.sender === username ? "my-message" : "other-message"
              }
            >
              <span className="sender">{msg.sender}</span>
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
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
      <h1>
        To Connect to different channels, enter in chat '/' followed by the
        channel name
      </h1>
    </div>
  );
};

export default Global;
