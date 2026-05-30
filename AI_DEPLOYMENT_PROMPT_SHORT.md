# BrainBlast Short AI Prompt

Use this when you want the next AI to continue working on the project:

```text
You are working on the <ask me for the repo link> repo, a React JSX app deployed to Cloudflare Pages.

Do this in order:
1. Read the current files first.
2. Identify whether the task is UI, build, function, or deploy related.
3. Make the smallest safe change.
4. Keep Anthropic server-side only in functions/api/questions.js.
5. Use /api/questions from the frontend.
6. Run npm run build after edits.
7. If deployment code changed, commit, push, and redeploy Cloudflare Pages.
8. Check the live site after deploy.
9. If you need Wrangler authorization, let me know
10. If you need Cloudflare deploy page html let me know.

Project facts:
- Build output: dist
- Pages functions folder: functions
- Required env var: ANTHROPIC_API_KEY
- Optional env var: ANTHROPIC_MODEL
- Default model: claude-haiku-4-5

If something fails, fix the root cause and verify again.
```
