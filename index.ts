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

const subjectToContent: Record<string, string[]> = {};

const chat = async (subject: string, content: string) => {
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

  const result = response.choices[0].message.content;
  if (!subjectToContent[subject]) {
    subjectToContent[subject] = [];
  }
  if (!result) {
    throw new Error("Missing result");
  }
  subjectToContent[subject].push(result);
  return response;
};

const write = (path: string, subjectToContent: Record<string, string[]>) => {
  const sortedSubjectToContent = sortObjectByKeys(subjectToContent);
  let counter = 1;

  for (const contents of Object.values(sortedSubjectToContent)) {
    for (const content of contents) {
      let parsedContent = `"${content}",`;
      if (counter % 2 === 0) {
        parsedContent = `"${content}"\n`;
      }
      fs.appendFileSync(path, parsedContent);
      counter++;
    }
  }
};

function sortObjectByKeys(
  subjectToContent: Record<string, string[]>
): Record<string, string[]> {
  // Get the keys of the object and sort them
  const sortedKeys = Object.keys(subjectToContent).sort();

  // Create a new object with sorted keys
  const sortedObject: Record<string, string[]> = {};
  for (const key of sortedKeys) {
    sortedObject[key] = subjectToContent[key];
  }

  return sortedObject;
}

const call = async (prompt: string, params: Params) => {
  const chatPromises: Promise<any>[] = [];

  for (let i = 0; i < params.length; i++) {
    const amount = params[i].amount;
    const subject = params[i].subject;

    for (let j = 0; j < amount; j++) {
      const parsedPrompt = _parsePrompt(prompt, params[i]);
      chatPromises.push(chat(subject, parsedPrompt));
    }
  }

  await Promise.all(chatPromises);
  write("response.csv", subjectToContent);
};

const _parsePrompt = (prompt: string, param: Param) => {
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
