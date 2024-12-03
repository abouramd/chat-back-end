import express from "express";
import prisma from "../utils/prismaClient.js";

const router = express.Router();

/**
 * @swagger
 * /user/data:
 *   get:
 *     summary: user data
 *     description: get the data of the login user
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: get User data successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 */
router.get("/data", async (req, res) => {
  try {
    const userId = +req.userId;
    console.log(userId, typeof userId);
    const user = await prisma.users.findUnique({
      select: {
        id: true,
        name: true,
        email: true,
        // active: true,
        // lastActive: true,
        createdAt: true,
        updatedAt: true,
        // UsersConversations: true,
        // Messages: true,
      },
      where: { id: userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully retrieved user data",
      user: user,
    });
  } catch (error) {
    console.error("Error loging user:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  res
    .status(200)
    .json({ success: true, message: "user id data", params: req.params });
});

router.get("/all", (req, res) => {
  const { page } = req.query;
  const limit = 20;
  const offset = (Number(page) - 1) * limit || 0;
  res.status(200).json({ success: true, message: "all users data" });
});

router.get("/search", (req, res) => {
  const { page, query } = req.query;
  res.status(200).json({
    success: true,
    message: "You have called search api",
    query: req.query,
  });
});

export default router;
