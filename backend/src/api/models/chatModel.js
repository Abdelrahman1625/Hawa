import mongoose from "mongoose"

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderType",
    },
    senderType: {
      type: String,
      required: true,
      enum: ["User", "Driver"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "receiverType",
    },
    receiverType: {
      type: String,
      required: true,
      enum: ["User", "Driver"],
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
    },
    rideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    messages: [messageSchema],
    lastMessage: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Index for faster queries
chatSchema.index({ user: 1, driver: 1, rideId: 1 })

const Chat = mongoose.model("Chat", chatSchema)

export default Chat

