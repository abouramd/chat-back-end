import express from 'express';
import cookieParser from 'cookie-parser';
import auth from './routes/auth.js';
import user from './routes/user.js';
import { configDotenv } from 'dotenv';
import middlewareAuth from './middleware/index.js';

// load .env var
configDotenv();

const app = express();

const port = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json({ limit: "10mb" })); 
app.use('/auth', auth);
app.use(middlewareAuth);
app.use('/user', user);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});