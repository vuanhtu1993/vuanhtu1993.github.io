import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import * as dotenv from "dotenv";

dotenv.config();

async function testModel(modelName: string) {
  try {
    console.log(`Testing model: ${modelName}`);
    const llm = new ChatGoogleGenerativeAI({
      model: modelName,
      temperature: 0,
    });
    const res = await llm.invoke("Hello");
    console.log(`Success with ${modelName}! Response:`, res.content);
    return true;
  } catch (e: any) {
    console.log(`Failed with ${modelName}:`, e.message.split("\n")[0]);
    return false;
  }
}

async function run() {
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-002",
    "gemini-1.5-pro",
    "gemini-2.5-flash",
    "gemini-pro"
  ];
  
  for (const m of models) {
    if (await testModel(m)) break;
  }
}

run();
