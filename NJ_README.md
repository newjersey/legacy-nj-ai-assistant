# New Jersey AI Assistant

This document has information specific to the NJ-specific fork of the Microsoft open source OpenAI chat app.

## Overall architecture

- This full-stack application uses a Python web server, React frontend, and is deployed on Azure App Service
- This code is deployed to a production stage (`nj-stable` branch) and dev stage (`nj-stable-dev` branch)
- Note that certain features from the open-source parent are not enabled, such as chat history (anything related to `CosmosDB`)

## Contributing to the NJ AI Assistant
- To contribute to the NJ AI assistant, create a feature branch from the `nj-stable-dev` branch of the `newjersey/nj-ai-assistant` repository. Add changes to the feature branch then open a PR to have it merged into the `nj-stable-dev` branch. **When merging changes to the `nj-stable-dev` branch, the "Squash and merge" option is preferred".**
- After previewing changes on the dev site, open a PR to merge changes from `nj-stable-dev` to `nj-stable`. **When merging changes to the `nj-stable` branch, merging without squashing is preferred.**

## Local setup

1. Clone repo and go to `nj-stable` branch
2. Copy `.env` file from Bitwarden (reach out to Platform team for access)
3. Ensure that you have python version 3.11 installed locally.
4. Run `./start.sh`

## Deployment

1. Log into Azure and go to the `nj-aichat-internal` App Service (reach out to Platform team for access)
2. [If dev stage] In the left menu, click Deployments > Deployment slots. Click on `nj-aichat-internal-dev`.
3. In the left menu, click Deployments > Deployment Center.
4. In the top bar, click the "Sync" button to sync the deployed application with the latest commit on the corresponding branch.
5. Under the top bar, click the "Logs" tab to see the deployment status (it will change to "Success" when completed)

## Updating site copy

The site title and copy that appear in the background of the NJ AI assistant are stored in the environment variables.

The site title is stored as `UI_CHAT_TITLE` while the site copy is stored as `UI_CHAT_DESCRIPTION`.

**To update the title or copy when running locally,** please update the variables in your `.env` file. Make sure to save the updated changes to the `.env` file stored in Bitwarden as well.

**To update the title or copy in dev or prod,** you will need to make updates in the Azure console:
1. Open the resource in Azure
2. Expand the "Settings" dropdown in the lefthand panel
3. Open the "Environment variables" screen. From here you will be able to find and update the relevant environment variables.
4. When you have finished making updates, click the blue "Apply" button in the bottom lefthand corner of the screen.

## Keeping the NJ version up to date with latest upstream changes

Because we have made so many developments on top of Microsoft's upstream branch that often conflict heavily with Microsoft, pulling in changes from the Microsoft upstream when they come in is a tedious and not always worthwhile process.

Still, we should keep ourselves aware of changes that Microsoft is adding to their branch to stay aware of changes that enhance the security of the application and add these to our own application manually.

## How to run locally
1. Clone the repo and check out the `nj-stable` branch or any branch created from it.
2. In the root directory of the repo, create a new `.env` file. Update this file with the values found in Bitwarden.
3. From the root directory of the repo, run the ./start.sh command

## How to run unit tests locally
Navigate into the `frontend` directory. `cd frontend`

**To run tests for the backend** run the command `npm run test:api`
**To run tests for the frontend** run the command `npm run test:react`