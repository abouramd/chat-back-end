import express from "express";
import { generateToken } from "../auth/index.js";
import prisma from "../utils/prismaClient.js";
import bcrypt from "bcrypt";
import { loginSchema, registerSchema } from "../utils/Joi.js";
const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to a user
 *     description: Login to an existing user and receive a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "username"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: User successfully Login
 *       400:
 *         description: Bad request (validation errors)
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.post("/login", async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      return res
        .status(400)
        .json({ success: false, message: "Wrong password." });
    }

    const token = generateToken(user.id);

    res.cookie("access_token", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "You have logged successfully.",
      accessToken: token,
    });
  } catch (error) {
    console.error("Error loging user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user and receive a JWT token.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "test@example.com"
 *               username:
 *                 type: string
 *                 example: "username"
 *               name:
 *                 type: string
 *                 example: "Test User"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               confirmPassword:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Bad request (validation errors)
 *       500:
 *         description: Internal server error
 */
router.post("/register", async (req, res) => {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { email, username, name, password, confirmPassword } = req.body;

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already in use." });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res
        .status(400)
        .json({ success: false, message: "Username is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
      },
    });

    const token = generateToken(user.id);

    res.cookie("access_token", token, {
      maxAge: 60 * 60 * 1000,
      httpOnly: true,
    });

    res.status(201).json({
      success: true,
      message: "You have registered successfully.",
      accessToken: token,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout from a user
 *     description: Logout from a user and remove a JWT token.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: User successfully Logout
 *       500:
 *         description: Internal server error
 */
router.get("/logout", async (req, res) => {
  res.cookie("access_token", "", {
    maxAge: -1,
    httpOnly: true,
  });

  res
    .status(200)
    .json({ success: true, message: "You have Logout successfully." });
});

export default router;
