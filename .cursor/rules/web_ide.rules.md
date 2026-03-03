# Web IDE Architectural Rules

## Security
- **JWT ONLY**: The Web IDE must rely exclusively on the user's dashboard JWT. Never request or use an `IDEAccessToken`.
- **Isolation**: Code snapshots are processed in the existing isolated Celery pipeline.

## Frontend Development
- **No Direct Logic**: API calls and polling management must reside in service hooks or utility functions, not directly in the presentation layer of components.
- **Monaco Theme**: Use the `vs-dark` theme by default to maintain the premium dashboard aesthetic.
- **Polling Discipline**: Use `useEffect` cleanup to prevent memory leaks and zombie network requests.
- **No WebSockets**: Strictly use polling as per requirements to maintain simplified infrastructure.

## Backend Development
- **Thin Routes**: Migration and schema changes must be safe and not impact the existing VS Code extension pipeline.
- **Reusability**: Use the existing `processor.process_submission` task without modification.
