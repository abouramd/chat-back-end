import { generateToken, verifyToken } from "../auth/index.js";
import cookie from "cookie";

function middlewareAuth(req, res, next) {
  const token = req.cookies["access_token"] || req.headers["Authorization"];
  const userId = verifyToken(token);
  if (!userId)
    return res.status(401).json({ success: false, message: "Unauthorized" });
  res.cookie("access_token", generateToken(userId), {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  });
  req.userId = userId;
  next();
}

function middlewareAuthSocket(socket, next) {
  try {
    console.log("middlewareAuthSocket");
    
    // Parse cookies from the handshake headers
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    // Get the token from the access_token cookie
    const token = cookies.access_token;

    if (!token) {
      throw new Error("Authentication error: No token provided");
    }

    // Verify the token
    const decoded = verifyToken(token);
    if (!decoded) {
      throw new Error("Authentication error: Invalid token");
    }

    // Attach user data to the socket
    socket.userId = decoded;
    next();
  } catch (err) {
    console.error(err.message);
    next(new Error("Authentication error"));
  }
}

export { middlewareAuth, middlewareAuthSocket };
