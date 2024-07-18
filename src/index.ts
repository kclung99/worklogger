import "dotenv/config";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { upload, generateParams } from "./service/params";
import { generateWorkLogs } from "./service/worklogs";

const main = () => {
    yargs(hideBin(process.argv))
        .command(
            "upload [path]",
            "Upload a file",
            (yargs) => {
                return yargs.positional("path", {
                    describe: "Path to the file",
                    type: "string",
                    demandOption: true,
                });
            },
            async (argv) => {
                await upload(argv.path as string);
            }
        )
        .command(
            "generate-params [promptFileName] [fileId]",
            "Generate params from the uploaded file",
            (yargs) => {
                return yargs
                    .positional("promptFileName", {
                        describe: "File name of the prompt to generate params",
                        type: "string",
                        demandOption: true,
                    })
                    .positional("fileId", {
                        describe: "File ID of the uploaded file",
                        type: "string",
                        demandOption: false,
                    });
            },
            async (argv) => {
                await generateParams(
                    argv.promptFileName as string,
                    argv.fileId as string
                );
            }
        )
        .command(
            "generate-work-logs [promptFileName] [paramFileName]",
            "Generate work logs from the prompt and params",
            (yargs) => {
                return yargs
                    .positional("promptFileName", {
                        describe:
                            "File name of the prompt to generate work logs",
                        type: "string",
                        demandOption: true,
                    })
                    .positional("paramFileName", {
                        describe:
                            "File name of the params to generate work logs",
                        type: "string",
                        demandOption: true,
                    });
            },
            async (argv) => {
                await generateWorkLogs(
                    argv.promptFileName as string,
                    argv.paramFileName as string
                );
            }
        )
        .demandCommand(1, "You need to specify a command before moving on")
        .help().argv;
};

main();
