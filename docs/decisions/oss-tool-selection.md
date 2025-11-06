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

#TODO

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
- It's in React + Typescript which is inhouse
- Highest-quality codebase vs other options
- supports more models OOTB
- remain in OSS community where we can pull in upstream features
- MIT friendly license, we can do whatever we want with this

Cons:
- Architecture docs under construction: https://www.librechat.ai/docs/development/debugging
- Spotty docs (true for both options)
- limited RBAC
- No admin interface for user management.
- limited experience in MongoDB

Additional Considerations:
- uses MongoDB, which is unfamiliar to NJ. It is FedRamp- and NIST-compliant
- they set a goal of admin panel by July 2025, which they did not achieve, with no open PRs
- Could use Amazon DocumentDB for managed MongoDB, but this may be expensive

Next Steps if we choose this:
- Build out RBAC and admin panel to manage users and permissions
- fork and install NJWDS styling

### Open WebUI (with two sub-options)
OpenWebUI has most of the same features as LibreChat, but written in Svelte + Javascript with a Python backend. It lacks native Anthropic compatibility, we'd need to build this ourselves.

#### Option 2: [DPV Open WebUI](https://github.com/digital-public-ventures/ai-platform)
This is a fork of Open WebUI before the license update.

Pros:
- Friendly license
- potential support from DPV
- Admin panel and RBAC (anemic, but a starting point)
- 

Cons:
- Python, which team is unfamiliar with
- Svelte instead of React, which is non-great
- No Anthropic integration OOTB
- Lose upstream updates, break with OSS community

#### Option 3: [Licensed Open WebUI](https://openwebui.com/)
Pros:
- they'll do concierge branding, probably custom feature requests
- remain in OSS community

Cons:
- Python, which team is unfamiliar with
- reddit says this is super expensive and bad
- No Anthropic integration OOTB

#### Option 4: Roll our Own
Highest LOE, longest time-to-implement. This would turn us into a development project with a long tail.

Pros:
- It'd be fun!
- Use most familiar tech
- understand it in and out, full visibility
- 

Cons:
- This will take a looooooong time
- stripped down feature list
- very iterative

Additional Considerations:
- could build off of 1.0, but this has baggage
- 

#### Option 5: AnythingLLM
Upon review of AnythingLLM's codebase, we found multiple examples of poor coding practices. The project looks vibe-coded, and was rejected for this reason.

#### Option 6: Open WebUI with maintaining their branding
We'd be unable to put any NJ logos on the site, which is unacceptable, therefore this is not an option.


## Consequences

