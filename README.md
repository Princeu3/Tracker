# Tracker

An AI-powered data tracker application. Describe what you want to track and the AI generates a structured schema — then manage your data in a spreadsheet-like interface.

## Features

- **AI Schema Generation** — Describe what you want to track (e.g. "job applications", "apartment hunting") and the AI instantly creates a complete schema with appropriate column types, select options, and defaults
- **Iterative Refinement** — Chat with the AI to adjust the schema, or edit columns, options, and colors directly in the preview panel before creating
- **Spreadsheet-like Data Table** — Inline cell editing, sortable columns, filters, drag-and-drop row reordering
- **Rich Column Types** — Text, number, date, select, multi-select, checkbox, URL, email, currency, and file attachments
- **Markdown Chat** — AI responses render with full markdown formatting (bold, lists, links)
- **Editable Tracker Titles** — Click to rename tracker name and description inline
- **Authentication** — Google OAuth and credentials-based sign in via NextAuth

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: NextAuth v5 (Google OAuth + credentials)
- **AI**: OpenAI GPT-4o with streaming responses
- **UI**: Tailwind CSS v4, Radix UI, shadcn/ui
- **Drag & Drop**: dnd-kit
- **Deployment**: Docker / Railway

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- PostgreSQL database

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URL=postgresql://...
AUTH_SECRET=your-auth-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
OPENAI_API_KEY=your-openai-api-key
```

### Setup

```bash
# Install dependencies
bun install

# Push database schema
bun run db:push

# Start dev server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to get started.

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
