# Managing models in Azure OpenAI services

_Last updated 3/12/2025._

Refer to the [OpenAI Service resources](../../NJ_README.md#openai-service-resources) section of the NJ_README for details on the prod and dev OpenAI Service resources in use.

## Changing the OpenAI Service resource via env vars

By default, the Bitwarden `.env` file is configured to use the `nj-innovation-ai-dev` resource.

However, one may want to switch between the dev/prod OpenAI Service resources in order to test changes, either while running the app locally or using the deployed dev staging version.

1. Go to desired OpenAI service resource in the Microsoft AI Foundry portal
2. Go to the “Deployments” tab in the sidebar
   In the list of the deployments, click the name of the desired deployment (e.g. “gpt-4o-dev”). This should open more details about that particular deployment.
3. Use the information in the “Details” tab to configure the following environment variables
   - `AZURE_OPENAI_MODEL`: the deployment’s custom name (e.g. “gpt-4o-dev”)
     - "Deployment Info” section > “Name”
   - `AZURE_OPENAI_MODEL_NAME`: the model name (e.g. “gpt-4o”)
     - “Deployment Info” section > “Model name”
   - `AZURE_OPENAI_ENDPOINT`: the endpoint for generating completions
     - “Endpoint” section > “Target URI”
   - `AZURE_OPENAI_KEY`: the API key for the endpoint
     - “Endpoint” section > “Key”

## Updating the Model Version Used in the Model Deployment

As the model version in use ages, degrades, and becomes outdated, the version being used may need to be manually updated through Azure AI Foundry.

Follow the steps below to update the model version used in the model deployment:

1. Open the [Azure AI Foundry portal](https://ai.azure.com). Make sure that the desired OpenAI Service resource (either `nj-innovation-ai` or `nj-innovation-dev`) is selected in the dropdown at the top of the screen.
2. From the lefthand sidebar menu, select **Deployments** from under the **Shared resources** section. You should see a list of model deployments on your screen.
3. Click the model deployment used by the app (prod: `gpt-4o-strict-filter` for prod or `gpt-4o-dev` for dev). You should see a new page with details about the model deployment.
4. Click the **Edit** button under the details tab. A modal with the heading **Update deployment** should open allowing you to make updates to the model.
5. From the **Model version** dropdown, select the version of the model that you would like to use. _Note: typically the most recent version of the model that is available will be the most reliable. Occasionally, in the event of outages and disruptions, you may need to switch to an older version of the model._
6. Click the blue **Save and close** button at the bottom of the modal. Your changes should be applied immediately.
7. Please test updates in the dev model deployment (`nj-innovation-ai`) before making the corresponding changes in prod.
   - When modifying the prod model, please test changes immediately upon saving to ensure that your update to the model version have not caused outages or disruptions.
