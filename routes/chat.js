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
    const userId = +req.userId || 0;
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
      return res.status(404).json({
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

/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: all user data
 *     description: get the data of all the users
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: page number to get
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: get all User data successfully
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 */
router.get("/all", async (req, res) => {
  try {
    const { page } = req.query;
    console.log("=>>>", page, typeof page);
    const take = 10;
    const skip = Number(page) * take || 0;

    const users = await prisma.users.findMany({
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
      skip,
      take,
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved users data",
      users: users,
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
 * /user/search:
 *   get:
 *     summary: search for user
 *     description: get the data with search
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: page number to get
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: name of the user to get
 *     tags:
 *       - User
 *     responses:
 *       200:
 *         description: get Users data successfully
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 */
router.get("/search", async (req, res) => {
  try {
    const { page, name = "" } = req.query;
    console.log("=>>>", name, typeof name);
    console.log("=>>>", page, typeof page);
    const take = 10;
    const skip = Number(page) * take || 0;

    const users = await prisma.users.findMany({
      where: {
        name: {
          contains: name,
        },
      },
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
      skip,
      take,
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved users search data",
      users: users,
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
 * /user/{userId}:
 *   get:
 *     summary: user data
 *     description: get the data with Id
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to get
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
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = +id || 0;
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
      return res.status(404).json({
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

export default router;
