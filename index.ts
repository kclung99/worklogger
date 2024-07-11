import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";

type Param = {
  subject: string;
  content: string[];
  amount: number;
  additional: string;
};

type Params = Param[];

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API key");
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

const readParams = (path: string): Params => {
  const fileContent = fs.readFileSync(path, "utf-8");
  const params: Params = JSON.parse(fileContent);
  console.log(params);
  return params;
};

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

const call = async (prompt: string, params: Params) => {
  let counter = 1;
  for (let i = 0; i < params.length; i++) {
    const amount = params[i].amount;
    for (let j = 0; j < amount; j++) {
      const isLastCell = counter % 2 === 0;
      const parsedPrompt = parsePrompt(prompt, params[i]);
      await chat(parsedPrompt, isLastCell);
      counter++;
    }
  }
};
const parsePrompt = (prompt: string, param: Param) => {
  let parsedPrompt = prompt
    .replace(/\{\{subject\}\}/g, param.subject)
    .replace(/\{\{content\}\}/g, param.content.join("\n"))
    .replace(/\{\{additional\}\}/g, param.additional);
  console.log(parsedPrompt);
  return parsedPrompt;
};

const prompt = fs.readFileSync("prompt.txt", "utf-8");
const params = readParams("params.json");

call(prompt, params);
