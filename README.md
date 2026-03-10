# Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4)](https://tailwindcss.com)

An AI-powered data tracker. Describe what you want to track and the AI generates a structured schema — then manage your data in a spreadsheet-like interface.

## Features

- **AI Schema Generation** — Describe what you want to track (e.g. "job applications", "apartment hunting") and the AI instantly creates a complete schema with appropriate column types, select options, and defaults
- **Iterative Refinement** — Chat with the AI to adjust the schema, or edit columns, options, and colors directly in the preview panel before creating
- **Spreadsheet-like Data Table** — Inline cell editing, sortable columns, filters, drag-and-drop row reordering
- **Rich Column Types** — Text, number, date, select, multi-select, checkbox, URL, email, currency, and file attachments
- **Markdown Chat** — AI responses render with full markdown formatting (bold, lists, links)
- **Editable Tracker Titles** — Click to rename tracker name and description inline
- **Authentication** — Google OAuth and credentials-based sign in via NextAuth

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | NextAuth v5 (Google OAuth + credentials) |
| AI | OpenAI GPT-4o (streaming) |
| UI | Tailwind CSS v4, Radix UI, shadcn/ui |
| Drag & Drop | dnd-kit |
| Deployment | Docker / Railway |

## Getting Started

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh)
- PostgreSQL database

### Setup

```bash
# Clone the repo
git clone https://github.com/Princeu3/Tracker.git
cd Tracker

# Install dependencies
bun install

# Copy env template and fill in your values
cp .env.example .env.local

# Push database schema
bun run db:push

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

### Environment Variables

See [`.env.example`](.env.example) for all required variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Random secret for NextAuth (`openssl rand -base64 32`) |
| `AUTH_URL` | Yes | App URL (e.g. `http://localhost:3000`) |
| `OPENAI_API_KEY` | Yes | OpenAI API key for schema generation |
| `AUTH_GOOGLE_ID` | No | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | No | Google OAuth client secret |

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
│   ├── (app)/        # Authenticated app routes (dashboard, tracker, settings)
│   └── api/          # API routes (AI chat, file upload/serving, auth)
├── actions/          # Server actions (tracker, column, row, file CRUD)
├── components/
│   ├── ai-chat/      # Chat container, messages (markdown), schema preview
│   ├── tracker/      # Data table, cell editors, column filters, headers
│   ├── shared/       # Sidebar, header, confirm dialog
│   └── ui/           # shadcn/ui primitives
├── db/               # Drizzle schema & database connection
├── lib/              # AI client/prompts, constants, utilities
└── types/            # TypeScript type definitions
```

## Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feat/your-feature`)
5. Open a Pull Request

Please keep PRs focused on a single change and include a clear description of what and why.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
