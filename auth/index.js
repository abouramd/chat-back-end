import { configDotenv } from "dotenv";
import jwt from "jsonwebtoken";

// load .env var
configDotenv();

const SECRETKEY = process.env.SECRETKEY || "PrivateKey";

if (!process.env.SECRETKEY)
  console.log(
    `SECRETKEY is not defined in .env\nuse this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`,
  );


function generateToken(userId) {
  const token = jwt.sign(
    {
      userId: userId,
    },
    SECRETKEY,
    { expiresIn: "1h" },
  );

  return token;
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, SECRETKEY);
    return decoded?.userId;
  } catch (err) {
    return null;
  }
}

export { generateToken, verifyToken };
