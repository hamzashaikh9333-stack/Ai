import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js";
import messageModel from "../models/message.model.js";
import { getIO } from "../sockets/server.socket.js";

export async function sendMessage(req, res) {
  console.log(req.body)
  const { message: userInput, chatId } = req.body;
  

  // 🔴 1. Validation
  if (!userInput) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  let chat;
  let chatIdToUse;

  // 🟢 2. New chat create OR old chat use
  if (!chatId) {
    const chatTitle = await generateChatTitle(userInput);

    chat = await chatModel.create({
      user: req.user._id,
      title: chatTitle,
    });

    chatIdToUse = chat._id;
  } else {
    const existingChat = await chatModel.findOne({
      _id: chatId,
      user: req.user._id,
    });

    if (!existingChat) {
      return res.status(403).json({
        message: "Unauthorized chat access",
      });
    }

    chat = existingChat;
    chatIdToUse = chatId;
  }

  // 🔵 3. Save USER message
  const userMessage = await messageModel.create({
    chat: chatIdToUse,
    content: userInput,
    role: "user",
  });

  // 🟡 4. Get ALL messages of this chat (history)
  const chatMessages = await messageModel.find({
    chat: chatIdToUse,
  });

  // 🧠 5. Send history to AI → get response
  const aiResponse = await generateResponse(chatMessages);

  // 🟣 6. Save AI message
  const aiMessage = await messageModel.create({
    chat: chatIdToUse,
    content: aiResponse,
    role: "ai",
  });

  // 🟢 7. FINAL RESPONSE (frontend ko kya bhejna hai)
  
  // 📡 8. Emit messages via Socket.IO (optional for real-time)
  try {
    const io = getIO();
    io.emit("messageReceived", {
      chatId: chatIdToUse,
      content: aiMessage.content,
      role: "assistant",
    });
  } catch (error) {
    console.warn("⚠️  Socket emission skipped:", error.message);
  }
  
  return res.status(201).json({
    chatId: chatIdToUse,
    chatTitle: chat?.title,

    userMessage, // jo user ne bheja
    aiMessage, // jo AI ne reply kiya
    chat,

    
  });
}

export async function getChats(req, res) {
  const chats = await chatModel
    .find({ user: req.user._id })
    .sort({ createdAt: -1 });
  return res.status(200).json({
    message: "Chats retrieved successfully",
    chats,
  });
}

export async function getMessages(req, res) {
  const { chatId } = req.params;

  // Validate chatId is a valid MongoDB ObjectId
  if (!chatId || !chatId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      error: "Invalid chat ID format",
    });
  }

  const chat = await chatModel.findOne({
    _id: chatId,
    user: req.user._id,
  });

  if (!chat) {
    return res.status(403).json({
      message: "Unauthorized chat access",
    });
  }

  const messages = await messageModel.find({ chat: chatId });
  return res.status(200).json({
    message: "messages retrieved successfully",
    messages,
  });
}

export async function deleteChat(req, res) {
  const { chatId } = req.params;

  // Validate chatId is a valid MongoDB ObjectId
  if (!chatId || !chatId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      error: "Invalid chat ID format",
    });
  }

  const chat = await chatModel.findOneAndDelete({
    _id: chatId,
    user: req.user._id,
  });

  if (!chat) {
    return res.status(403).json({
      message: "Unauthorized chat action",
    });
  }

  await messageModel.deleteMany({ chat: chatId });

  return res.status(200).json({
    message: "Chat deleted successfully",
  });
}
