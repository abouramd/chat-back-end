import express from "express";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.js";
import user from "./routes/user.js";
import chat from "./routes/chat.js";
import message from "./routes/message.js";
import { configDotenv } from "dotenv";
import { middlewareAuth } from "./middleware/index.js";
import swaggerSpec from "./utils/swaggerOptions.js"; // Import Swagger config
import swaggerUi from "swagger-ui-express";
import { createServer } from "node:http";
import ws from "./socket/socket.js";
import { Server } from "socket.io";
import morgan from "morgan";

// load .env var
configDotenv();

const app = express();

const server = createServer(app);

ws.init(new Server(server));
ws.listen();

const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(morgan("tiny"));
app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", auth);
app.use(middlewareAuth);
app.use("/user", user);
app.use("/chat", chat);
app.use("/message", message);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
