# BrainBlast Copilot Instructions

Apply these instructions to all work in this repository.

## Operating Rules

- Start by reading the current files before making changes.
- Prefer the smallest safe change that solves the requested problem.
- Treat `brainblast.jsx` as the main UI surface, `src/main.jsx` as the app entry, and `functions/api/questions.js` as the server-side question API.
- Keep Anthropic access server-side only in `functions/api/questions.js`.
- The frontend must call `/api/questions`, not Anthropic directly.
- Validate changes with `npm run build` after editing.
- If deployment-related code changes, commit, push, and redeploy Cloudflare Pages.
- Check the live Pages URL after deploy to confirm the user flow works.
- If something breaks, identify the root cause and fix that instead of adding a workaround.

## Deployment Facts

- Build output: `dist`
- Pages functions folder: `functions`
- Required environment variable: `ANTHROPIC_API_KEY`
- Optional environment variable: `ANTHROPIC_MODEL`
- Default model: `claude-haiku-4-5`

## Helpful References

- Full workflow: [AI_DEPLOYMENT_WORKFLOW.md](../AI_DEPLOYMENT_WORKFLOW.md)
- Short prompt: [AI_DEPLOYMENT_PROMPT_SHORT.md](../AI_DEPLOYMENT_PROMPT_SHORT.md)
