import Chat from "../../models/chatModel.js"
import mongoose from "mongoose"

// Get all chats for a user
export const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id

    const chats = await Chat.find({ user: userId })
      .populate("driver", "name profilePic")
      .populate("rideId", "pickupLocation dropoffLocation status")
      .select("-messages")
      .sort({ lastMessage: -1 })

    return res.status(200).json({
      success: true,
      data: chats,
    })
  } catch (error) {
    console.error("Error fetching user chats:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message,
    })
  }
}

// Get all chats for a driver
export const getDriverChats = async (req, res) => {
  try {
    const driverId = req.user.id

    const chats = await Chat.find({ driver: driverId })
      .populate("user", "name profilePic")
      .populate("rideId", "pickupLocation dropoffLocation status")
      .select("-messages")
      .sort({ lastMessage: -1 })

    return res.status(200).json({
      success: true,
      data: chats,
    })
  } catch (error) {
    console.error("Error fetching driver chats:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chats",
      error: error.message,
    })
  }
}

// Get chat messages between user and driver for a specific ride
export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID",
      })
    }

    const chat = await Chat.findById(chatId)
      .populate("user", "name profilePic")
      .populate("driver", "name profilePic")
      .populate("rideId", "pickupLocation dropoffLocation status")

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    // Check if the requesting user is either the user or driver in this chat
    if (chat.user._id.toString() !== req.user.id && chat.driver._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this chat",
      })
    }

    return res.status(200).json({
      success: true,
      data: chat,
    })
  } catch (error) {
    console.error("Error fetching chat messages:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat messages",
      error: error.message,
    })
  }
}

// Create a new chat
export const createChat = async (req, res) => {
  try {
    const { userId, driverId, rideId } = req.body

    if (!userId || !driverId || !rideId) {
      return res.status(400).json({
        success: false,
        message: "User ID, driver ID, and ride ID are required",
      })
    }

    // Check if chat already exists
    const existingChat = await Chat.findOne({
      user: userId,
      driver: driverId,
      rideId: rideId,
    })

    if (existingChat) {
      return res.status(200).json({
        success: true,
        data: existingChat,
        message: "Chat already exists",
      })
    }

    // Create new chat
    const newChat = new Chat({
      user: userId,
      driver: driverId,
      rideId: rideId,
      messages: [],
    })

    await newChat.save()

    return res.status(201).json({
      success: true,
      data: newChat,
      message: "Chat created successfully",
    })
  } catch (error) {
    console.error("Error creating chat:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to create chat",
      error: error.message,
    })
  }
}

// Send a message (this will be used by the WebSocket service)
export const sendMessage = async (chatId, senderId, senderType, receiverId, receiverType, content) => {
  try {
    const chat = await Chat.findById(chatId)

    if (!chat) {
      throw new Error("Chat not found")
    }

    const newMessage = {
      sender: senderId,
      senderType: senderType,
      receiver: receiverId,
      receiverType: receiverType,
      content: content,
      read: false,
    }

    chat.messages.push(newMessage)
    chat.lastMessage = Date.now()

    await chat.save()

    return {
      success: true,
      data: newMessage,
    }
  } catch (error) {
    console.error("Error sending message:", error)
    throw error
  }
}

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    const chat = await Chat.findById(chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    // Determine if the user is the user or driver in this chat
    const isUser = chat.user.toString() === userId
    const isDriver = chat.driver.toString() === userId

    if (!isUser && !isDriver) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to access this chat",
      })
    }

    // Mark messages as read where the current user is the receiver
    const receiverType = isUser ? "User" : "Driver"

    let updated = false
    chat.messages.forEach((message) => {
      if (message.receiverType === receiverType && message.receiver.toString() === userId && !message.read) {
        message.read = true
        updated = true
      }
    })

    if (updated) {
      await chat.save()
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    })
  }
}

// Delete a chat
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params
    const userId = req.user.id

    const chat = await Chat.findById(chatId)

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      })
    }

    // Check if the requesting user is either the user or driver in this chat
    if (chat.user.toString() !== userId && chat.driver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this chat",
      })
    }

    await Chat.findByIdAndDelete(chatId)

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to delete chat",
      error: error.message,
    })
  }
}

