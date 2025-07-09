# SurveyPro - Full-Stack Survey Application

A modern, full-stack survey application built with Next.js, TypeScript, Tailwind CSS, and Neon Database. Features Clerk authentication, Drizzle ORM, shadcn/ui components, and AI-powered survey generation.

## Features

- 🔐 **Clerk Authentication** - Secure user authentication with GitHub/Google OAuth
- 📊 **Survey Management** - Create, edit, and manage surveys with a powerful CMS
- 📝 **Multiple Question Types** - Support for multiple choice, text input, and rating questions
- 🎯 **Progressive Survey Filling** - One question at a time with progress tracking
- 🗄️ **Neon Database** - Serverless PostgreSQL database with Drizzle ORM
- 🎨 **Modern UI** - Beautiful interface built with shadcn/ui and Tailwind CSS
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🔒 **Type Safety** - Full TypeScript support with Zod validation
- 🤖 **AI Survey Generation** - Generate surveys using AI with natural language prompts

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Clerk
- **Database**: Neon (PostgreSQL)
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **AI**: Vercel AI SDK, OpenAI

## Prerequisites

- Node.js 18+ 
- npm or pnpm
- Neon Database account
- Clerk account

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd surveypro
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="your-neon-database-url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

# AI Survey Generation
OPENAI_API_KEY="your-openai-api-key"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

1. Create a Neon database at [neon.tech](https://neon.tech)
2. Get your database connection string
3. Run the database migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Clerk Setup

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Configure OAuth providers (GitHub, Google)
4. Add your domain to allowed origins
5. Copy your publishable and secret keys to `.env.local`

### 5. AI Setup (Optional)

To use the AI survey generation feature:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add your API key to `.env.local`:
   ```env
   OPENAI_API_KEY="your-openai-api-key"
   ```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## Project Structure

```
surveypro/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── cms/               # CMS pages
│   │   ├── fill-survey/       # Survey filling pages
│   │   ├── surveys/           # Survey listing
│   │   └── survey-complete/   # Completion pages
│   ├── components/            # Reusable components
│   │   └── ui/               # shadcn/ui components
│   ├── db/                   # Database configuration
│   │   ├── drizzle.ts        # Database connection
│   │   └── schema.ts         # Database schema
│   └── lib/                  # Utility functions
│       ├── schemas.ts        # Zod schemas
│       └── utils.ts          # Utility functions
├── drizzle/                  # Database migrations
└── public/                   # Static assets
```

## API Routes

### Surveys
- `POST /api/surveys` - Create a new survey
- `GET /api/surveys` - Get all surveys
- `GET /api/surveys/[id]` - Get survey by ID

### Questions
- `POST /api/questions` - Create a new question
- `GET /api/questions` - Get questions by survey ID

### Survey Responses
- `POST /api/survey-responses` - Start a survey response
- `GET /api/survey-responses` - Get survey responses
- `PATCH /api/survey-responses/[id]` - Update survey response

### Question Responses
- `POST /api/question-responses` - Submit a question answer

### AI Survey Generation
- `POST /api/generate-survey` - Generate survey using AI

### Users
- `POST /api/users/create` - Create/update user from Clerk

## Usage

### For Survey Creators

1. **Sign In**: Use the "Sign In" button on the homepage
2. **Access CMS**: Click "Go to CMS" after signing in
3. **Create Survey**: Click "Create Survey" and fill out the form
4. **Generate with AI** (Optional): Click "Generate Survey" button and describe your survey in natural language
5. **Add Questions**: Add multiple questions with different types
6. **Publish**: Your survey will be available for respondents

### For Survey Respondents

1. **Browse Surveys**: Visit `/surveys` to see available surveys
2. **Start Survey**: Click "Start Survey" on any active survey
3. **Answer Questions**: Answer one question at a time
4. **Complete**: Submit your responses and see the completion page

## Database Schema

### Users
- `id` (UUID, Primary Key)
- `clerk_id` (Text, Unique)
- `email` (Text)
- `first_name` (Text)
- `last_name` (Text)
- `role` (Text, Default: 'user')

### Surveys
- `id` (UUID, Primary Key)
- `title` (Text)
- `description` (Text)
- `is_active` (Boolean)
- `created_by` (UUID, Foreign Key to Users)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Questions
- `id` (UUID, Primary Key)
- `survey_id` (UUID, Foreign Key to Surveys)
- `question_text` (Text)
- `question_type` (Text: 'multiple_choice', 'text', 'rating')
- `order_index` (Integer)
- `is_required` (Boolean)
- `options` (JSONB, for multiple choice questions)

### Survey Responses
- `id` (UUID, Primary Key)
- `survey_id` (UUID, Foreign Key to Surveys)
- `respondent_id` (UUID, Foreign Key to Users, Optional)
- `started_at` (Timestamp)
- `completed_at` (Timestamp)
- `is_completed` (Boolean)

### Question Responses
- `id` (UUID, Primary Key)
- `survey_response_id` (UUID, Foreign Key to Survey Responses)
- `question_id` (UUID, Foreign Key to Questions)
- `answer` (Text)
- `answered_at` (Timestamp)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio

### Adding New Features

1. **Database Changes**: Update `src/db/schema.ts`
2. **API Routes**: Add new routes in `src/app/api/`
3. **Validation**: Add Zod schemas in `src/lib/schemas.ts`
4. **UI Components**: Use shadcn/ui or create custom components
5. **Pages**: Add new pages in `src/app/`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your production environment:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXTAUTH_URL` (your production domain)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support, please open an issue on GitHub or contact the development team.
