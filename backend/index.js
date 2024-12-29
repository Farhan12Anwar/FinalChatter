require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const socketIo = require("socket.io");
const http = require("http");

const app = express();
const PORT = 8000;

const server = http.createServer(app);
const io = socketIo(8080, {
  cors: {
    origin: "http://localhost:3000", // The origin of your React app
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(express.static("public"));

// Handle socket connections
io.on("connection", (socket) => {
  console.log("A user connected");

  // Broadcast chat message to all connected clients
  socket.on("chat message", (msg) => {
    io.emit("chat message", msg);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

mongoose
  .connect(
    "mongodb+srv://anwarfarhan339:7btRGnUp8Vn0UiQA@cluster0.wqknr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log("Server Listening on Port 8000");
});
