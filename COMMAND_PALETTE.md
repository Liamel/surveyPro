# Command Palette

The SurveyPro app includes a powerful command palette that allows users to quickly navigate between different sections of the application using keyboard shortcuts.

## Features

- **Global Access**: Available on every page of the application
- **Keyboard Shortcut**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open
- **Search Functionality**: Type to filter available commands
- **Keyboard Navigation**: Use arrow keys to navigate and Enter to select
- **Quick Actions**: Direct navigation to key sections

## Available Commands

| Command | Description | Route |
|---------|-------------|-------|
| Go to Home | Navigate to the home page | `/` |
| Browse Surveys | View all available surveys | `/surveys` |
| CMS Dashboard | Access the content management system | `/cms` |
| Create Survey | Create a new survey | `/cms/create` |
| Manage Surveys | Manage existing surveys | `/cms/manage` |
| User Management | Manage users and permissions | `/cms` |

## Usage

1. **Open Command Palette**: Press `Cmd+K` or `Ctrl+K`
2. **Search**: Type to filter commands by title, description, or keywords
3. **Navigate**: Use ↑/↓ arrow keys to move through results
4. **Select**: Press Enter to execute the selected command
5. **Close**: Press Escape to close the palette

## Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K`: Open command palette
- `Escape`: Close command palette
- `↑/↓`: Navigate through commands
- `Enter`: Execute selected command
- `Type`: Search/filter commands

## Technical Implementation

The command palette is built using:
- **react-hotkeys-hook**: For keyboard shortcut handling
- **shadcn/ui Dialog**: For the modal interface
- **Next.js Router**: For navigation
- **TypeScript**: For type safety

The component is globally available through the root layout and can be accessed from any page in the application. 