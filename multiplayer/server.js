import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const players = {};

io.on('connection', (socket) => {
  console.log(`[+] Player connected: ${socket.id}`);

  // When a player joins the world
  socket.on('join_world', (userData) => {
    players[socket.id] = {
      id: socket.id,
      name: userData.name || 'Anonymous',
      characterType: userData.characterType || 'robot',
      position: { x: 0, y: 0, z: 0 },
      rotation: { y: 0 },
      ...userData
    };
    
    // Tell the new player about all existing players
    socket.emit('current_players', players);
    
    // Tell everyone else about the new player
    socket.broadcast.emit('player_joined', players[socket.id]);
  });

  // When a player moves
  socket.on('move', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].position = movementData.position;
      players[socket.id].rotation = movementData.rotation;
      players[socket.id].isWalking = movementData.isWalking;
      
      // Broadcast to all OTHER players
      socket.broadcast.emit('player_moved', players[socket.id]);
    }
  });

  // Chat messages (3D Bubbles)
  socket.on('chat_message', (msg) => {
    console.log(`[CHAT] ${players[socket.id]?.name}: ${msg.text}`);
    io.emit('chat_received', {
      id: socket.id,
      name: players[socket.id]?.name || 'Anonymous',
      message: msg.text,
      timestamp: Date.now()
    });
  });

  // WebRTC Signaling for Voice Chat
  socket.on('webrtc_offer', (data) => {
    socket.to(data.target).emit('webrtc_offer', {
      sender: socket.id,
      sdp: data.sdp
    });
  });

  socket.on('webrtc_answer', (data) => {
    socket.to(data.target).emit('webrtc_answer', {
      sender: socket.id,
      sdp: data.sdp
    });
  });

  socket.on('webrtc_ice_candidate', (data) => {
    socket.to(data.target).emit('webrtc_ice_candidate', {
      sender: socket.id,
      candidate: data.candidate
    });
  });

  socket.on('disconnect', () => {
    console.log(`[-] Player disconnected: ${socket.id}`);
    delete players[socket.id];
    io.emit('player_left', socket.id);
  });
});

async function startServer() {
  const port = process.env.PORT || 3002;
  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Dunia Alxzy Multiplayer Server running on port ${port}`);
  });
}

startServer();
