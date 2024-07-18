import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

// const test = async () => {
//     // Assistant already created, file already uploaded
//     const prompt = fs.readFileSync("src/prompt/params-template.txt", "utf-8");
//     const thread = await _createThread("file-sfJrLJVLe7IN7nIs5P2r9FaT", prompt);
//     const messages = await _run(thread.id, "asst_0G0mnTW3Dbzl7S4XS8p8mhRc");
//     const messageData = _parseMessageData(messages.data.pop()!);
//     _writeToFile("src/param/auto-create-params.json", messageData);
// };

const upload = async (path: string) => {
    const file = await _uploadFile(path);
    const assistant = await _createAssistant();

    const config = _getConfig();

    config["file-id"] = file.id;
    config["assistant-id"] = assistant.id;

    fs.writeFileSync(
        "src/config.json",
        JSON.stringify(config, null, 2),
        "utf8"
    );
};

const generateParams = async (promptFileName: string, fileId: string) => {
    const parsedPromptFileName = promptFileName.replace(/^"|"$/g, ""); // remove quotation marks
    const config = _getConfig();

    let assistantId = config["assistant-id"];
    if (!_isValidValue(assistantId)) {
        console.log("Assistant ID is missing");
        return;
    }

    // TODO: remove this (and also the arg, let fileId adn assistantId be bundled in config)
    if (!fileId) {
        fileId = config["file-id"];
        if (!_isValidValue(fileId)) {
            console.log("File ID is missing");
            return;
        }
    }

    const prompt = fs.readFileSync(
        `src/prompt/${parsedPromptFileName}`,
        "utf-8"
    );
    const thread = await _createThread(fileId, prompt);
    const messages = await _run(thread.id, assistantId);
    const messageData = _parseMessageData(messages.data.pop()!);

    _writeToFile("src/param/auto-generated-params.json", messageData);
};

const _isValidValue = (value: string) => {
    return value !== undefined && value !== null && value !== "";
};

const _getConfig = () => {
    const configContent = fs.readFileSync("src/config.json", "utf8");
    return JSON.parse(configContent);
};

const _uploadFile = async (path: string) => {
    const file = await openai.files.create({
        file: fs.createReadStream(path),
        purpose: "assistants",
    });
    console.log(JSON.stringify(file, null, 2));
    return file;
};

const _createAssistant = async () => {
    const assistant = await openai.beta.assistants.create({
        name: "Report Analysis Assistant",
        instructions:
            "Your assistant will help you analyze a report and build corresponding params. Please upload a report and ask questions about it.",
        model: "gpt-4o",
        tools: [{ type: "file_search" }],
    });
    console.log(JSON.stringify(assistant, null, 2));
    return assistant;
};

const _createThread = async (fileId: string, content: string) => {
    const thread = await openai.beta.threads.create({
        messages: [
            {
                role: "user",
                content: content,
                attachments: [
                    { file_id: fileId, tools: [{ type: "file_search" }] },
                ],
            },
        ],
    });
    console.log(JSON.stringify(thread, null, 2));
    return thread;
};

const _run = async (threadId: string, assistantId: string) => {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
    });
    console.log(JSON.stringify(run, null, 2));

    const messageList = await openai.beta.threads.messages.list(threadId, {
        run_id: run.id,
    });
    console.log(JSON.stringify(messageList, null, 2));
    return messageList;
};

const _parseMessageData = (message: OpenAI.Beta.Threads.Messages.Message) => {
    if (message.content[0].type === "text") {
        const { text } = message.content[0];
        // const { annotations } = text;
        // const citations: string[] = [];

        // let index = 0;
        // for (let annotation of annotations) {
        // 	text.value = text.value.replace(annotation.text, "[" + index + "]");
        // 	const { file_citation } = annotation;
        // 	if (file_citation) {
        // 		const citedFile = await openai.files.retrieve(file_citation.file_id);
        // 		citations.push("[" + index + "]" + citedFile.filename);
        // 	}
        // 	index++;
        // }

        // console.log(text.value);
        // console.log(citations.join("\n"));
        return text.value;
    }
    return "";
};

const _writeToFile = (filePath: string, messageData: string) => {
    // Get content from the first "[" to the last "]" (prepare valid JSON input for parsing)
    const match = messageData.match(/\[(.*)\]/s);

    if (match) {
        const jsonData = JSON.parse(match[0]);
        const jsonContent = JSON.stringify(jsonData, null, 2);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        fs.writeFileSync(filePath, jsonContent, "utf8");
        console.log(`File ${filePath} has been created`);
    } else {
        console.log("Invalid JSON format");
        return;
    }
};

export { upload, generateParams };
