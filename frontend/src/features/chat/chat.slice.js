import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: {},
    currentChatId: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setChats(state, action) {
      const chatsArray = action.payload;

      const chatsObject = {};

      chatsArray.forEach((chat) => {
        chatsObject[chat._id] = {
          id: chat._id,
          title: chat.title,
          messages: [],
          lastUpdated: chat.updatedAt,
        };
      });

      state.chats = chatsObject;
    },
    createNewChat(state, action) {
      const { chatId, title } = action.payload;

      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title,
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }
    },

    addNewMessage(state, action) {
      const { chatId, content, role } = action.payload;

      if (!state.chats[chatId]) {
        state.chats[chatId] = {
          id: chatId,
          title: "New Chat",
          messages: [],
          lastUpdated: new Date().toISOString(),
        };
      }

      state.chats[chatId].messages.push({ content, role });
      state.chats[chatId].lastUpdated = new Date().toISOString();
    },

    setCurrentChatId(state, action) {
      state.currentChatId = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
      state.error = null;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    setMessages(state, action) {
      const { chatId, messages } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].messages = messages;
        state.chats[chatId].lastUpdated = new Date().toISOString();
      }
    },

    appendMessages(state, action) {
      const { chatId, messages } = action.payload;
      if (state.chats[chatId]) {
        state.chats[chatId].messages = [
          ...state.chats[chatId].messages,
          ...messages,
        ];
        state.chats[chatId].lastUpdated = new Date().toISOString();
      }
    },
    deleteChat(state, action) {
      const chatId = action.payload;
      delete state.chats[chatId];
      if (state.currentChatId === chatId) {
        state.currentChatId = null;
      }
    },
  },
});

export const {
  setChats,
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addNewMessage,
  setMessages,
  appendMessages,
  deleteChat,
} = chatSlice.actions;
export default chatSlice.reducer;
