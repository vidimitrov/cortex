1. OVERVIEW  
   • Project Name: Cortex  
   • Elevator Pitch: Cortex is an AI-driven note-taking and knowledge-base application designed for structured research. Users can initiate sessions on specific topics, upload or link relevant context (text, URLs, videos), set a research goal, and have the AI agent summarize, reason, and produce final structured outputs. The result is an easily retrievable “knowledge piece” that can be updated over time.
2. PROBLEM STATEMENT & CONTEXT  
   • Pain Points:  
    – People (students, entrepreneurs, casual knowledge seekers) often have difficulty organizing scattered research notes across multiple platforms and file types.  
    – Traditional note-taking apps do not always provide an AI-powered, structured research workflow.  
   • Why Solve This:  
    – Cortex streamlines knowledge retention and retrieval by allowing an AI agent to process, store, summarize, and maintain user-provided context.  
    – Users not only keep their notes and resources in one place but also have an AI agent capable of extending their research by exploring external information.  
   • Existing Challenges / Gaps:  
    – Many note-taking systems lack a robust AI-driven approach for structured research, including the ability to automatically fetch and integrate external context.  
    – Knowledge can become siloed in disparate third-party apps (Miro, Notion, Google Docs, Evernote) without a single hub that organizes them in one place.
3. TARGET USERS & USE CASES  
   • User Profiles:  
    – Primary Audience: Students, entrepreneurs, and casual knowledge seekers. They mostly work alone, but may want the option to share or collaborate occasionally.  
   • Core Use Cases:

1) Research Session Creation  
   – User starts a new session for a specific topic (for example, “AI Coding Agents”), provides context (URLs, text snippets, video links, etc.), and states the research goal.
2) Context Integration  
   – The AI agent reads, embeds, and organizes the user’s context in a vector store.
3) AI Reasoning & Summarization  
   – The agent produces structured summaries, asks clarifying questions, and organizes notes for easy retrieval.
4) Knowledge Retrieval & Update  
   – Users can revisit any knowledge piece later and ask for updates or add additional context. The agent seamlessly integrates new information.
5) Collaboration & Sharing (Future enhancement)  
   – Users may invite other people to view or co-edit a knowledge session.

4. FEATURES & FUNCTIONALITY

1) User Authentication & Registration  
   – Description: Email/password or OAuth (Google, potentially Notion, Evernote, etc.).  
   – Requirements: Secure sign-up, sign-in, and session management. Option to integrate with other note-taking apps.
2) Session/Topic Handling  
   – Description: Users create sessions or topics, providing free-form context.  
   – Requirements: Tagging, storing text/URL resources, and associating them with a user ID.
3) AI Context Consumption & Summaries  
   – Description: An AI agent built with LangGraph in TypeScript that embeds user-provided context into a ChromaDB vector store, summarizes, and reasons over it.  
   – Requirements: Tools for the agent to perform web research (scraping top K search results, extracting relevant info, summarizing).
4) Knowledge Piece Generation  
   – Description: The agent organizes the final result (in a structured format: text summary, bullet points, or tabular data) as a “knowledge piece.”  
   – Requirements: Data model for storing these knowledge pieces in Supabase for easy retrieval and future queries.
5) Integration with External Services  
   – Description: Option to import data from various platforms (Miro, Notion, Evernote, Google Docs). Additional exports in PDF/CSV/Excel.  
   – Requirements: APIs or embedding integrations with partner services (tied to user credentials), batch import, plugin architecture.
6) Collaboration & Accessibility  
   – Description: (Planned enhancement) Share knowledge pieces or entire sessions with others for feedback or joint research.  
   – Requirements: Role-based access or shareable links.

5. TECHNICAL REQUIREMENTS  
   • Platforms:  
    – Web application built with Next.js for the frontend.  
    – Potential expansions to mobile or desktop if the user base requires it in the future.  
   • Framework/Stack Preferences:  
    – Frontend: Next.js + TypeScript.  
    – Backend: Node.js environment with server-side components, integrated with Supabase for relational data, and ChromaDB for vector embeddings.  
    – AI Agent: LangGraph in TypeScript, with integrated “web research” tool for context gathering.
   • APIs/Integrations:  
    – OAuth (Google, possibly Notion, Evernote).  
    – Third-party platforms like Miro, Google Docs, etc., for context import.  
   • Performance Constraints:  
    – Currently none specified beyond normal SaaS performance expectations.
   • Security & Data Constraints:  
    – No immediate data-privacy compliance requirements (e.g., GDPR) but keep code flexible for future compliance.  
    – User data stored in Supabase; knowledge embeddings stored in ChromaDB.
