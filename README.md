🚧 This project is still under construction 🚧

## About

This project is intended to simplify the work logging process.

## Getting Started! (not available yet)

1. Setup

    1. Git clone the project then cd into the project directory.

    2. Run the following command in your terminal to install all dependencies.

        ```sh
        npm install
        ```

    3. Add a `.env` file with `OPENAI_API_KEY=<your-api-key>`

2. Once all the dependencies are installed. You should be able to create a work log CSV file in 3 simple steps.

    1. Upload the project document

        ```sh
        npm run upload <path-of-your-report-file>
        ```

        - `<path-of-your-report-file>`: The path to the report file you wish to upload. This can be a relative or absolute path. For example, if your report file is on the desktop, you might use `~/Desktop/my-document.docs`.

    2. Generate params

        ```sh
        npm run generate-params <prompt-file-name>
        ```

        You can check out the auto generated params file at `./src/params/auto-generated-params.json`.

        Noted that the AI generated params are often not fully correct, please manually update the params for the following process to get the best result.

        Questions about all the fields in the auto generated params file can be found [here](#param-fields)

    3. Generate work logs

        ```sh
        npm run generate-work-logs <prompt-file-name>
        ```

        Here you go. The work logs have been created. Check out the result file at `./response-{year-date}.csv`. You've now harvested the power of AI. You are AI.

## Param Fields

nothing...

## Known Issues

## Upcoming Updates

-   Support dynamic inputs for param (and template)
-   update logs
-   Add cost of execution (calculate from token usage and model)
-   Add experimental persona with each prompt
-   Improve prompt to achieve more precise outputs
-   Add experimental positive feedback to reinforce desired result
-   Rename services
