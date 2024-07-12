import fs from "fs";
import "dotenv/config";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
});

let file: OpenAI.Files.FileObject;

async function main() {
	file = await openai.files.create({
		file: fs.createReadStream(
			"/Users/kclung/Downloads/安瀚 -113年-軍民啟動型-計畫書-RL-0329-1200無薪資版).docx"
		),
		purpose: "assistants",
	});

	console.log(file);
}

async function message() {
	// await main();

	const emptyThread = await openai.beta.threads.create();
	const threadMessages = await openai.beta.threads.messages.create(emptyThread.id, {
		role: "user",
		content: `根據三、實施方法下的二、分項計畫說明表格，請根據子技術為subject，查核指標為content，執行步驟為additional根據以下格式完成JSON，amount為0即可: [ { "subject": "A1 智能合約開發", "content": [ "截圖兩份：完成12項EIP-1056定義之智能合約程式介面。", "使用公開資料集，從中隨機挑選十份資料，進行 secp256r1簽章驗證測試，並提供各項測試通過與否之測試報告一式。", "已部署智能合約之區塊鏈瀏覽器連結一份" ], "additional": ["遵循EIP-1056 智能合約程式介面,支援secp256r1橢圓區線加密之簽章驗證。", "部署智能合約至區塊鏈上。"], "amount": 0 } ]`,
		attachments: [
			{
				// file_id: file.id,
				file_id: "file-U9URRPGAZWnono7LpgxBjbKw",
				tools: [{ type: "file_search" }],
			},
		],
	});

	console.log(JSON.stringify(threadMessages, null, 2));
}

message();
