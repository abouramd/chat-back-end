import express from 'express';
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js';
import user from './routes/user.js';
import { configDotenv } from 'dotenv';
import middlewareAuth from './middleware/index.js';
import swaggerSpec from "./utils/swaggerOptions.js"; // Import Swagger config
import swaggerUi from 'swagger-ui-express';

// load .env var
configDotenv();

const app = express();

const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json({ limit: "10mb" })); 

// Serve Swagger UI at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/auth', auth);
app.use(middlewareAuth);
app.use('/user', user);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});