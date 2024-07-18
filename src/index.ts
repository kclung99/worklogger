import "dotenv/config";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

import { test as testParams, upload, generateParams } from "./service/params";
import { main as create } from "./service/create";

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
            "params",
            "Example of preconfigured pipeline for generating params",
            () => {},
            async () => {
                await testParams();
            }
        )
        .command(
            "create",
            "Example of preconfigured pipeline for generating work logs",
            () => {},
            async () => {
                await create();
            }
        )
        .demandCommand(1, "You need to specify a command before moving on")
        .help().argv;
};

main();
