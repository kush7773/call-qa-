# Call QA Review Surface

A specialized evaluation surface for human reviewers to audit AI-generated call summaries against raw transcripts for vehicle finance collections calls.

## Features

- **Split-Screen Review Workspace**: Full height, side-by-side view of raw transcripts and AI-generated summaries.
- **Transcript Turn Evidence**: Turns are parsed with turn IDs (`T01`, `T02`, etc.), timestamps, and role-based chat bubbles.
- **Inline Annotation Popover**: Select summary text to flag:
  - 🟢 **Accurate** (`✓`)
  - 🔴 **Hallucination** (`✗`)
  - 🟡 **Omission** (`⚠`)
  - 🟣 **Rule Breach** (`⚡`)
- **Interactive Evidence Citation**: Link specific transcript turns directly to an annotation.
- **Audit & Export Banner**: Sticky bottom tray tracking review progress, evaluator notes, severity levels (`Definite` / `Uncertain`), verdict, and JSON export.
- **Local Persistence**: Sessions automatically saved in `localStorage`.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Lucide React Icons

## Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Production build
npm run build
```

## Deployment

Deployable as a zero-config static site on **Vercel** or **Netlify**:
- Build command: `npm run build`
- Output directory: `dist`
