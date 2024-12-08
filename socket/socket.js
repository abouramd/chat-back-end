import { middlewareAuthSocket } from "../middleware/index.js";
import prisma from "../utils/prismaClient.js";

const ws = {};

ws.init = (socket) => {
  console.log("Initializing socket.io");
  ws.io = socket;
  ws.onlineUsers = new Map();
};

ws.listen = () => {
  if (!ws.io) {
    throw new Error("please call init() before calling listen()");
  }

  console.log("Listening for socket connections");

  ws.io.use(middlewareAuthSocket);

  ws.io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Add user to online users
    if (!ws.onlineUsers.has(socket.userId))
    {
      ws.onlineUsers.set(socket.userId, [socket]);
    }
    else ws.onlineUsers.get(socket.userId).push(socket);

    socket.on("disconnect", () => {
      // Remove user from online users
      // If user has multiple connections, remove only the disconnected one
      // Otherwise, remove the user from the online users list
      if (ws.onlineUsers.has(socket.userId))
      {
        const userConnections = ws.onlineUsers.get(socket.userId);
        const index = userConnections.indexOf(socket);
        if (index > -1)
        {
          userConnections.splice(index, 1);
          if (userConnections.length === 0)
          {
            ws.onlineUsers.delete(socket.userId);
          }
        }
      }
      console.log(`User disconnected: ${socket.userId}`);
    });

    socket.on("join room", async (roomId, callback) => {
      console.log(`User ${socket.userId} joined room${roomId}`);

      const messages = await prisma.chatroom.findUnique({
        where: { id: roomId, members: { some: { id: socket.userId } } },
      });

      if (!messages) {
        console.log("Chatroom not found");
        if (typeof callback === "function")
          return callback({ success: false, message: "Chatroom not found" });
        return;
      }

      if (socket.room) {
        socket.leave(socket.room);
        socket.room = null;
      }

      socket.join("room" + roomId);
      socket.room = "room" + roomId;

      if (typeof callback === "function")
        return callback({ success: true, message: "Joined room" });
    });

    socket.on("leave room", () => {
      if (socket.room) {
        socket.leave(socket.room);
        socket.room = null;
      }
    });
  });

  ws.chatMessage = (roomId, message, action) => {
    if (!ws.io) {
      throw new Error("please call init() and listen()");
    }
    ws.io.to("room" + roomId).emit("chat message", message, action);
  };
  
  ws.notificationForRoom = (roomId, notification) => {
    if (!ws.io) {
      throw new Error("please call init() and listen()");
    }
    ws.io.to("room" + roomId).emit("notification", notification);
  }
  
  ws.notificationForUser = (userId, notification) => {
    if (!ws.io) {
      throw new Error("please call init() and listen()");
    }
    if (ws.onlineUsers.has(userId))
    {
      ws.onlineUsers.get(userId).forEach((socket) => {
        ws.io.to(socket.id).emit("notification", notification);
      });
    }
  }
};

export default ws;
