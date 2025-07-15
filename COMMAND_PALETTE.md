# Command Palette

The SurveyPro app includes a powerful command palette that allows users to quickly navigate between different sections of the application using keyboard shortcuts.

## Features

- **Global Access**: Available on every page of the application
- **Keyboard Shortcut**: Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux) to open
- **Search Functionality**: Type to filter available commands
- **Keyboard Navigation**: Use arrow keys to navigate and Enter to select
- **Quick Actions**: Direct navigation to key sections

## Available Commands

| Command | Description | Route | Access |
|---------|-------------|-------|--------|
| Go to Home | Navigate to the home page | `/` | All users |
| Browse Surveys | View all available surveys | `/surveys` | All users |
| CMS Dashboard | Access the content management system | `/cms` | All users |
| Create Survey | Create a new survey | `/cms/create` | Moderators & Admins |
| Manage Surveys | Manage existing surveys | `/cms/manage` | Moderators & Admins |
| User Management | Manage users and permissions | `/cms/users` | Admins only |

## Usage

1. **Open Command Palette**: Press `Cmd+K` or `Ctrl+K`
2. **Search**: Type to filter commands by title, description, or keywords
3. **Navigate**: Use ↑/↓ arrow keys to move through results
4. **Select**: Press Enter to execute the selected command
5. **Close**: Press Escape to close the palette

## Keyboard Shortcuts

- `Cmd+K` / `Ctrl+K`: Open command palette
- `Cmd+U` / `Ctrl+U`: Quick access to User Management (admin only)
- `Escape`: Close command palette
- `↑/↓`: Navigate through commands
- `Enter`: Execute selected command
- `Type`: Search/filter commands

## Role-Based Access

- **Users**: Can browse and fill surveys
- **Moderators**: Can create and manage surveys, but cannot manage users
- **Admins**: Full access including user management

## Technical Implementation

The command palette is built using:
- **react-hotkeys-hook**: For keyboard shortcut handling
- **shadcn/ui Dialog**: For the modal interface
- **Next.js Router**: For navigation
- **TypeScript**: For type safety

The component is globally available through the root layout and can be accessed from any page in the application. 