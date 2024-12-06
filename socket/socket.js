import { middlewareAuthSocket } from "../middleware/index.js";
import prisma from "../utils/prismaClient.js";

const ws = {};

ws.init = (socket) => {
  console.log("Initializing socket.io");
  ws.io = socket;
};

ws.listen = () => {
  if (!ws.io) {
    throw new Error("please call init() before calling listen()");
  }

  console.log("Listening for socket connections");

  ws.io.use(middlewareAuthSocket);

  ws.io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    socket.on("disconnect", () => {
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

  ws.chatMessage = (roomId, message) => {
    if (!ws.io) {
      throw new Error("please call init() and listen()");
    }
    ws.io.to("room" + roomId).emit("chat message", message);
  };
};

export default ws;
