🚧 This project is still under construction, radical changes should be expected 🚧

## About

This project aims to simplify the work logging process.

## Getting Started

1. Setup

    1. Clone the project repository and navigate to the project directory.

        ```sh
        git clone https://github.com/kclung99/worklogger.git
        ```

        ```sh
        cd worklogger
        ```

    2. Run the following command in your terminal to install all dependencies.

        ```sh
        npm install
        ```

    3. Create a `.env` file with the content `OPENAI_API_KEY=[YOUR-API-KEY]`. You can either create this file manually or run the following command

        ```sh
        echo OPENAI_API_KEY=[YOUR-API-KEY] > .env
        ```

        - You can obtain your OpenAI API Key by visiting [here](https://platform.openai.com/api-keys). Make sure to add credit to your account for the API to work. (5 USD is a recommended amount!)

2. Creating a work log (as a CSV file) can be done in 3 simple steps.

    1. Upload the project document.

        ```sh
        npm run upload [PATH-OF-YOUR-PROJECT-DOC]
        ```

        - `[PATH-OF-YOUR-PROJECT-DOC]`: The path to the project documentation you wish to upload (e.g., `~/Desktop/my-doc.docs`).

    2. Generate parameters (as a JSON file) from the uploaded document.

        ```sh
        npm run generate-params [PROMPT-FILE-NAME]
        ```

        - `[PROMPT-FILE-NAME]`: The file name of the prompt file you wish to use for generating params from the `src/prompt/` directory (e.g., `my-params-prompt.txt`).

        After the execution, you can find the auto-generated params file at `./src/params/auto-generated-params.json`.

        Please note that the AI-generated params may not be completely accurate. It is recommended to manually review and update the params for the best results.

        For information about the meaning of each field in the auto-generated params file, refer to [here](#param-fields). Feel free to customize the settings according to your needs!

    3. Generate work logs.

        ```sh
        npm run generate-work-logs [PROMPT-FILE-NAME] [PARAM-FILE-NAME]
        ```

        - `[PROMPT-FILE-NAME]`: The file name of the prompt file you wish to use for generating the work logs from the `src/prompt/` directory (e.g., `my-worklog-prompt.txt`).
        - `[PARAM-FILE-NAME]`: The file name of the param file you wish to use alongside with the worklogs from the `src/param/` directory (e.g., `auto-generated-params.json`).

    Congratulations! The work logs have been created. You can find the result file at `./output/response-{YYYYMMDD}-{HHMM}.csv`. You have now harnessed the power of AI!

    Please note that since AI-generated results can be unpredictable, feel free to repeat steps 2 and 3 multiple times to achieve the optimal result.

3. That's it! You are now ready to start generating your work log. To view the generated work log, run the following command:

    ```sh
    open output/response-{YYYYMMDD}-{HHMM}.csv
    ```

## Param Fields

-   `subjectId`: A unique identifier for the subject or project task. It helps distinguish between different tasks.
-   `subject`: The name or title of the subject or project task. It provides a brief idea of what the task is focused on.
-   `time`: The scheduled time frame for the project or task. It indicates when the task is supposed to start and end.
-   `audits`: An array of strings, each representing a specific requirement or checkpoint that needs to be audited or verified for the task. These could include tests, verifications, or any other form of audit criteria.
-   `steps`: An array of strings detailing the steps or procedures to be followed to complete the task. It acts as a guideline or roadmap for accomplishing the task objectives. This represents the number of `columns` for each subject.
-   `stages`: An integer indicating the number of stages or phases the task is divided into. It helps organize the task into manageable parts.
-   `headcounts`: An integer representing the number of individuals involved. This represents the number of `rows` for each subject.
-   `additional`: An array that can hold any additional information or requirements for the task.

## Known Issues

-   Currently empty...

## Future Updates

-   Update logs
-   Update readme on creating prompts
-   Update readme on tweaking params
-   Experiment with fine-tuned models
-   Experiment with sending positive feedback to reinforce results
-   Improve prompt templates (e.g., persona)
-   Add argument validation for commands
-   Refactor code (possibly create a new utils.ts file)
-   Add cost and execution time calculation
