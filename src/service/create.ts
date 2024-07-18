import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";
import { stringify } from "csv-stringify/sync";

type Param = {
    subjectId: string;
    subject: string;
    time: string;
    audits: string[];
    steps: string[];
    stages: number;
    headcounts: number;
    additional: string[];
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const prompt = fs.readFileSync("src/template/create-template.txt", "utf-8");
const subjectIdToContent: Record<string, string[]> = {};
const openai = new OpenAI();

const main = async () => {
    try {
        _initialize();
        const params = _getParams("src/param/create-params.json");

        const chatPromises = params.map(async (param) => {
            const parsedPrompt = _parsePrompt(prompt, param);
            for (let i = 0; i < param.headcounts; i++) {
                const response = await _chat(parsedPrompt);
                const content = response.choices[0].message.content;
                // TODO: remove unecessary loggings later
                console.log("content", response);

                // TODO: Add proper error handling for content
                if (subjectIdToContent[param.subjectId]) {
                    subjectIdToContent[param.subjectId].push(content!);
                } else {
                    subjectIdToContent[param.subjectId] = [content!];
                }
            }
        });

        await Promise.all(chatPromises);
        for (const [k, v] of Object.entries(subjectIdToContent)) {
            console.log("key:", k, "value:", v);
        }

        const matrix = _getCsvMatrix(subjectIdToContent);
        for (const row of matrix) {
            console.log(row);
        }

        _write(matrix);
    } catch (error) {
        console.error("An error occurred in the main function:", error);
    }
};

const _initialize = () => {
    if (!OPENAI_API_KEY) {
        throw new Error("Missing OpenAI API key");
    }
};

const _getParams = (path: string): Param[] => {
    const fileContent = fs.readFileSync(path, "utf-8");
    const params: Param[] = JSON.parse(fileContent);
    return params;
};

const _chat = async (content: string) => {
    // TODO: Upgrade function call (completions seems to be outdated)
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: content,
            },
        ],
        max_tokens: 2000,
    });

    // Check if reponse is valid
    if (!response.choices[0].message.content) {
        throw new Error("Missing result");
    }

    return response;
};

const _getCsvMatrix = (subjectToContent: Record<string, string[]>) => {
    const sortedSubjectToContent = _sortObjectByKeys(subjectToContent);

    const matrix: string[][] = [];
    for (const [subjectId, contents] of Object.entries(
        sortedSubjectToContent
    )) {
        const splitContents = _getSplitContents(contents);
        for (const splitContent of splitContents) {
            matrix.push([subjectId, ...splitContent]);
        }
    }

    return matrix;
};

const _getSplitContents = (contents: string[]) => {
    const splitContents: string[][] = [];
    // Parse data (trim -> split -> filter)
    for (const content of contents) {
        const trimmedContent = content.trim();
        const splitContent = trimmedContent.split("@@@");
        // Basic filtering, filter out empty strings, new lines, and apparent wrong data
        const filteredContent = splitContent.filter(
            (c) => c !== "" && c !== "\n" && c.length > 15
        );
        splitContents.push(filteredContent);
    }
    return splitContents;
};

const _write = (matrix: string[][]) => {
    const csvString = stringify(matrix);

    const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const fileName = `response-${currentDate}.csv`;

    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
    fs.writeFileSync(fileName, csvString);
};

function _sortObjectByKeys(
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

main();
