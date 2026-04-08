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
    // Skip fetching for temporary chats (they don't exist in DB yet)
    if (currentChatId && !currentChatId.startsWith('temp-')) {
      handleGetMessages(currentChatId);
    }
  }, [currentChatId, handleGetMessages]);

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
    <div className="h-screen w-screen flex flex-col sm:flex-row bg-[#0f0f0f] text-gray-200 overflow-hidden">
      {/* SIDEBAR - RESPONSIVE */}
      <div className="w-full sm:w-1/3 md:w-1/4 lg:w-72 xl:w-80 bg-[#171717] flex flex-col justify-between border-b sm:border-b-0 sm:border-r border-gray-700/50 overflow-hidden">
        {/* NEW MESSAGE BUTTON + CHATS */}
        <div className="p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 overflow-y-auto scrollbar-hide">
          <button
            onClick={handleNewChat}
            className="w-full px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer"
          >
            <span className="text-base sm:text-lg">+</span>
            <span className="hidden xs:inline">New Message</span>
            <span className="inline xs:hidden">New</span>
          </button>

          {/* CHATS LIST */}
          <div className="space-y-1 sm:space-y-2">
            {chatsList.length === 0 ? (
              <div className="text-center text-gray-500 text-xs sm:text-sm py-4 sm:py-6">
                No chats yet
              </div>
            ) : (
              chatsList.map((chat) => (
                <div
                  key={chat.id}
                  className={`group flex items-center justify-between px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                    currentChatId === chat.id
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/50"
                      : "hover:bg-gray-700/40 text-gray-300"
                  }`}
                >
                  <div
                    onClick={() => handleSelectChat(chat.id)}
                    className="flex-1 truncate text-xs sm:text-sm md:text-base"
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
                    className="hidden sm:block opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs px-2 py-1 rounded transition-all duration-200 transform hover:scale-110 cursor-pointer ml-1"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* PROFILE SECTION */}
        <div className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm border-t border-gray-700/50 flex items-center gap-2 sm:gap-3 hover:bg-gray-800/30 transition-colors">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md shrink-0">
            {user?.username?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">
            <div className="text-xs sm:text-sm text-white font-semibold truncate">
              {user?.username || "User"}
            </div>
            <div className="text-xs text-gray-500">🟢 Online</div>
          </div>
        </div>
      </div>

      {/* CHAT AREA - RESPONSIVE */}
      <div className="flex-1 hidden sm:flex flex-col min-h-screen sm:min-h-full bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] overflow-hidden">
        {/* MESSAGES CONTAINER */}
        <div
          ref={chatContainerRef}
          className="flex-1 px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 space-y-2 sm:space-y-3 md:space-y-4 overflow-y-auto scrollbar-hide"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center space-y-3 sm:space-y-4">
                <div className="text-4xl sm:text-5xl md:text-6xl animate-bounce">💬</div>
                <p className="text-xs sm:text-sm md:text-base font-semibold text-gray-400">No messages yet</p>
                <p className="text-xs text-gray-600">Start a conversation to begin</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const isUser = msg.role === "user";
              const timestamp = msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }) : '';

              return (
                <div
                  key={index}
                  className={`flex ${
                    isUser ? "justify-end" : "justify-start"
                  } animate-slideUp group px-1 sm:px-0`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="flex-shrink-0 mr-1.5 sm:mr-2 md:mr-3 mt-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md">
                        🤖
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full sm:max-w-none`}>
                    <div
                      className={`px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-3 rounded-2xl md:rounded-3xl max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg text-xs sm:text-sm md:text-base leading-relaxed break-words shadow-md transition-all duration-300 hover:shadow-lg ${
                        isUser
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                          : "bg-gray-800 text-gray-100 rounded-bl-none border border-gray-700/60"
                      }`}
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {isUser && isLast
                          ? msg.content
                          : msg.role === "assistant" && isLast
                          ? typingMessage
                          : msg.content}
                      </ReactMarkdown>
                    </div>
                    
                    {/* Timestamp */}
                    <span className="text-xs text-gray-600 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      {timestamp}
                    </span>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="flex-shrink-0 ml-1.5 sm:ml-2 md:ml-3 mt-1">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md">
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* LOADING STATE - TYPING INDICATOR */}
          {isLoading && (
            <div className="flex justify-start animate-slideUp px-1 sm:px-0">
              <div className="flex-shrink-0 mr-1.5 sm:mr-2 md:mr-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-md">
                  🤖
                </div>
              </div>
              <div className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 rounded-2xl md:rounded-3xl rounded-bl-none bg-gray-800 border border-gray-700/60">
                <div className="flex gap-1 sm:gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT SECTION - RESPONSIVE */}
        <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 lg:py-5 bg-[#0f0f0f] border-t border-gray-700/50 shadow-2xl shrink-0">
          {error && (
            <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-red-900/30 border border-red-600/50 rounded-lg text-red-400 text-xs sm:text-sm animate-shake flex items-center gap-2 font-medium">
              <span>⚠️</span>
              <span className="truncate">{error}</span>
            </div>
          )}

          <div className="flex items-end gap-2 sm:gap-3">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
              className="flex-1 bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl md:rounded-2xl px-3 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 resize-none max-h-32 placeholder-gray-500"
            />

            <button
              onClick={handleSendMessageUI}
              disabled={isLoading || !chatInput.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-2 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-xl md:rounded-2xl text-xs sm:text-sm md:text-base font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-white shadow-lg hover:shadow-xl cursor-pointer flex items-center justify-center gap-1 sm:gap-2 shrink-0"
            >
              <span className="text-sm sm:text-base">📤</span>
              <span className="hidden md:inline">Send</span>
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MESSAGE VIEW */}
      <div className="flex-1 flex sm:hidden flex-col min-h-full bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a] overflow-hidden">
        {/* MOBILE HEADER */}
        <div className="px-3 py-2 bg-[#171717] border-b border-gray-700/50 flex items-center justify-between shrink-0">
          <button
            onClick={() => {/* Toggle sidebar */}}
            className="text-emerald-400 hover:text-emerald-300 transition-colors p-1"
            title="Back"
          >
            ← Chats
          </button>
          <h1 className="text-xs sm:text-sm font-semibold text-gray-300 truncate flex-1 text-center px-2">
            {chats[currentChatId]?.title || "Chat"}
          </h1>
          <div className="w-6"></div>
        </div>

        {/* MESSAGES CONTAINER - MOBILE */}
        <div
          ref={chatContainerRef}
          className="flex-1 px-2 py-3 space-y-2 overflow-y-auto scrollbar-hide"
        >
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center space-y-3">
                <div className="text-4xl animate-bounce">💬</div>
                <p className="text-xs font-semibold text-gray-400">No messages</p>
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              const isUser = msg.role === "user";

              return (
                <div
                  key={index}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} animate-slideUp group px-0.5`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  {!isUser && (
                    <div className="flex-shrink-0 mr-1">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                        🤖
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col">
                    <div
                      className={`px-2.5 py-1.5 rounded-2xl max-w-xs text-xs leading-snug break-words shadow-md ${
                        isUser
                          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
                          : "bg-gray-800 text-gray-100 border border-gray-700"
                      }`}
                    >
                      <ReactMarkdown components={markdownComponents}>
                        {isUser && isLast ? msg.content : msg.role === "assistant" && isLast ? typingMessage : msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>

                  {isUser && (
                    <div className="flex-shrink-0 ml-1">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {user?.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex justify-start animate-slideUp px-0.5">
              <div className="flex-shrink-0 mr-1">
                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  🤖
                </div>
              </div>
              <div className="px-2.5 py-1.5 rounded-2xl bg-gray-800 border border-gray-700">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* INPUT SECTION - MOBILE */}
        <div className="px-2 py-2 bg-[#0f0f0f] border-t border-gray-700/50 shadow-2xl shrink-0">
          {error && (
            <div className="mb-1.5 p-2 bg-red-900/30 border border-red-600/50 rounded text-red-400 text-xs animate-shake flex items-center gap-1 font-medium">
              <span>⚠️</span>
              <span className="truncate">{error}</span>
            </div>
          )}

          <div className="flex items-end gap-2">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type..."
              rows="1"
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none max-h-24 placeholder-gray-500"
            />

            <button
              onClick={handleSendMessageUI}
              disabled={isLoading || !chatInput.trim()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-300 text-white shadow-lg cursor-pointer"
            >
              📤
            </button>
          </div>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[#1e1e1e] rounded-2xl p-4 sm:p-6 w-[90%] max-w-sm shadow-2xl transform animate-scaleIn">
            <h2 className="text-base sm:text-lg font-semibold text-white mb-2">
              Delete Chat
            </h2>

            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-gray-700 hover:bg-gray-600 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleDeleteChat(chatToDelete);
                  setShowDeleteModal(false);
                }}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg bg-red-600 hover:bg-red-700 transition cursor-pointer"
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
