import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const chat = async (content: string, isLastCell: boolean = false) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: content,
      },
    ],
  });
  console.log(JSON.stringify(response, null, 2));

  const message = response.choices[0].message.content;
  write("response.csv", message, isLastCell);
};

const write = (
  path: string,
  content: string | null,
  isLastCell: boolean = false
) => {
  if (!content) {
    throw new Error("Missing content");
  }
  let parsedContent = `"${content}",`;
  if (isLastCell) {
    parsedContent = `"${content}"\n`;
  }
  fs.appendFileSync(path, parsedContent);
};

const prompt = fs.readFileSync("prompt.txt", "utf-8");

const call = async () => {
  for (let i = 1; i <= 10; i++) {
    if (i % 2 === 0) {
      await chat(prompt, true);
    } else {
      await chat(prompt);
    }
  }
};

call();
