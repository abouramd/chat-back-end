import express from "express";
import prisma from "../utils/prismaClient.js";
import { editMessageSchema, sendMessageSchema } from "../utils/Joi.js";
import ws from "../socket/socket.js";

const router = express.Router();

/**
 * @swagger
 * /message:
 *   post:
 *     summary: Send Message
 *     description: Send a message to a chatroom
 *     tags:
 *       - Message
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomId:
 *                 type: string
 *               message:
 *                 type: string
 *             required:
 *               - roomId
 *               - message
 *     responses:
 *       200:
 *         description: Message sent
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Chatroom or User not found
 *       401:
 *         description: Unauthorized access
 */

router.post("/", createMessage);

/**
 * @swagger
 * /message/{id}:
 *   put:
 *     summary: Edit Message
 *     description: Edit a message
 *     tags:
 *       - Message
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to edit
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *             required:
 *               - message
 *     responses:
 *       200:
 *         description: Message updated
 *       500:
 *         description: Internal server error
 */

router.put("/:id", editMessage);

/**
 * @swagger
 * /message/{id}:
 *   delete:
 *     summary: Delete Message
 *     description: Delete a message
 *     tags:
 *       - Message
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted
 *       500:
 *         description: Internal server error
 */

router.delete("/:id", deleteMessage);

/**
  * @swagger
  * /message/{id}:
  *   get:
  *     summary: Get Message
  *     description: Get a message
  *     tags:
  *       - Message
  *     parameters:
  *       - in: path
  *         name: id
  *         schema:
  *           type: string
  *         required: true
  *         description: ID of the message to get
  *     responses:
  *       200:
  *         description: Message retrieved
  *       500:
  *         description: Internal server error
  */

router.get("/:id", getMessage);

async function createMessage(req, res) {
  try {
    const { error } = sendMessageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.userId || "";
    const { roomId = "", message = "" } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const chatroom = await prisma.chatroom.findUnique({
      where: { id: roomId },
    });

    if (!chatroom) {
      return res.status(404).json({
        success: false,
        message: "Chatroom not found",
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        chatroomId: chatroom.id,
        senderId: user.id,
        content: message,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });
        
    ws.chatMessage(roomId, newMessage);

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
      newMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
}

async function editMessage(req, res) {
  try {
    const { id } = req.params;

    const userId = req.userId || "";

    const { error } = editMessageSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const { message } = req.body;

    const messageExists = await prisma.message.findUnique({
      where: { id, senderId: userId },
    });

    if (!messageExists) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const updatedMessage = await prisma.message.update({
      where: { id, senderId: userId },
      data: { content: message },
    });

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      updatedMessage,
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
}

async function deleteMessage(req, res) {
  try {
    const { id } = req.params;

    const userId = req.userId || "";

    const messageExists = await prisma.message.findUnique({
      where: { id, senderId: userId },
    });

    if (!messageExists) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    await prisma.message.delete({
      where: { id, senderId: userId },
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
}

async function getMessage(req, res) {
  try {
    const { id } = req.params;

    const userId = req.userId || "";

    const message = await prisma.message.findUnique({
      where: { id , senderId: userId},
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message retrieved successfully",
      messageObject: message,
    });
  } catch (error) {
    console.error("Error retrieving message:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again later.",
    });
  }
}


// when an endpoint is hit, the server will broadcast the message to all connected clients in the chatroom socket



export default router;
