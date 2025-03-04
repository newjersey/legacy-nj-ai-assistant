# Alerting in Azure

There are a few alert rules set up in Azure to notify the team when the AI assistant is facing outages or disruptions. These rules and the actions set up in Azure when alerts are triggered are outlined below.

## Existing Alert Rules

A summary of existing alert rules within Azure. These can be viewed in the Azure console under the "Alerts" resource.

### [HTTP Server Errors](https://portal.azure.com/#@SoNJ.onmicrosoft.com/resource/subscriptions/52561230-e762-421d-80ea-a69d6dee9f6c/resourceGroups/SH-Innov-AI-Dev-RG/providers/microsoft.insights/metricalerts/HTTP%20Server%20Errors/overview)

- **Metric measured:** Http Server Errors
- **Threshold type:** Static
- **Threshold:** Count greater than 1
- **Period:** 1 minute
- **Severity:** Error

### [Memory Usage High](https://portal.azure.com/#@SoNJ.onmicrosoft.com/resource/subscriptions/52561230-e762-421d-80ea-a69d6dee9f6c/resourceGroups/SH-Innov-AI-Dev-RG/providers/microsoft.insights/metricalerts/Memory%20Usage%20High/overview)

- **Metric measured:** Average working memory set
- **Threshold type:** Static
- **Threshold:** Average greater than 12800000000
- **Period:** 1 minute
- **Severity:** Warning

### [Response Time Above Dynamic Threshold](https://portal.azure.com/#@SoNJ.onmicrosoft.com/resource/subscriptions/52561230-e762-421d-80ea-a69d6dee9f6c/resourceGroups/SH-Innov-AI-Dev-RG/providers/microsoft.insights/metricalerts/Response%20Time%20Above%20Dynamic%20Threshold/overview)

- **Metric measured:** Average working memory set
- **Threshold type:** Dynamic
- **Threshold:** Average greater than low threshold sensitivity
- **Period:** 5 minutes
- **Severity:** Warning

## Alert actions

All currently configured alerts are set to notify emails set in the `OOI_OIT` action group when triggered. This means that the following will be notified when alerts are triggered:

- `#platform-eng-alerts` Slack channel
- NJOIT's support email address

If you do not have access to the `#platform-eng-alerts` and would like to be added, please notify a member of the Platform team.

Alert actions can be edited through the console when editing alert rules.
