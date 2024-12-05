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
    const roomId = req.params.id || "";
    const userId = req.userId || "";

    const username = req?.body?.username || "";

    console.log(username);

    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Added user not found.",
      });
    }

    const me = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!me) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const room = await prisma.chatroom.findUnique({
      where: {
        id: roomId,
        members: {
          some: { id: userId }, // Check if the user exists in the members list
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found.",
      });
    }

    await prisma.chatroom.update({
      where: {
        id: room.id,
        members: {
          some: { id: me.id }, // Check if the user exists in the members list
        },
      },
      data: {
        members: { connect: { id: user.id } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully add user to chat room",
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
 * /chat/{id}/leave:
 *   get:
 *     summary: leave a chat room
 *     description: leave a chat room of the login user
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
 *         description: leave a chat room successfully
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 *       404:
 *         description: Not found
 */

router.get("/:id/leave", async (req, res) => {
  try {
    const roomId = req.params.id || "";
    const userId = req.userId || "";

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const room = await prisma.chatroom.findUnique({
      where: {
        id: roomId,
        members: {
          some: { id: user.id },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found.",
      });
    }

    await prisma.chatroom.update({
      where: {
        id: room.id,
        members: {
          some: { id: user.id },
        },
      },
      data: {
        members: { disconnect: { id: user.id } },
      },
    });

    res.status(200).json({
      success: true,
      message: "Successfully leave chat room",
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
 *     summary: get chat room member
 *     description: get chat room members
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
 *         description: get member of chat successfully
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 *       404:
 *         description: Not found
 */

router.get("/:id/members", async (req, res) => {
  try {
    const roomId = req.params.id || "";
    const userId = req.userId || "";

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
 * /chat/search:
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
 *         description: name of the chat room to get
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
router.get("/search", async (req, res) => {
  try {
    const { page, name = "" } = req.query;
    const userId = req.userId || "";
    console.log("=>>>", userId, typeof userId);
    console.log("=>>>", name, typeof name);
    console.log("=>>>", page, typeof page);
    const take = 10;
    const skip = Number(page) * take || 0;

    const rooms = await prisma.chatroom.findMany({
      where: {
        name: {
          contains: name,
        },
        members: {
          some: { id: userId },
        },
      },
      take,
      skip,
    });

    res.status(200).json({
      success: true,
      message: "Successfully reveived chat rooms search data",
      rooms: rooms,
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
 * /chat/{id}/messages:
 *   get:
 *     summary: get chat room member
 *     description: get chat room members
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
 *         description: get messages of chat successfully
 *       500:
 *         description: Internal server error
 *       401:
 *         description: unauthorized access
 *       404:
 *         description: Not found
 */

router.get("/:id/messages", async (req, res) => {
  try {
    const roomId = req.params.id || "";
    const userId = req.userId || "";

    const room = await prisma.chatroom.findUnique({
      where: {
        id: roomId,
        members: {
          some: { id: userId },
        },
      },
      include: {
        messages: true,
        messages: {
          include: {
            sender: true,
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                username: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found.",
      });
    }

    room.messages.forEach((r) => {
      if (r.senderId === userId) {
        r.me = "true";
      }
    });

    res.status(200).json({
      success: true,
      message: "Successfully retrieved chat room messages",
      messages: room.messages,
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
