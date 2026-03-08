## Packages
@hello-pangea/dnd | Drag and drop functionality for the Kanban board columns
date-fns | Formatting created/updated timestamps nicely
lucide-react | Standard icons for the UI

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  sans: ["var(--font-sans)"],
  display: ["var(--font-display)"],
}

The @hello-pangea/dnd library is used as a drop-in, React 18-compatible replacement for react-beautiful-dnd.
The Kanban board expects tasks to have 'backlog', 'in_progress', or 'completed' statuses.
