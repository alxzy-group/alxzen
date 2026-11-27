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
const lastChatAt = new Map();

function sanitizePosition(pos) {
  if (!pos || typeof pos !== 'object') {
    return { x: 0, y: 0, z: 6.0 };
  }
  const x = Number.isFinite(Number(pos.x)) ? Number(pos.x) : 0;
  const y = Number.isFinite(Number(pos.y)) ? Number(pos.y) : 0;
  const z = Number.isFinite(Number(pos.z)) ? Number(pos.z) : 6.0;
  return {
    x: Math.max(-500, Math.min(500, x)),
    y: Math.max(-100, Math.min(200, y)),
    z: Math.max(-500, Math.min(500, z))
  };
}

function sanitizeRotation(rot) {
  if (!rot || typeof rot !== 'object') {
    return { y: 0 };
  }
  const y = Number.isFinite(Number(rot.y)) ? Number(rot.y) : 0;
  return { y };
}

io.on('connection', (socket) => {
  console.log(`[+] Player connected: ${socket.id}`);

  // When a player joins the world
  socket.on('join_world', (userData) => {
    const safeData = userData && typeof userData === 'object' ? userData : {};
    const rawName = typeof safeData.name === 'string' ? safeData.name.trim() : '';
    const rawType = typeof safeData.characterType === 'string' ? safeData.characterType.trim() : '';

    players[socket.id] = {
      id: socket.id,
      name: (rawName || 'Anonymous').slice(0, 32),
      characterType: (rawType || 'robot').slice(0, 24),
      position: sanitizePosition(safeData.position),
      rotation: sanitizeRotation(safeData.rotation),
      isWalking: false,
      isJumping: false
    };

    // Tell the new player about all existing players
    socket.emit('current_players', players);

    // Tell everyone else about the new player
    socket.broadcast.emit('player_joined', players[socket.id]);
  });

  // When a player moves
  socket.on('move', (movementData) => {
    if (!players[socket.id] || !movementData || typeof movementData !== 'object') {
      return;
    }
    players[socket.id].position = sanitizePosition(movementData.position);
    players[socket.id].rotation = sanitizeRotation(movementData.rotation);
    players[socket.id].isWalking = !!movementData.isWalking;
    players[socket.id].isJumping = !!movementData.isJumping;

    // Broadcast to all OTHER players
    socket.broadcast.emit('player_moved', players[socket.id]);
  });

  // Chat messages (3D Bubbles)
  socket.on('chat_message', (msg) => {
    if (!msg || typeof msg !== 'object' || typeof msg.text !== 'string') {
      return;
    }
    const now = Date.now();
    if (now - (lastChatAt.get(socket.id) || 0) < 500) {
      return;
    }
    const text = msg.text.trim().slice(0, 240);
    if (!text) {
      return;
    }
    lastChatAt.set(socket.id, now);

    const senderName = players[socket.id]?.name || 'Anonymous';
    console.log(`[CHAT] ${senderName}: ${text}`);
    io.emit('chat_received', {
      id: socket.id,
      name: senderName,
      message: text,
      timestamp: now
    });
  });

  // WebRTC Signaling for Voice Chat
  socket.on('webrtc_offer', (data) => {
    if (!data || typeof data !== 'object' || typeof data.target !== 'string' || !data.sdp) {
      return;
    }
    socket.to(data.target).emit('webrtc_offer', {
      sender: socket.id,
      sdp: data.sdp
    });
  });

  socket.on('webrtc_answer', (data) => {
    if (!data || typeof data !== 'object' || typeof data.target !== 'string' || !data.sdp) {
      return;
    }
    socket.to(data.target).emit('webrtc_answer', {
      sender: socket.id,
      sdp: data.sdp
    });
  });

  socket.on('webrtc_ice_candidate', (data) => {
    if (!data || typeof data !== 'object' || typeof data.target !== 'string' || !data.candidate) {
      return;
    }
    socket.to(data.target).emit('webrtc_ice_candidate', {
      sender: socket.id,
      candidate: data.candidate
    });
  });

  socket.on('disconnect', () => {
    console.log(`[-] Player disconnected: ${socket.id}`);
    lastChatAt.delete(socket.id);
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
