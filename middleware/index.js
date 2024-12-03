import { generateToken, verifyToken } from "../auth/index.js";

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

export default middlewareAuth;
