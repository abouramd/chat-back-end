import express from "express";
import { generateToken } from "../auth/index.js";
const router = express.Router();

router.get("/login", (req, res) => {
  res.cookie("access_token", generateToken("1"), {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  });
  res
    .status(200)
    .json({ success: true, message: "You have login succesfully" });
});

router.get("/register", (req, res) => {
  res.cookie("access_token", generateToken("1"), {
    maxAge: 60 * 60 * 1000,
    httpOnly: true,
  });
  res
    .status(201)
    .json({ success: true, message: "You have registered succesfully" });
});

router.get("/logout", (req, res) => {
  res.cookie("access_token", "", { maxAge: -1, httpOnly: true });
  res
    .status(200)
    .json({ success: true, message: "You have lougout succesfully" });
});

export default router;
