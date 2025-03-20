import WebSocket from "ws"
import { sendMessage } from "../api/controllers/chat/chatController.js"
import jwt from "jsonwebtoken"

// Store active connections
const connections = new Map()

// Initialize WebSocket server
export const initWebSocket = (server) => {
  const wss = new WebSocket.Server({ server })

  wss.on("connection", async (ws, req) => {
    try {
      // Extract token from URL query parameters
      const url = new URL(req.url, `http://${req.headers.host}`)
      const token = url.searchParams.get("token")

      if (!token) {
        ws.close(4001, "Authentication required")
        return
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const userId = decoded.id
      const userType = decoded.role // 'user' or 'driver'

      // Store connection with user ID
      connections.set(userId, { ws, userType })

      console.log(`WebSocket connected: ${userId} (${userType})`)

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: "connection",
          message: "Connected to chat server",
          userId,
          userType,
        }),
      )

      // Handle incoming messages
      ws.on("message", async (message) => {
        try {
          const data = JSON.parse(message)

          switch (data.type) {
            case "chat_message":
              await handleChatMessage(userId, userType, data)
              break

            case "typing":
              handleTypingIndicator(userId, userType, data)
              break

            default:
              ws.send(
                JSON.stringify({
                  type: "error",
                  message: "Unknown message type",
                }),
              )
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error)
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Failed to process message",
            }),
          )
        }
      })

      // Handle disconnection
      ws.on("close", () => {
        console.log(`WebSocket disconnected: ${userId}`)
        connections.delete(userId)
      })
    } catch (error) {
      console.error("WebSocket connection error:", error)
      ws.close(4002, "Authentication failed")
    }
  })

  return wss
}

// Handle chat messages
const handleChatMessage = async (senderId, senderType, data) => {
  try {
    const { chatId, receiverId, content } = data

    if (!chatId || !receiverId || !content) {
      throw new Error("Missing required fields")
    }

    // Determine receiver type (opposite of sender type)
    const receiverType = senderType === "user" ? "Driver" : "User"

    // Save message to database
    const result = await sendMessage(
      chatId,
      senderId,
      senderType === "user" ? "User" : "Driver",
      receiverId,
      receiverType,
      content,
    )

    // Prepare message to send
    const messageData = {
      type: "chat_message",
      chatId,
      message: {
        ...result.data,
        createdAt: new Date(),
      },
    }

    // Send to sender for confirmation
    const senderConnection = connections.get(senderId)
    if (senderConnection && senderConnection.ws.readyState === WebSocket.OPEN) {
      senderConnection.ws.send(
        JSON.stringify({
          ...messageData,
          isSent: true,
        }),
      )
    }

    // Send to receiver if online
    const receiverConnection = connections.get(receiverId)
    if (receiverConnection && receiverConnection.ws.readyState === WebSocket.OPEN) {
      receiverConnection.ws.send(JSON.stringify(messageData))
    }
  } catch (error) {
    console.error("Error handling chat message:", error)
    throw error
  }
}

// Handle typing indicator
const handleTypingIndicator = (senderId, senderType, data) => {
  try {
    const { chatId, receiverId, isTyping } = data

    if (!chatId || !receiverId) {
      throw new Error("Missing required fields")
    }

    // Send typing indicator to receiver if online
    const receiverConnection = connections.get(receiverId)
    if (receiverConnection && receiverConnection.ws.readyState === WebSocket.OPEN) {
      receiverConnection.ws.send(
        JSON.stringify({
          type: "typing",
          chatId,
          senderId,
          senderType,
          isTyping,
        }),
      )
    }
  } catch (error) {
    console.error("Error handling typing indicator:", error)
    throw error
  }
}

