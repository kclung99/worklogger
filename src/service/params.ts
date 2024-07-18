import "dotenv/config";
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const _createAssistant = async () => {
    return await openai.beta.assistants.create({
        name: "Report Analysis Assistant",
        instructions:
            "Your assistant will help you analyze a report and build corresponding params. Please upload a report and ask questions about it.",
        model: "gpt-4o",
        tools: [{ type: "file_search" }],
    });
};

const _uploadFile = async (path: string) => {
    return await openai.files.create({
        file: fs.createReadStream(path),
        purpose: "assistants",
    });
};

const _createThread = async (fileId: string, content: string) => {
    return await openai.beta.threads.create({
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
};

const _run = async (threadId: string, assistantId: string) => {
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
        assistant_id: assistantId,
    });

    return await openai.beta.threads.messages.list(threadId, {
        run_id: run.id,
    });
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

const main = async () => {
    // const assistant = await _createAssistant();
    // console.log(JSON.stringify(assistant, null, 2));

    // const file = await _uploadFile(
    // 	"/Users/kclung/Desktop/安瀚 -113年-軍民啟動型-計畫書-RL-0329-1200無薪資版).docx"
    // );
    // console.log(JSON.stringify(file, null, 2));

    const prompt = fs.readFileSync("src/template/params-template.txt", "utf-8");
    // const thread = await _createThread(file.id, prompt);
    const thread = await _createThread("file-sfJrLJVLe7IN7nIs5P2r9FaT", prompt);
    console.log(JSON.stringify(thread, null, 2));

    // const messages = await _run(thread.id, assistant.id);
    const messages = await _run(thread.id, "asst_0G0mnTW3Dbzl7S4XS8p8mhRc");
    console.log(JSON.stringify(messages, null, 2));

    const messageData = _parseMessageData(messages.data.pop()!);

    const match = messageData.match(/\[(.*)\]/s); // Get content from the first "[" to the last "]" (valid JSON format)

    if (match) {
        const jsonData = JSON.parse(match[0]);
        const jsonContent = JSON.stringify(jsonData, null, 2);

        const filePath = "src/param/auto-create-params.json";
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        fs.writeFileSync(filePath, jsonContent, "utf8");

        console.log(jsonContent);
    } else {
        console.log("Not valid JSON format. No match found");
        return;
    }
};

main();
