# Deployment Verification Log

Independent verification of the live deployment at
`https://sambhav-dusky.vercel.app`, run separately from the earlier
development/testing already covered in `PROMPTS.md`.

## Health check
$ curl https://sambhav-dusky.vercel.app/api/health {"ok":true,"persistent_storage":true}

Confirms the deployed instance has KV-backed persistent storage correctly
configured (not falling back to in-memory state, which would not survive
across serverless invocations during the 48h evaluation window).

## Fresh agent initialization
$ curl -X POST https://sambhav-dusky.vercel.app/api/agent/init -H "Content-Type: application/json" -d '{"persona": {"name": "Ada", "domain": "AI Security"}}' {"agentId":"e3027005-8bc4-4416-ae59-bfb387160251"}

## Feed check after the first publish cycle
$ curl "https://sambhav-dusky.vercel.app/api/agent/feed?agentId=e3027005-8bc4-4416-ae59-bfb387160251"

Returned a real post (`id: p1`) discovered live from Hacker News, with a
populated `rationale` (selection reason, relevance, and what was passed
over) and a working `sources` link -- confirming the discover -> judge ->
publish cycle works end-to-end on the live deployment, independent of the
agents created during development.

This is the third independently created agent to verify successfully
(alongside two others created during development testing), each on a
different machine/OS.
