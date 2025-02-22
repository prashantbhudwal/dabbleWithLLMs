import { generateText, tool } from "ai";
import wiki from "wikipedia";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { Logger } from "tslog";

const tslog = new Logger({
  type: "pretty",
  minLevel: 0,
});

const searchWiki = async function (query: string) {
  try {
    const searchResults = await wiki.search(query);
    return searchResults.results;
  } catch (error) {
    console.error("Error searching Wikipedia:", error);
    return [];
  }
};

const fetchWiki = async function () {
  try {
    const searchResults = await searchWiki("Batman");
    console.log("Search results:", searchResults);

    const page = await wiki.page("Batman");
    const content = await page.content();
    console.log("Page content:", content);
  } catch (error) {
    console.error("Error fetching Wikipedia content:", error);
  }
};

const searchWikipediaByKeyword = tool({
  description: "Searches wikipedia and responds with a grounded response",
  parameters: z.object({
    keyword: z.string().describe("Search Keyword"),
  }),
  execute: async ({ keyword }, {}) => {
    return await searchWiki(keyword);
  },
});

const getWikiPediaPageContentById = tool({
  description: "Get wikipedia page content by page id.",
  parameters: z.object({}),
});

const defaultModel = openai("o3-mini");

const wikiAgent = async function () {
  const response = await generateText({
    model: defaultModel,
    prompt: "Who could be Rhonda?",
    tools: { searchWikipediaByKeyword },
    maxSteps: 2,
  });
  return response;
};

const run = async function () {
  const response = await generateText({
    prompt: "How are you doing",
    model: defaultModel,
    maxSteps: 2,
  });
  tslog.silly(response)
};

await run();
