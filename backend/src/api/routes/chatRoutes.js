import express from "express"
import {
  getUserChats,
  getDriverChats,
  getChatMessages,
  createChat,
  markMessagesAsRead,
  deleteChat,
} from "../controllers/chatController.js"
import { auth, authorize } from "../middlewares/auth.js"

const router = express.Router()

// Get all chats for a user
router.get("/user", auth, authorize("user"), getUserChats)

// Get all chats for a driver
router.get("/driver", auth, authorize("driver"), getDriverChats)

// Get chat messages
router.get("/:chatId", auth, getChatMessages)

// Create a new chat
router.post("/", auth, createChat)

// Mark messages as read
router.put("/:chatId/read", auth, markMessagesAsRead)

// Delete a chat
router.delete("/:chatId", auth, deleteChat)

export default router

