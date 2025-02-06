# Cortex - AI-Driven Research Assistant

Cortex is an AI-driven note-taking and knowledge-base application designed for structured research. Users can initiate sessions on specific topics, upload or link relevant context (text, URLs, videos), set research goals, and have the AI agent summarize, reason, and produce final structured outputs.

## Features

- **Research Session Management**

  - Create and manage research sessions with specific topics and goals
  - Add context through text, URLs, PDFs, and videos
  - Organize research materials in one centralized location

- **AI-Powered Analysis**

  - Automatic embedding and organization of context in vector store
  - AI agent processes and summarizes information
  - Structured knowledge piece generation

- **Smart Knowledge Base**
  - Easy retrieval of past research
  - Updateable knowledge pieces
  - Context-aware searching and linking

## Tech Stack

- **Frontend**: Next.js 13+ with TypeScript
- **Backend**: Supabase (PostgreSQL + Auth)
- **Vector Store**: ChromaDB
- **AI Processing**: LangGraph (TypeScript)
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18+
- Supabase CLI
- ChromaDB
- OpenAI API key (for LangGraph)

## Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/cortex.git
   cd cortex
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Fill in the required environment variables:

   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `CHROMA_HOST`: ChromaDB host (default: localhost)
   - `CHROMA_PORT`: ChromaDB port (default: 8000)

4. Initialize Supabase:

   ```bash
   supabase init
   supabase link --project-ref your-project-ref
   ```

5. Run database migrations:

   ```bash
   supabase db push
   ```

6. Start ChromaDB:

   ```bash
   docker run -d -p 8000:8000 chromadb/chroma
   ```

7. Start the development server:

   ```bash
   npm run dev
   ```

8. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
cortex/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (auth, etc.)
│   ├── lib/               # Utility functions and API clients
│   └── types/             # TypeScript type definitions
├── public/               # Static assets
└── supabase/            # Supabase configurations and migrations
```

## Database Schema

- **sessions**: Research session details and metadata
- **resources**: Context materials (text, URLs, etc.)
- **knowledge_pieces**: AI-generated summaries and insights

## Features in Development

- Integration with third-party platforms (Notion, Evernote, etc.)
- Collaboration and sharing capabilities
- Advanced AI agent features (automated web research, continuous updates)
- Export functionality (PDF, CSV, Excel)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
