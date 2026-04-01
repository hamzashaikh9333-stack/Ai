import { initializeSocketConnection } from "../service/chat.socket";
import {
  sendMessage,
  getChats,
  getMessages,
  deleteChat,
} from "../service/chat.api";
import {
  setCurrentChatId,
  setLoading,
  setError,
  createNewChat,
  addNewMessage,
} from "../chat.slice";
import { useDispatch } from "react-redux";

export function useChat() {
  const dispatch = useDispatch();

  async function handleSendMessage({ message, chatId }) {
    try {
      // 🔵 1. Loader ON
      dispatch(setLoading(true));

      // 🔵 2. Backend call
      const data = await sendMessage({ message, chatId });
      console.log("HOOK DATA SENT:", { message, chatId });
      // 🔴 3. Error handle
      if (data.error) {
        dispatch(setError(data.error));
        return;
      }

      // 🟢 4. Data extract
      const { chat, userMessage, aiMessage } = data;

      // 🟡 5. Redux update (IMPORTANT)
      dispatch(createNewChat({ chatId: chat._id, title: chat.title }));

      dispatch(
        addNewMessage({
          chatId: chat._id,
          content: userMessage.content, 
          role: "user",
        }),
      );

      dispatch(
        addNewMessage({
          chatId: chat._id,
          content: aiMessage.content, 
          role: "assistant",
        }),
      );

      // 🟣 6. Current chat set
      dispatch(setCurrentChatId(chat._id));
    } catch (error) {
      dispatch(setError("Something went wrong"));
    } finally {
      // ⚪ 7. Loader OFF
      dispatch(setLoading(false));
    }
  }

  return { initializeSocketConnection, handleSendMessage };
}
