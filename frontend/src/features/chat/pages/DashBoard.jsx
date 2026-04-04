import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../hook/useChat";
import { setCurrentChatId } from "../chat.slice";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const DashBoard = () => {
  // 🔹 STATE
  const [chatInput, setChatInput] = useState("");
  const [typingMessage, setTypingMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const chatContainerRef = useRef(null);
  const isTypingRef = useRef(false);

  // 🔹 REDUX
  const chats = useSelector((state) => state.chat.chats);
  const user = useSelector((state) => state.auth.user);
  const currentChatId = useSelector((state) => state.chat.currentChatId);
  const isLoading = useSelector((state) => state.chat.isLoading);
  const error = useSelector((state) => state.chat.error);

  const messages = chats[currentChatId]?.messages || [];
  const dispatch = useDispatch();

  // 🔹 CUSTOM HOOK
  const {
    handleSendMessage,
    handleGetChat,
    handleGetMessages,
    handleDeleteChat,
    handleCreateNewChat,
    initializeSocketConnection,
  } = useChat();

  useEffect(() => {
    const savedChatId = localStorage.getItem("currentChatId");

    if (savedChatId) {
      dispatch(setCurrentChatId(savedChatId));
    }
  }, []);

  // 🔥 LOAD CHATS ON MOUNT
  useEffect(() => {
    const init = async () => {
      await handleGetChat();

      const savedChatId = localStorage.getItem("currentChatId");
      if (savedChatId) {
        await handleGetMessages(savedChatId);
      }
    };

    init();
    initializeSocketConnection();
  }, []);

  // 🔥 LOAD MESSAGES WHEN CHAT CHANGES
  useEffect(() => {
    if (currentChatId) {
      handleGetMessages(currentChatId);
    }
  }, [currentChatId]);

  // 🔥 TYPING EFFECT
  const TYPING_SPEED = 30;

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];

    if (
      !lastMsg ||
      lastMsg.role !== "assistant" ||
      isTypingRef.current ||
      typingMessage === lastMsg.content
    )
      return;

    isTypingRef.current = true;
    let index = 0;
    setTypingMessage("");

    const interval = setInterval(() => {
      setTypingMessage((prev) => {
        const nextChunk = lastMsg.content.slice(index, index + TYPING_SPEED);
        index += TYPING_SPEED;

        if (index >= lastMsg.content.length) {
          clearInterval(interval);
          isTypingRef.current = false;
        }

        return prev + nextChunk;
      });
    }, 10);

    return () => {
      clearInterval(interval);
      isTypingRef.current = false;
    };
  }, [messages]);

  // 🔥 AUTO SCROLL TO BOTTOM
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  // 🔹 HANDLERS
  const handleSendMessageUI = () => {
    if (!chatInput.trim()) return;

    handleSendMessage({
      message: chatInput,
      chatId: currentChatId,
    });

    setChatInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessageUI();
    }
  };

  const handleSelectChat = (chatId) => {
    dispatch(setCurrentChatId(chatId));
    localStorage.setItem("currentChatId", chatId);
  };

  const handleNewChat = () => {
    handleCreateNewChat();
  };

  // 🔹 MARKDOWN COMPONENTS
  const markdownComponents = {
    code({ inline, className, children }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeString = String(children).replace(/\n$/, "");

      const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
      };

      return !inline && match ? (
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 bg-gray-700 text-xs px-2 py-1 rounded hover:bg-gray-600 transition"
          >
            Copy
          </button>
          <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div">
            {codeString}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-700 px-1 py-0.5 rounded text-sm">
          {children}
        </code>
      );
    },
  };

  const chatsList = Object.values(chats);

  return (
    <div className="h-screen flex flex-col md:flex-row bg-[#0f0f0f] text-gray-200">
      {/* SIDEBAR */}
      <div className="w-full md:w-[260px] bg-[#171717] flex flex-col justify-between border-b md:border-b-0 md:border-r border-gray-700">
        {/* NEW MESSAGE BUTTON + CHATS */}
        <div className="p-4 space-y-3 overflow-y-auto scrollbar-hide">
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg text-sm font-medium transition duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span>
            New Message
          </button>

          {/* CHATS LIST */}
          <div className="space-y-2">
            {chatsList.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                No chats yet
              </div>
            ) : (
              chatsList.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition duration-200 ${
                    currentChatId === chat.id
                      ? "bg-[#2a2a2a] text-emerald-400"
                      : "hover:bg-[#222] text-gray-300"
                  }`}
                >
                  <div
                    onClick={() => handleSelectChat(chat.id)}
                    className="flex-1 truncate text-sm"
                    title={chat.title}
                  >
                    {chat.title}
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setChatToDelete(chat.id);
                      setShowDeleteModal(true);
                    }}
                    className="hidden group-hover:block bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded transition duration-200"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* PROFILE SECTION */}
        <div className="p-4 text-sm text-gray-400 border-t border-gray-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-semibold">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <div className="text-sm text-white font-medium">
              👤{user?.username || "User"}
            </div>
            <div className="text-xs text-gray-500">Online</div>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-auto">
        {/* MESSAGES CONTAINER */}
        <div
          ref={chatContainerRef}
          className="flex-1 px-4 md:px-6 py-6 space-y-5 overflow-y-auto scrollbar-hide"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-sm">Select a chat or create a new message</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isLast = index === messages.length - 1;

              return (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl max-w-[90%] md:max-w-[70%] text-sm leading-relaxed break-words ${
                      msg.role === "user"
                        ? "bg-gray-700 text-white"
                        : "bg-[#1e1e1e] text-gray-200"
                    }`}
                  >
                    <ReactMarkdown components={markdownComponents}>
                      {msg.role === "assistant" && isLast
                        ? typingMessage
                        : msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              );
            })
          )}

          {/* LOADING STATE */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl bg-[#1e1e1e]">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT SECTION */}
        <div className="px-4 md:px-6 py-4 bg-[#0f0f0f] border-t border-gray-700">
          {error && (
            <div className="mb-3 p-2 bg-red-900 bg-opacity-30 border border-red-600 rounded text-red-400 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-end gap-3">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Send a message... (Shift+Enter for new line)"
              rows="1"
              className="flex-1 bg-[#1e1e1e] border border-gray-700 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-600 transition duration-200 resize-none max-h-32"
            />

            <button
              onClick={handleSendMessageUI}
              disabled={isLoading || !chatInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 md:px-6 py-2.5 rounded-lg text-sm font-medium transition duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </div>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#1e1e1e] rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl transform animate-scaleIn">
            <h2 className="text-lg font-semibold text-white mb-2">
              Delete Chat
            </h2>

            <p className="text-sm text-gray-400 mb-6">
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleDeleteChat(chatToDelete);
                  setShowDeleteModal(false);
                }}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashBoard;
