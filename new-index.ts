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
const prompt = fs.readFileSync("new-prompt.txt", "utf-8");
const subjectIdToContent: Record<string, string[]> = {};
const openai = new OpenAI();

const main = async () => {
    try {
        _initialize();
        const params = _getParams("new-params.json");

        const chatPromises = params.map(async (param) => {
            const parsedPrompt = _parsePrompt(prompt, param);
            const response = await _chat(parsedPrompt);
            const content = response.choices[0].message.content;

            for (let i = 0; i < param.headcounts; i++) {
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
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "user",
                content: content,
            },
        ],
        max_tokens: 2500,
    });

    // Check if reponse is valid
    if (!response.choices[0].message.content) {
        throw new Error("Missing result");
    }

    return response;
};

const _getCsvMatrix = (subjectToContent: Record<string, string[]>) => {
    const sortedSubjectToContent = sortObjectByKeys(subjectToContent);

    const matrix: string[][] = [];
    for (const [subjectId, contents] of Object.entries(
        sortedSubjectToContent
    )) {
        const splitContents = contents.map((content) => content.split("@@@"));
        for (const splitContent of splitContents) {
            matrix.push([subjectId, ...splitContent]);
        }
    }

    return matrix;
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

// const write = (path: string, subjectToContent: Record<string, string[]>) => {
//     const sortedSubjectToContent = sortObjectByKeys(subjectToContent);
//     let counter = 1;

//     for (const contents of Object.values(sortedSubjectToContent)) {
//         for (const audits of contents) {
//             let parsedContent = `"${audits}",`;
//             if (counter % 2 === 0) {
//                 parsedContent = `"${audits}"\n`;
//             }
//             fs.appendFileSync(path, parsedContent);
//             counter++;
//         }
//     }
// };

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

// const call = async (prompt: string, params: Param[]) => {
//     const chatPromises: Promise<any>[] = [];

//     for (let i = 0; i < params.length; i++) {
//         const headcounts = params[i].headcounts;
//         const subjectId = params[i].subjectId;

//         for (let j = 0; j < headcounts; j++) {
//             const parsedPrompt = _parsePrompt(prompt, params[i]);
//             chatPromises.push(chat(subjectId, parsedPrompt));
//         }
//     }

//     await Promise.all(chatPromises);

//     const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
//     const csvFileName = `response-${currentDate}.csv`;
//     write(csvFileName, subjectIdToContent);
// };

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

// call(prompt, params);
main();
