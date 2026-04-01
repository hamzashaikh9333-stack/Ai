import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../hook/useChat";
import { setCurrentChatId } from "../chat.slice";

const DashBoard = () => {
  // 🟢 Local state (input box)
  const [chatInput, setChatInput] = useState("");

  // 🟢 Redux state access
  const chats = useSelector((state) => state.chat.chats);
  const currentChatId = useSelector((state) => state.chat.currentChatId);

  // 🟢 Current chat messages निकालना
  const messages = chats[currentChatId]?.messages || [];

  const dispatch = useDispatch();

  // 🟢 Custom hook
  const { handleSendMessage, initializeSocketConnection } = useChat();

  // 🔵 Socket initialize (only once)
  useEffect(() => {
    initializeSocketConnection();
  }, []);

  // 🟡 Input change handler
  const handleInputChangeUI = (e) => {
    setChatInput(e.target.value);
  };

  // 🟡 Send message handler
  const handleSendMessageUI = () => {
    if (chatInput.trim()) {
      handleSendMessage({
        message: chatInput,
        chatId: currentChatId, // null bhi ho sakta hai (new chat)
      });

      setChatInput(""); // input clear
    }
  };

  // 🟡 Enter press = send message
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessageUI();
    }
  };

  // 🟣 Sidebar chat click
  const handleSelectChat = (chatId) => {
    dispatch(setCurrentChatId(chatId));
  };

  return (
    <div className="h-screen flex bg-black text-white">
      {/* Sidebar */}
      <div className="w-1/5 bg-gray-900 border-r border-gray-700 flex flex-col justify-between">
        {/* 🔵 Chat Titles */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {Object.values(chats).map((chat) => (
            <div
              key={chat.id} // ✅ FIXED (_id → id)
              onClick={() => handleSelectChat(chat.id)} // ✅ SELECT CHAT
              className={`border border-gray-600 rounded-lg p-3 cursor-pointer hover:bg-gray-800 ${
                currentChatId === chat.id ? "bg-gray-800" : ""
              }`}
            >
              {chat.title}
            </div>
          ))}
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-gray-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
            C
          </div>
          <span>username</span>
        </div>
      </div>

      {/* Main Chat Section */}
      <div className="flex-1 flex flex-col">
        {/* 🔵 Messages */}
        <div className="flex-1 p-6 px-50 space-y-6 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-xl max-w-md ${
                  msg.role === "user"
                    ? "bg-gray-700 rounded-br-none"
                    : "bg-gray-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* 🔵 Input Box */}
        <div className="p-4 px-26 border-t border-gray-700 flex gap-2 items-center">
          <input
            type="text"
            value={chatInput}
            onChange={handleInputChangeUI}
            onKeyDown={handleKeyPress} // ✅ FIX (onKeyPress → onKeyDown)
            placeholder="Type your message..."
            className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-500"
          />
          <button
            onClick={handleSendMessageUI}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
