import express from 'express';
import path from 'path';
import cors from 'cors';
import { Server } from "socket.io";
import http from "http";
import { clerkMiddleware } from '@clerk/express'
import { serve } from "inngest/express";
import { ENV } from './lib/env.js';
import { connectDB } from './lib/db.js';
import { inngest, functions } from './lib/inngest.js';
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoute.js";
import executeRoutes from "./routes/executeRoutes.js";
import { protectRoute } from './middleware/protectRoute.js';
const app = express()
const __dirname = path.resolve();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true
  }
});

// store code per session
const sessionCodeMap = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-session", ({ sessionId }) => {
    if (!sessionId) return;
    socket.join(sessionId);

    // send existing code
    const code = sessionCodeMap.get(sessionId) || "";
    socket.emit("code-sync", code);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  socket.on("code-change", ({ sessionId, code }) => {
    if (!sessionId || code === undefined) return;
    sessionCodeMap.set(sessionId, code);

    socket.to(sessionId).emit("code-update", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});
app.use(cors({origin:ENV.CLIENT_URL, credentials:true}));
app.use(express.json());
app.use(clerkMiddleware());
app.use("/api/inngest", serve({client:inngest, functions }));
app.use("/api/chat" , chatRoutes);
app.use("/api/sessions" , sessionRoutes);
app.use("/api/execute",  executeRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});


//Make our app ready for deployment
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  })
}


const startServer = async () => {
  try {
    await connectDB();
    server.listen(ENV.PORT, () => {
      console.log("Server running on port :", ENV.PORT);
    });
  } catch (error) {
    console.error("❌ Failed to start server : ", error);
  }
};
startServer();