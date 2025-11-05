# IFG Agentic

An AI-powered assistant for discovering, analyzing, and working with Austrian open data from [data.gv.at](https://www.data.gv.at/). Built with Next.js 15 and the AI SDK, this application provides an intelligent conversational interface for exploring datasets, generating Python code artifacts, and performing data analysis.

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-5.0-black?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

</div>

---

## 🌟 Features

### 🤖 AI-Powered Data Exploration
- **Intelligent Chat Interface**: Converse with AI models to find and analyze Austrian datasets
- **Multi-Model Support**: Choose from Google Gemini, OpenAI GPT, and xAI models
- **Context-Aware Responses**: AI understands Austrian data conventions (DD.MM.YYYY dates, comma decimals)

### 📊 Dataset Discovery & Analysis
- **Smart Search**: Search data.gv.at catalog with natural language queries
- **Dataset Details**: View comprehensive metadata, distributions, and download links
- **CSV Exploration**: Automatic detection of delimiters, encoding, and data types
- **Data Validation**: Built-in safeguards prevent AI hallucination and data fabrication

### 🐍 Python Code Artifacts
- **Automated Code Generation**: Generate pandas/matplotlib code for data analysis
- **Live Execution**: Run Python code in a browser-based environment
- **Interactive Spreadsheets**: Display raw data in editable grid views
- **Visualization Tools**: Create charts, graphs, and statistical visualizations

### 🔐 Authentication & User Management
- **NextAuth Integration**: Secure authentication with credential-based login
- **Guest Access**: Try the application without registration
- **User Types**: Support for both guest and regular users with different entitlements

### 📋 Analysis Planning
- **Task Breakdown**: Visualize data analysis workflows as step-by-step plans
- **Progress Tracking**: Monitor completion of analysis tasks
- **Transparent Workflows**: Understand exactly what the AI is doing

---

## 🚀 Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router and Server Components
- **[React 19](https://react.dev/)** - UI library (RC version)
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development

### AI & LLM
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - AI/LLM integration framework
- **[AI SDK Gateway](https://vercel.com/docs/ai-gateway)** - Model routing and fallbacks
- **Multiple Providers**: Google Gemini, OpenAI, xAI support

### Database & State
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database ORM
- **[Vercel Postgres](https://vercel.com/storage/postgres)** - Managed PostgreSQL database
- **[SWR](https://swr.vercel.app/)** - Client-side data fetching and caching
- **[Redis](https://redis.io/)** - Optional: Stream resumption and caching

### UI & Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Lucide Icons](https://lucide.dev/)** - Beautiful icon set
- **[Geist Font](https://vercel.com/font)** - Vercel's design system font

### Code Editing & Display
- **[CodeMirror](https://codemirror.net/)** - Code editor with Python support
- **[React Data Grid](https://github.com/adazzle/react-data-grid)** - High-performance spreadsheet component
- **[Shiki](https://shiki.matsu.io/)** - Syntax highlighting

### Data Processing
- **[PapaParse](https://www.papaparse.com/)** - CSV parsing library
- **[Pandas/NumPy/Matplotlib](https://pyodide.org/)** - Python data science stack (browser execution)

### Development Tools
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter
- **[Playwright](https://playwright.dev/)** - End-to-end testing
- **[pnpm](https://pnpm.io/)** - Fast, disk space efficient package manager

---

## 📋 Prerequisites

- **Node.js**: 18.17 or later
- **pnpm**: 9.12.3 or later
- **PostgreSQL**: For production (or Vercel Postgres)
- **Redis**: Optional, for stream resumption

---

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ifg-agentic.git
   cd ifg-agentic
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file and configure your settings:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```env
   # Database
   POSTGRES_URL=postgresql://user:password@localhost:5432/ifg_agentic
   
   # Authentication
   AUTH_SECRET=your-secret-key-here
   
   # AI Models (at least one required)
   OPENAI_API_KEY=sk-...
   XAI_API_KEY=xai-...
   GOOGLE_GENERATIVE_AI_API_KEY=...
   
   # Optional: AI Gateway
   AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/...
   
   # Optional: Redis for stream resumption
   REDIS_URL=redis://localhost:6379
   ```

4. **Set up the database**
   ```bash
   # Generate migrations
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   ```

---

## 🏃 Running the Application

### Development Mode
```bash
pnpm dev
```
The application will be available at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
pnpm build
pnpm start
```

### Database Management
```bash
# Open Drizzle Studio (database GUI)
pnpm db:studio

# Push schema changes without migrations
pnpm db:push

# Pull schema from existing database
pnpm db:pull
```

---

## 📁 Project Structure

```
ifg-agentic/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── login/               # Login page
│   │   └── register/            # Registration page
│   ├── (chat)/                  # Chat application routes
│   │   ├── api/chat/           # Chat API endpoint
│   │   ├── chat/[id]/          # Individual chat page
│   │   └── page.tsx            # Chat home page
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/                   # React components
│   ├── ui/                      # Radix UI components
│   ├── elements/                # Chat message elements
│   ├── artifact-messages.tsx   # Artifact display
│   ├── chat.tsx                # Main chat interface
│   ├── messages.tsx            # Message list
│   ├── multimodal-input.tsx   # Chat input with file upload
│   └── model-selector.tsx     # AI model picker
│
├── lib/                         # Core libraries
│   ├── ai/                     # AI integration
│   │   ├── models.ts          # Model definitions
│   │   ├── prompts.ts         # System prompts
│   │   ├── providers.ts       # AI provider configuration
│   │   ├── entitlements.ts    # User entitlements
│   │   └── tools/             # AI tools
│   │       ├── datasets/      # Dataset discovery tools
│   │       ├── documents/     # Code artifact tools
│   │       └── analysis/      # Analysis planning tools
│   ├── db/                    # Database
│   │   ├── schema.ts         # Database schema
│   │   ├── queries.ts        # Database queries
│   │   └── migrations/       # SQL migrations
│   ├── artifacts/            # Artifact execution
│   ├── types.ts             # TypeScript types
│   └── utils.ts             # Utility functions
│
├── artifacts/                 # Artifact implementations
│   ├── code/                 # Python code artifacts
│   └── sheet/                # Spreadsheet artifacts
│
├── hooks/                    # React hooks
│   ├── use-messages.tsx     # Message state management
│   └── use-artifact.ts      # Artifact state
│
├── tests/                   # Test suite
│   ├── e2e/                # End-to-end tests
│   ├── routes/             # API route tests
│   └── fixtures.ts         # Test fixtures
│
└── public/                  # Static assets
```

---

## 🔧 Key Features Explained

### 1. Dataset Search & Exploration

The AI assistant can search the Austrian open data catalog using natural language:

```
User: "Find datasets about renewable energy in Austria"
AI: [Searches data.gv.at, displays results with metadata cards]
```

**Tools Used:**
- `searchDatasets` - Full-text search across the catalog
- `getDatasetDetails` - Retrieve complete metadata and distributions
- `exploreCsvData` - Analyze CSV structure, columns, and data types

**Anti-Hallucination Safeguards:**
- All tools validate responses and return explicit success/failure flags
- Empty results trigger clear "no data found" messages
- Model is prohibited from fabricating URLs, IDs, or data values
- Strict validation before proceeding to next workflow step

### 2. Python Code Artifacts

When users request data analysis or visualization, the AI generates executable Python code:

**Workflow:**
1. Search for relevant datasets
2. Extract CSV URL from distributions
3. Explore CSV structure (mandatory step)
4. Generate Python code using exact column names
5. Execute code in browser with Pyodide

**Example:**
```python
import pandas as pd
import matplotlib.pyplot as plt

# Load data with correct delimiter and skip title row
df = pd.read_csv(url, delimiter=';', skiprows=1)

# Display available columns
print(f"Available columns: {list(df.columns)}")

# Create visualization
plt.figure(figsize=(10, 6))
# ... analysis code ...
plt.show()
```

### 3. Multi-Model Support

Choose from various AI models based on your needs:

| Model | Provider | Use Case |
|-------|----------|----------|
| Google Gemini 2.0 Flash | Google | Fast, efficient responses |
| Google Gemini 2.5 Pro | Google | Complex reasoning |
| GPT-4o | OpenAI | Balanced performance |
| GPT-4o Mini | OpenAI | Cost-effective |
| o1 / o3-mini | OpenAI | Advanced reasoning |
| Grok | xAI | Alternative perspective |

### 4. Authentication System

**User Types:**
- **Guest Users**: Limited daily message quota, basic features
- **Regular Users**: Higher quotas, full feature access

**Implementation:**
- Credential-based authentication with bcrypt password hashing
- Session management with NextAuth
- JWT tokens with user type information

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm exec playwright test tests/routes/chat.test.ts

# Run with UI mode
pnpm exec playwright test --ui
```

**Test Coverage:**
- API route tests (chat, authentication)
- End-to-end user flows
- Dataset tool functionality
- Authentication flows

---

## 🎨 Code Quality

```bash
# Lint code
pnpm lint

# Fix linting issues
pnpm lint:fix

# Format code
pnpm format
```

**Tools:**
- **Biome**: Fast linter and formatter (replaces ESLint + Prettier)
- **TypeScript**: Strict type checking enabled
- **Next.js Linting**: Built-in Next.js best practices

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
2. **Import to Vercel**: Connect your repository
3. **Configure Environment Variables**: Add all required env vars
4. **Deploy**: Automatic deployments on every push

### Environment Variables for Production
- Set all API keys and database credentials
- Configure `AUTH_SECRET` for production
- Optional: Set up Vercel Postgres and Redis
- Optional: Configure AI Gateway for model routing

### Database Migrations
Migrations run automatically during build via:
```bash
pnpm build  # Runs: tsx lib/db/migrate && next build
```

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_URL` | PostgreSQL connection string | ✅ |
| `AUTH_SECRET` | NextAuth secret key | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ⚠️* |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key | ⚠️* |
| `XAI_API_KEY` | xAI API key | ⚠️* |
| `AI_GATEWAY_URL` | AI Gateway endpoint | ❌ |
| `REDIS_URL` | Redis connection string | ❌ |

\* At least one AI provider API key is required

---

## 🛡️ Security & Data Integrity

### Anti-Hallucination System

This application implements comprehensive safeguards to prevent AI from fabricating data:

1. **System-Level Prohibitions**
   - Explicit instructions in system prompts
   - "NEVER FABRICATE DATA" warnings at critical points

2. **Tool-Level Validation**
   - All dataset tools return `success: boolean` flags
   - Empty results return clear error messages with instructions
   - Failed tool calls block subsequent operations

3. **Workflow Checkpoints**
   - Mandatory validation after each step
   - Cannot proceed with `success: false` results
   - Automatic stopping when data is unavailable

4. **Code Generation Guards**
   - Requires valid CSV structure before generating code
   - Validates dataUrl presence for data artifacts
   - Uses exact column names from exploration results

**Result**: AI transparently informs users when data is unavailable rather than inventing information.

---

## 📚 Austrian Data Conventions

The AI assistant follows Austrian data standards:

- **Dates**: DD.MM.YYYY format
- **Decimals**: Comma separator (,)
- **Language**: German labels preferred
- **Regions**: Federal states, districts, municipalities
- **Data Source**: [data.gv.at](https://www.data.gv.at/) - official Austrian open data portal

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript strict mode
- Use Biome for linting and formatting
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[data.gv.at](https://www.data.gv.at/)** - Austrian open data portal
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - Powerful AI integration framework
- **[Next.js Team](https://nextjs.org/)** - Amazing React framework
- **Austrian Government** - Commitment to open data and transparency

---

## 📞 Support

For issues, questions, or contributions:
- **Issues**: [GitHub Issues](https://github.com/yourusername/ifg-agentic/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/ifg-agentic/discussions)

---

<div align="center">

**Built with ❤️ for Austrian open data transparency**

[Report Bug](https://github.com/yourusername/ifg-agentic/issues) · [Request Feature](https://github.com/yourusername/ifg-agentic/issues) · [Documentation](https://github.com/yourusername/ifg-agentic/wiki)

</div>
