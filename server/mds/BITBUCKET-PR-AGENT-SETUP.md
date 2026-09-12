# Bitbucket PR Agent Setup

Yes — you can set this up, but the clean way is to give Cursor an integration point (MCP server or script) that talks to Bitbucket, then let an agent drive that tool.

## Recommended setup

- Create a Bitbucket API wrapper (small service or script) that can:
  - list PRs
  - fetch diff/files/comments/checks
  - post review comments
  - approve/request changes
- Expose it to Cursor as an MCP server (best) or as CLI commands.
- Provide credentials securely (Bitbucket app password / OAuth token via env vars).
- Use an agent prompt that loops through open PRs and applies your review rules.

## Minimal architecture

- Agent in Cursor  
  -> MCP tools like `bitbucket.list_prs`, `bitbucket.get_pr`, `bitbucket.get_diff`, `bitbucket.comment`  
  -> Bitbucket REST API (`/2.0/repositories/{workspace}/{repo_slug}/pullrequests`)

## Practical steps

1. Create Bitbucket token
   - Bitbucket Cloud: App password with `pullrequest:read`, `pullrequest:write`, `repository:read`.
2. Build/choose MCP server
   - Either:
     - write your own thin MCP server over Bitbucket REST, or
     - use a generic HTTP MCP and map endpoints.
3. Register MCP server in Cursor
   - Add server command + env vars in Cursor MCP config.
4. Define agent workflow prompt
   - Example:
     - "Check all open PRs in repo X, summarize risks, comment on high-severity issues, and label as ready/not ready."
5. Add guardrails
   - Dry-run mode first (no write actions).
   - Only comment/approve when confidence is high.
   - Restrict to selected repos/branches.

## Example agent prompt

```text
Review open PRs in workspace/repo.
For each PR:
1) fetch metadata, commits, changed files, CI status
2) identify bugs/regressions/security risks
3) post comments only for actionable issues
4) produce summary with severity and test gaps
Do not approve automatically unless no high/medium issues.
```

## Tips

- Start with read-only tooling first (list/fetch/summarize).
- Add write actions (comment/approve) after confidence is good.
- Keep a reusable rubric (performance, security, migrations, tests, backward compatibility).
