// src/app/api/socket/route.js
import { Server } from 'socket.io';

let io;

export const GET = async (req, res) => {
  if (!res.socket.server.io) {
    console.log('Starting Socket.IO server...');

    const httpServer = res.socket.server;
    io = new Server(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    // Auth middleware
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('No token'));

      try {
        const { verifyAccessToken } = require('../../../../database/jwt');
        const payload = verifyAccessToken(token);
        socket.userId = payload.userId;
        next();
      } catch (err) {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected: ${socket.id}`);

      // Join user's personal room
      socket.join(socket.userId);

      // THIS IS THE MISSING PART!
      socket.on('send-message', async (data) => {
        const { text } = data;
        if (!text?.trim()) return;

        const message = {
          id: Date.now() + Math.random(),
          text: text.trim(),
          sender: 'me',
          timestamp: Date.now(),
        };

        // Save to DB + Redis (optional, or do it in /api/messages/send)
        // For now: just broadcast
        io.to(socket.userId).emit('new-message', message);

        // Optional: Save to MongoDB via API
        // fetch('http://localhost:3000/api/messages/send', { ... })
      });

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
      });
    });

    res.socket.server.io = io;
  }
  res.end();
};