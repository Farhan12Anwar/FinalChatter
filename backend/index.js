require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 8000;
const SOCKET_PORT = 8080;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // The origin of your React app
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.static("public"));

let users = 0;

// Socket.io Logic
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join room", async (data) => {
    const { room, username } = data;
    console.log(`User ${username} joined room: ${room}`);

    socket.join(room);
    users++;
    console.log(`Total users in ${room}: ${users}`);
  });

  socket.on("chat message", (msg) => {
    const { room, text, sender } = msg;
    if (room) {
      io.to(room).emit("chat message", { sender, text }); // Emit message only to the specified room
    }
  });

  socket.on("create room", (newRoom, creator) => {
    const rooms = Array.from(io.sockets.adapter.rooms.keys());

    if (!rooms.includes(newRoom)) {
      socket.join(newRoom);
      socket.emit("room created", newRoom);
      io.emit("rooms list", rooms.concat(newRoom));
    } else {
      socket.emit("room exists", newRoom);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    users--;
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start the servers
app.listen(PORT, () => console.log(`API Server Listening on Port ${PORT}`));
server.listen(SOCKET_PORT, () => console.log(`Socket.io Listening on Port ${SOCKET_PORT}`));
