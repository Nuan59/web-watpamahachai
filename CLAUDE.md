# วัดป่ามหาไชย website

Public temple website + back office in one Next.js app. What it is and how to run it: README.md. What is done and how it was checked: STATUS.md (add a section for each finished task).

Stack: Next.js 15 App Router, Tailwind v4, Prisma 6 + SQLite, vitest, Playwright (global install, `e2e/sweep.mjs`). Same structure as EzyRide (`src/lib/*` for logic, `src/app/(site)` public, `src/app/admin/(app)` back office, `requirePerm` on every admin page/action).

## Rules

- Thai UI copy: plain, short, polite; Buddhist-era dates via `src/lib/dates.ts`. Don't invent facts about the temple (history, dates, bank details); leave them for the temple to fill in Admin → ข้อมูลวัด.
- Colours come from the temple logo (`@theme` in `src/app/globals.css`): brown `#744a24`, charcoal, grey, warm white.
- Every back-office page, server action and route calls `requirePerm` (enforced by `src/lib/rbac-coverage.test.ts`).
- Never put real visitors' names or phones into code, tests, seed or commits.
- Don't deploy.

## Before calling a task done

`npx tsc --noEmit`, `npx eslint .`, `npx vitest run`, `npm run build`, start on :3030 and `node e2e/sweep.mjs`, a STATUS.md section, a commit.
