import express from 'express';
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js';
import user from './routes/user.js';
import chat from './routes/chat.js';
import message from './routes/message.js';
import { configDotenv } from 'dotenv';
import middlewareAuth from './middleware/index.js';
import swaggerSpec from "./utils/swaggerOptions.js"; // Import Swagger config
import swaggerUi from 'swagger-ui-express';
import { createServer } from 'node:http';
import ws from './socket/socket.js';


// load .env var
configDotenv();

const app = express();

const server = createServer(app);

ws.init(server);
ws.listen();

const port = process.env.PORT || 3000;

server.use(cookieParser());
server.use(express.static('public'));
server.use(express.json({ limit: "10mb" })); 

// Serve Swagger UI at /api-docs
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
server.get("/", (req, res) => {
  res.redirect("api-docs");
});

server.use('/auth', auth);
server.use(middlewareAuth);
server.use('/user', user);
server.use('/chat', chat);
server.use('/message', message);

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});