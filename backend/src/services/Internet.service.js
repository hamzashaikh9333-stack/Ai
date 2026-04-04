import { tavily as Tavily } from "@tavily/core";

const tavily = new Tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchInternet = async (query) => {
  console.log("TOOL CALLED:", query);

  const result = await tavily.search(query, {
    maxResults: 5,
    searchDepth: "advanced",
  });

  // ✅ Convert to readable text
  return result.results
    .map((r, i) => `${i + 1}. ${r.title}\n${r.content}`)
    .join("\n\n");
};
