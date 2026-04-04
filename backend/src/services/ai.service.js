import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  tool,
  createAgent,
} from "langchain";
import * as Z from "zod";
import { searchInternet } from "./Internet.service.js";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const searchInternetTool = tool(searchInternet, {
  name: "searchInternet",
  description:
    "Search the internet for latest news, current events, or real-time information.",
  schema: Z.object({
    query: Z.string().describe("Search query for latest information"),
  }),
});

const agent = createAgent({
  model: geminiModel,
  tools: [searchInternetTool],
  maxIterations: 3,
});

export async function generateResponse(messages) {
  try {
    const userMessage = messages[messages.length - 1]?.content || "";

    // ✅ ONLY search when BOTH conditions match
    const shouldSearch =
      /(latest|breaking|today|current)/i.test(userMessage) &&
      /(news|update|updates|war|price|match|stock)/i.test(userMessage);

    // 🔥 REALTIME FLOW (ONLY when needed)
    if (shouldSearch) {
      console.log("REALTIME MODE");

      const toolResult = await searchInternet(userMessage);

      try {
        const response = await geminiModel.invoke([
          new SystemMessage(`
You are a helpful AI.

IMPORTANT:
- Use ONLY the provided data
- Do NOT use your own knowledge
- Give latest and accurate answer

DATA:
${toolResult}
`),
          new HumanMessage(userMessage),
        ]);

        return response?.content || response?.text || "";
      } catch (error) {
        console.log("Gemini failed → using Mistral");

        const response = await mistralModel.invoke([
          new SystemMessage(`
Use ONLY this data to answer:

${toolResult}
`),
          new HumanMessage(userMessage),
        ]);

        return response?.content || response?.text || "";
      }
    }

    // 🔥 NORMAL CHAT (NO SEARCH)
    const formattedMessages = messages
      .map((msg) => {
        if (msg.role === "user") return new HumanMessage(msg.content);
        if (msg.role === "ai") return new AIMessage(msg.content);
        return null;
      })
      .filter(Boolean);

    try {
      const response = await geminiModel.invoke([
        new SystemMessage(`
You are a helpful AI assistant.

- Be clear and concise
- Do not repeat
- Keep answers natural
`),
        ...formattedMessages,
      ]);

      return response?.content || response?.text || "";
    } catch (error) {
      console.log("Gemini failed → fallback Mistral");

      const response = await mistralModel.invoke([
        new SystemMessage("You are a helpful AI assistant."),
        ...formattedMessages,
      ]);

      return response?.content || response?.text || "";
    }
  } catch (error) {
    console.error("Error generating response:", error);
    return "Something went wrong. Please try again.";
  }
}

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
      You are a helpful assistant that generates concise and descriptive titles for chat conversations.
      User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant,and engaging, giving users a quick understanding of the chat's topic.
      `),
    new HumanMessage(
      `Generate a title for a chat conversation based on the following first message: "${message}"`,
    ),
  ]);
  return response.text;
}
