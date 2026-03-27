# Monaco Editor Skill

## Configuration
- **Editor Height**: Responsive, ideally filling the viewport height minus header/nav.
- **Language**: Default to `python`.
- **Options**:
  - `minimap: { enabled: false }`
  - `fontSize: 14`
  - `scrollBeyondLastLine: false`
  - `automaticLayout: true` (Critical for responsive layouts)

## Integration
- **Theme**: Integrate with Tailwind CSS `dark` mode if applicable.
- **Read Only**: Support a read-only mode for viewing historical submissions.
- **Value Sync**: Use controlled component pattern for code state.
