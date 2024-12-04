import express from "express";
import prisma from "../utils/prismaClient.js";
import { chatroomSchema } from "../utils/Joi.js";

const router = express.Router();

/**
 * @swagger
 * /chat/create:
 *   post:
 *     summary: create chat room
 *     description: create a chat room of the login user
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "chat name"
 *     responses:
 *       201:
 *         description: chat room successfully created
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 *       400:
 *         description: Bad request (validation errors)
 */

router.post("/create", async (req, res) => {
  try {
    const { error } = chatroomSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { name } = req.body;

    const userId = req.userId || "";
    console.log(userId, typeof userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await prisma.chatroom.create({
      data: { name, members: { connect: { id: userId } } },
    });

    res.status(201).json({
      success: true,
      message: "Successfully create a chat room",
      chats: user?.chatrooms,
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
 * /chat/all:
 *   get:
 *     summary: chat rooms
 *     description: get the chat rooms of the login user
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: true
 *         description: page number to get
 *     tags:
 *       - Chat
 *     responses:
 *       200:
 *         description: get chat rooms data successfully
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

    const userId = req.userId || "";
    console.log(userId, typeof userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const chatroom = await prisma.chatroom.findMany({
      where: { members: { some: { id: userId } } },
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved chat rooms data",
      chats: chatroom,
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
 * /chat/{id}/add:
 *   post:
 *     summary: Add Member
 *     description: Add Member to Chatroom
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: chat room id
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "chat name"
 *     responses:
 *       201:
 *         description: sdd a User to chat successfully
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 *       400:
 *         description: Bad request (validation errors)
 *       404:
 *         description: Not found
 */

router.post("/:id/add", async (req, res) => {
  try {
    const roomId = +req.params.id || "";
    const userId = req.body.userId || "";

    const username = req?.body?.username || "";

    const room = await prisma.chatroom.update({
      where: {
        id: roomId,
        members: {
          some: { id: userId }, // Check if the user exists in the members list
        },
      },
      data: {
        members: { connect: { username: username } },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully retrieved add user to chat room",
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
 * /chat/{id}/members:
 *   get:
 *     summary: chat room Member
 *     description: get chat room Member
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: chat room id
 *     tags:
 *       - Chat
 *     responses:
 *       200:
 *         description: member of chat successfully
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 *       404:
 *         description: Not found
 */

router.post("/:id/members", async (req, res) => {
  try {
    const roomId = +req.params.id || "";
    const userId = req.body.userId || "";


    const room = await prisma.chatroom.findUnique({
      where: {
        id: roomId,
        members: {
          some: { id: userId },
        },
      },
      include: {
        members: true,
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Successfully retrieved chat room members",
      members: room.members,
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