6. ARCHITECTURE & DESIGN (HIGH-LEVEL)  
   • Frontend: Next.js/React for UI.  
    – A user dashboard displaying sessions, knowledge pieces, and an interface to manage context and goals.
   • Backend:  
    – Node.js with Next.js serverless API routes.  
    – LangGraph agent running server-side logic to ingest user context and perform external web research.
   • Database:  
    – Supabase (PostgreSQL) for relational data (users, sessions, resources, knowledge pieces).  
    – ChromaDB for vector storage and embedding-based retrieval.
   • Integration Points:  
    – OAuth tokens for external platforms, stored securely in Supabase.  
    – Agent “research tool” that uses search APIs (for example, Bing Search, Google Custom Search) or a specialized scraping tool to gather external data.
7. USER FLOWS  
   Example: “Create a Session” Flow

1) User logs in via email/password or Google OAuth.
2) User clicks “New Session,” enters topic name, and free-form description.
3) User provides initial context (URLs, text, video links, etc.) and states a specific goal (for example, “Summarize the state of AI coding agents and produce an Excel of current companies”).
4) The system stores this data in Supabase; the AI agent reads and embeds it in ChromaDB.
5) The agent processes the context, identifies missing info, and may ask clarifying questions.
6) The agent compiles summaries, structured notes, and final artifacts (tables, Excel exports, PDFs).
7) User can revisit the knowledge piece at any time to add more info, ask questions, or request an update.

8. DATA MODEL (INITIAL CONCEPT)  
   • User:  
    {  
    id (primary key),  
    email,  
    passwordHash (if not using OAuth),  
    createdAt,  
    …  
    }
   • Session/Topic:  
    {  
    id,  
    userId (foreign key),  
    title,  
    description,  
    createdAt,  
    …  
    }
   • Resources:  
    {  
    id,  
    sessionId (foreign key),  
    type (URL, text snippet, PDF, etc.),  
    content,  
    …  
    }
   • KnowledgePiece:  
    {  
    id,  
    sessionId (foreign key),  
    structuredOutput (text, JSON, etc.),  
    lastUpdated,  
    …  
    }
   • Vector Embeddings (ChromaDB):  
    – Tied to each resource or newly found data chunk from the agent’s web research.
9. TIMELINE & SCOPE  
   • Phases or Milestones:  
    – MVP: Authentication, session creation, AI-powered embedding & summarization, basic file export.  
    – Phase 2: Integrations with Miro, Notion, Evernote, and Google Docs. Collaboration/sharing features.  
    – Future: More advanced AI agent capabilities (automated web scraping, continuous updates, advanced analytics).
   • Estimated Deadlines:  
    – No immediate deadlines; development can proceed iteratively.
10. NON-FUNCTIONAL REQUIREMENTS  
    • User Experience:  
     – The application should be intuitive: minimal steps to start a session, add context, and receive structured summaries.
    • Accessibility:  
     – Keep standard accessibility practices in mind (WCAG guidelines).
    • Reliability & Availability:  
     – Aim for typical SaaS uptime (99.5%+).  
     – Should handle moderate concurrent usage without performance degradation.
    • Scalability:  
     – Architecture should allow scaling if user adoption or data volume grows significantly.
    • Maintainability:  
     – Use TypeScript for type safety and clarity.  
     – Keep the code well-organized, with clear separation between frontend, backend, and AI modules.
11. KNOWN RISKS & ASSUMPTIONS  
    • Risks:  
     – Third-party integrations or APIs may change or be rate-limited.  
     – Complexity in the AI agent’s external research might require robust error handling.
    • Assumptions:  
     – Users have stable internet during research sessions.  
     – Users own or can legally upload/link the materials they want summarized.
12. MISCELLANEOUS / FUTURE IDEAS  
    • Specialist Agents:  
     – Additional domain-specific tools (for example, medical, legal) for specialized knowledge.  
    • Plugged-in AI:  
     – Potential expansion into real-time search APIs or aggregator services.  
    • Team Collaboration:  
     – Real-time co-editing, presence indicators, or advanced permission levels.
13. PROMPT INSTRUCTIONS FOR THE CODING AGENT  
    • “Use Next.js + TypeScript for the frontend and backend routes. Integrate Supabase as the relational database and ChromaDB for vector embeddings.”  
    • “Implement a modular architecture: separate the AI agent’s logic (LangGraph) from the user-facing UI.”  
    • “Start with authentication, session creation, resource ingestion, and summarization.”  
    • “Build an API endpoint for the agent to retrieve resource text and store final knowledge pieces.”  
    • “Add endpoints for exporting data in PDF, CSV, or Excel format.”  
    • “Write code with reusability in mind, ensuring future expansions (collaboration, advanced integrations) are straightforward.”
