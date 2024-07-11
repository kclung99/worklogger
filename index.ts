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

const chat = async (content: string) => {
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
	write("response.txt", message);
};

const write = (path: string, content: string | null) => {
	if (!content) {
		content = "";
	}
	fs.writeFileSync(path, content);
};

const prompt = fs.readFileSync("prompt.txt", "utf-8");

chat(prompt);
