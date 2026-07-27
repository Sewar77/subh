# Repository Guidelines

## Project Structure & Module Organization

The repository contains two Node.js packages:

- `subh-frontend/` is the React/Vite client. Code lives in `src/`, grouped into `Pages`, `components`, `Context`, `Hooks`, `Services`, `Theme`, and CMS registries. Static files belong in `public/`; imported images belong in `src/assets/`.
- `subh-backend/` is the Express API. Keep routing in `src/routes/`, handlers in `src/controller/`, database access in `src/models/`, and Joi schemas in `src/validation/`.
- Database migrations and development seeds are under `subh-backend/database/`. Read its `README.md` before changing or running them; do not execute the legacy `schema.sql`.

## Build, Test, and Development Commands

Install dependencies separately with `npm ci` in each package directory.

- `cd subh-frontend && npm run dev` starts Vite at `http://localhost:5173`.
- `cd subh-frontend && npm run lint` runs ESLint across JavaScript and JSX.
- `cd subh-frontend && npm run build` creates the production bundle; `npm run preview` serves it.
- `cd subh-backend && npm start` starts the API with Nodemon. Set `PORT=5000` to match the frontend API client.
- `npm run db:migrate` and `npm run db:seed` apply backend database tasks. Use only against an approved development database with the documented environment variables.

## Coding Style & Naming Conventions

Use ES modules, two-space indentation, semicolons, double quotes, and trailing commas. React component files use PascalCase (`DisplayBooks.jsx`); hooks use `useCamelCase`; variables and functions use camelCase. Backend files use role suffixes such as `books.Controller.js` and `books.Validation.js`. Keep route handlers thin.

## Testing Guidelines

No automated test framework or coverage threshold is configured. Before submitting, run frontend lint and build, then manually exercise affected UI flows and API endpoints. Add frontend tests as `*.test.jsx` and backend tests under `subh-backend/tests/`, together with a package-level `npm test` script.

## Commit & Pull Request Guidelines

History favors imperative messages such as `feat: add user serializer`. Prefer Conventional Commit prefixes (`feat:`, `fix:`, `refactor:`, `docs:`) and focused commits. Pull requests should explain behavior changes, note database or environment impacts, link issues, include screenshots for UI changes, and list verification performed.

## Security & Configuration

Keep backend secrets in an untracked `.env`. Never commit database URLs, JWT secrets, Cloudinary credentials, or seed passwords. The app uses `DB_CONNECTION` at runtime, while migration and seed scripts require `DATABASE_URL`; seeds additionally require `SUBH_SEED_USER_PASSWORD` and refuse production execution.

## Codex memory

Before starting a task, read `docs/codex-memory/README.md` and any memory files relevant to the task.

Do not update Codex memory unless the current prompt explicitly says `Memory update: required` or otherwise explicitly requests a memory update. Current user instructions and current repository code override stale memory notes.
