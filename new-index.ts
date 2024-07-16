import "dotenv/config";
import OpenAI from "openai";
import fs from "fs";

type Param = {
    subjectId: string;
    subject: string;
    time: string;
    audits: string[];
    steps: string[];
    stages: number;
    headcounts: number;
    additional?: string[];
};

const _setup = () => {
    if (!OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API key");
    }
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
});

const readParams = (path: string): Param[] => {
    const fileContent = fs.readFileSync(path, "utf-8");
    const params: Param[] = JSON.parse(fileContent);
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
    console.log(JSON.stringify(result, null, 2));
    console.log(JSON.stringify(response, null, 2));
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
        for (const audits of contents) {
            let parsedContent = `"${audits}",`;
            if (counter % 2 === 0) {
                parsedContent = `"${audits}"\n`;
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

const call = async (prompt: string, params: Param[]) => {
    const chatPromises: Promise<any>[] = [];

    for (let i = 0; i < params.length; i++) {
        const headcounts = params[i].headcounts;
        const subjectId = params[i].subjectId;

        for (let j = 0; j < headcounts; j++) {
            const parsedPrompt = _parsePrompt(prompt, params[i]);
            chatPromises.push(chat(subjectId, parsedPrompt));
        }
    }

    await Promise.all(chatPromises);

    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const csvFileName = `response-${currentDate}.csv`;
    write(csvFileName, subjectToContent);
};

const _parsePrompt = (prompt: string, param: Param) => {
    let parsedPrompt = prompt
        .replace(/\{\{subjectId\}\}/g, param.subjectId)
        .replace(/\{\{subject\}\}/g, param.subject)
        .replace(/\{\{time\}\}/g, param.time)
        .replace(/\{\{audits\}\}/g, param.audits.join("\n"))
        .replace(/\{\{steps\}\}/g, param.steps.join("\n"))
        .replace(/\{\{stages\}\}/g, param.stages.toString())
        .replace(/\{\{headcounts\}\}/g, param.headcounts.toString())
        .replace(/\{\{additional\}\}/g, param.additional.join("\n"));

    console.log(parsedPrompt);

    return parsedPrompt;
};

const prompt = fs.readFileSync("new-prompt.txt", "utf-8");
const params = readParams("new-params.json");

call(prompt, params);
