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

      if (!state.chats[chatId]) return;

      state.chats[chatId].messages.push({ content, role });
      state.chats[chatId].lastUpdated = new Date().toISOString();
    },

    setCurrentChatId(state, action) {
      state.currentChatId = action.payload;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
  },
});

export const {
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addNewMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
