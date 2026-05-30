# BrainBlast AI Deployment Workflow

Use this document as the operating guide for any AI helping deploy or modify this project.

## Project Summary

- App type: React JSX app built with Vite.
- Deploy target: Cloudflare Pages.
- Static build output: `dist`.
- Serverless API: `functions/api/questions.js`.
- Required secret: `ANTHROPIC_API_KEY` in Cloudflare Pages.
- Optional model override: `ANTHROPIC_MODEL`.

## Current Behavior

- The UI renders from `*.jsx` through `src/main.jsx`.
- Question generation happens through `/api/questions`.
- The Pages function calls Anthropic server-side, so no API key should ever be placed in browser code.
- The default model is Haiku for faster responses unless overridden by `ANTHROPIC_MODEL`.

## What the AI Should Do Each Time

1. Inspect the current files before editing.
2. Identify whether the request is about UI, API, build, or deployment.
3. Make the smallest possible change.
4. If changing behavior, validate locally with `npm run build`.
5. If changing deployment behavior, verify the Pages function still works.
6. Commit and push only after the change is validated.
7. Redeploy Cloudflare Pages when the runtime or function changes.
8. Recheck the live site after deploy to confirm the user flow works.

## Common Commands

- Install dependencies: `npm install`
- Build production assets: `npm run build`
- Cloudflare login: `npm run cf:login`
- Cloudflare deploy: `npm run cf:deploy`
- Local Pages run: `npm run cf:dev`

## Things to Watch For

- Do not call Anthropic directly from browser code.
- Keep the Pages function response JSON-only.
- If Cloudflare returns a 502, inspect the function response text first.
- If the app loads blank, check browser console errors for runtime exceptions.
- If the model fails, try a supported Anthropic model or override `ANTHROPIC_MODEL`.
- If Pages CLI changes, update the npm scripts rather than working around them ad hoc.

## Ready-to-Paste Prompt

Paste this to the next AI if you want it to continue the same deployment workflow:

```text
You are working on the BrainBlast repo, a React JSX app deployed to Cloudflare Pages.

Follow this workflow strictly:
1. Read the current files before editing.
2. Identify the exact issue: UI, build, function, deploy, or runtime.
3. Make the smallest safe change needed.
4. Keep Anthropic calls server-side only in functions/api/questions.js.
5. Ensure the frontend calls /api/questions, not Anthropic directly.
6. Validate with npm run build after edits.
7. If deployment-related code changed, commit, push, and redeploy to Cloudflare Pages.
8. Check the live site after deploy and confirm the user flow works.
9. If an error occurs, fix the root cause rather than patching around it.

Project facts:
- Build output: dist
- Pages functions folder: functions
- Required env var: ANTHROPIC_API_KEY
- Optional env var: ANTHROPIC_MODEL
- Current default model: claude-haiku-4-5

Return concise progress updates and do not skip validation.
```

## Suggested Next-AI Behavior

If the next AI needs to modify the app, it should first determine whether the change belongs in:
- `brainblast.jsx` for UI and client flow
- `src/main.jsx` for app bootstrapping
- `functions/api/questions.js` for question generation and Anthropic access
- `package.json` / `wrangler.toml` for build and Pages deployment settings

## Success Criteria

A change is complete only when:
- the project builds successfully,
- the live Pages URL loads,
- clicking Start or equivalent reaches the generation,
- and the API does not return a 502.
