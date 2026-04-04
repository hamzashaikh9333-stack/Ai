import { useCallback } from "react";
import { initializeSocketConnection } from "../service/chat.socket";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat as deleteChatAPI,
} from "../service/chat.api";
import {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addNewMessage,
  setMessages,
  deleteChat,
} from "../chat.slice";
import { useDispatch } from "react-redux";

export function useChat() {
  const dispatch = useDispatch();

  const handleSendMessage = useCallback(
    async ({ message, chatId }) => {
      try {
        dispatch(setLoading(true));

        // Add user message optimistically
        dispatch(
          addNewMessage({
            chatId: chatId,
            content: message,
            role: "user",
          }),
        );

        // Send message to backend (pass null for new chats with temp ID)
        const isNewChat = chatId && chatId.startsWith("temp-");
        const tempChatId = isNewChat ? chatId : null;

        const data = await sendMessage({
          message,
          chatId: isNewChat ? null : chatId,
        });

        // Error handling
        if (!data || data.error) {
          dispatch(setError(data?.error || "Message failed"));
          return;
        }

        // Extract real chat data from backend
        const { chat, userMessage, aiMessage } = data;
        const realChatId = chat._id;

        // Build messages array from backend response
        const messagesArray = [
          {
            content: userMessage.content,
            role: userMessage.role || "user",
          },
          {
            content: aiMessage.content,
            role: aiMessage.role === "ai" ? "assistant" : aiMessage.role,
          },
        ];

        // If this is a new chat, clean up the temporary chat
        if (tempChatId) {
          dispatch(deleteChat(tempChatId));
        }

        // Create/Update chat with real ID and title from backend
        dispatch(createNewChat({ chatId: realChatId, title: chat.title }));

        // Set messages from the response (no need to fetch again)
        dispatch(setMessages({ chatId: realChatId, messages: messagesArray }));

        // Switch to the real chat ID
        dispatch(setCurrentChatId(realChatId));
      } catch (error) {
        dispatch(setError(error.message || "Something went wrong"));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const handleGetChat = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      const data = await getChats();

      if (!data || data.error) {
        dispatch(setError(data?.error || "Failed to fetch chats"));
        return;
      }

      dispatch(setChats(data.chats));

      const savedChatId = localStorage.getItem("currentChatId");

      // 👉 check if saved chat actually exists
      const chatExists = data.chats.find((chat) => chat._id === savedChatId);

      if (chatExists) {
        dispatch(setCurrentChatId(savedChatId));
      } else if (data.chats.length > 0) {
        dispatch(setCurrentChatId(data.chats[0]._id));
      }
    } catch (error) {
      dispatch(setError("Failed to fetch chats"));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const handleGetMessages = useCallback(
    async (chatId) => {
      try {
        dispatch(setLoading(true));

        const data = await getMessages(chatId);

        if (!data || data.error) {
          dispatch(setError(data?.error || "Failed to fetch messages"));
          return;
        }
        dispatch(setMessages({ chatId, messages: data.messages }));
      } catch (error) {
        dispatch(setError("Failed to fetch messages"));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const handleDeleteChat = useCallback(
    async (chatId) => {
      try {
        dispatch(setLoading(true));
        const data = await deleteChatAPI(chatId);
        if (!data || data.error) {
          dispatch(setError(data?.error || "Failed to delete chat"));
          return;
        }
        // Dispatch reducer to remove from Redux state
        // (the reducer will also reset currentChatId if it's the deleted chat)
        dispatch(deleteChat(chatId));
      } catch (error) {
        dispatch(setError("Failed to delete chat"));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  const handleCreateNewChat = useCallback(() => {
    // Generate a unique temporary ID for the new chat
    const tempChatId = `temp-${Date.now()}`;

    // Create new chat in Redux with temp ID
    dispatch(
      createNewChat({
        chatId: tempChatId,
        title: "New Chat",
      }),
    );

    // Set it as the current chat
    dispatch(setCurrentChatId(tempChatId));
    localStorage.setItem("currentChatId", tempChatId);
  }, [dispatch]);

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChat,
    handleGetMessages,
    handleDeleteChat,
    handleCreateNewChat,
  };
}
