# Select open source base for AI Assistant 2.0

## Context

### Project Overview

We need to select and deploy an enterprise-level AI interface to service NJ state employees. There are many extant tools in this space, but few with a high level of quality with the intent to serve multiple users. The main two options are LibreChat and Open WebUI, which implement largely the same feature set with different implementations.

### Problem Statement



Our criteria for selecting the authentication framework include:

- Will we remain within a living OSS community?
- Does the tool reflect our tech stack?
- What license does the tool have?
- Time to implement?
- Fulfills PRD [requirements](https://docs.google.com/document/d/1Lbgv-A-RM5iZ0H7GHSwQKf744N-wSp78jXAFXWjmKrM/edit?tab=t.0#heading=h.d1yxfd2crn61)?

## Decision



### Options

| Option           | OSS Community | In-House Tech Stack |         License         |                  Time to Implement                  | Notes                                                                       |
| ---------------- | :-----------: | :-----------------: | :---------------------: | :-------------------------------------------------: | :-------------------------------------------------------------------------- |
| 1: LibreChat     |       ✅       |          ✅          |           MIT           |                     1-2 months                      | Uses MongoDB, needs better RBAC                                             |
| 2: DPV OWUI      |       ❌       |          ❌          |      BSD-3 Clause       |                     1-2 months                      | Uses Svelte and Javascript, needs Anthropic adapter                         |
| 3: Licensed OWUI |       ✅       |          ❌          | Enterprise paid license | Short, but unknown. Requires purchase conversation. | Requires purchasing                                                         |
| 4: Roll our own  |       ❌       |          ✅          |       Our choice        |                        Long                         | Need to define a reduced feature list in order to release in timely fashion |

#### Option 1: [Librechat](https://www.librechat.ai/)

Librechat is developed in React and Typescript with a Node backend. It uses MongoDB exclusively as a database, and does not have a robust RBAC implementation.

Pros:

- This is where a pro would go

Cons:

- This is where a con would go

#### Option 2: [DPV Open WebUI](https://github.com/digital-public-ventures/ai-platform)


#### Option 3: [Licensed Open WebUI](https://openwebui.com/)


#### Option 4: Roll our Own



## Consequences

