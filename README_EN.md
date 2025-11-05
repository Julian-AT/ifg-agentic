<div align="center">

![IFG Agentic](public/thumbnail.png)

<a name="readme-top"></a>

# IFG Agentic

AI-powered assistant for discovering, analyzing and visualizing<br/>**Austrian Open Data** datasets from **[data.gv.at][datagvat_url]**<br/>– entirely in your browser with **Python** code generation.

[![Next.js][nextjs_badge]][nextjs_url]
[![TypeScript][typescript_badge]][typescript_url]
[![React][react_badge]][react_url]
[![License][license_badge]][license_url]

**&searr;&nbsp;&nbsp;Documentation & Quick Links&nbsp;&nbsp;&swarr;**

[Deutsche Version][readme_de_url] · [English Version](#readme-top)

[![Repository][repo_badge]][repo_url]
[![Issues][issues_badge]][issues_url]
[![Data.gv.at][datagvat_badge]][datagvat_url]

</div>

## ✨ Features

- **Zero Setup** – No Python installation required, runs entirely in browser via [Pyodide][pyodide_url].
- **Multi-Model AI** – Supports [Google Gemini][gemini_url], [OpenAI GPT][openai_url] and [xAI Grok][xai_url] out-of-the-box.
- **Natural Language Search** – Search the [data.gv.at][datagvat_url] catalog with natural language.
- **Automatic CSV Analysis** – Detects delimiters, encoding and data types automatically.
- **Code Generation** – Generates executable Python code (pandas/matplotlib) for analysis and visualization.
- **Anti-Hallucination System** – Built-in safeguards prevent AI from using fabricated data.
- **Austrian Data Conventions** – Understands DD.MM.YYYY date formats and comma decimal separators.
- **Browser-Based Execution** – Code runs directly in browser without backend dependencies.
- **Interactive Spreadsheets** – Displays data in editable grid views.
- **Flexible Authentication** – Guest access or registered accounts with different permissions.
- **Live Reload** – Development mode with automatic reload for frontend and backend.
- **Production Ready** – Includes Dockerfile and Docker Compose for easy deployment.

<div align="right">

[&nwarr; Back to top](#readme-top)

</div>

## ⚡️ Quick Start

> [!NOTE]
> Make sure **Node.js 18.17+**, **pnpm 9.12.3+** and a **PostgreSQL** database are available.

Clone the repository and install dependencies:

```bash
git clone https://github.com/julian-at/ifg-agentic.git
cd ifg-agentic
pnpm install
```

Create `.env.local` and configure environment variables:

```env
# Database
POSTGRES_URL=postgresql://user:password@localhost:5432/ifg_agentic

# Authentication
AUTH_SECRET=your-secret-key-here

# AI Models (at least one required)
OPENAI_API_KEY=sk-...
GOOGLE_GENERATIVE_AI_API_KEY=...
XAI_API_KEY=xai-...

# Optional
REDIS_URL=redis://localhost:6379
```

Setup database and start dev server:

```bash
pnpm db:migrate
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) – done! 🎉

<div align="right">

[&nwarr; Back to top](#readme-top)

</div>

### 📦 Alternative Installation via Docker

For quick setup with Docker:

```bash
docker-compose up -d
```

The application will run on [http://localhost:3000](http://localhost:3000).

<div align="right">

[&nwarr; Back to top](#readme-top)

</div>

## 🛠️ Tech Stack

The project uses a modern web stack:

- **[Next.js 15][nextjs_url]** – React framework with App Router and Server Components
- **[TypeScript][typescript_url]** – Type-safe JavaScript
- **[React 19][react_url]** – UI library
- **[Vercel AI SDK][vercel_ai_url]** – AI/LLM integration with multi-provider support
- **[Pyodide][pyodide_url]** – Python in browser (pandas, matplotlib, numpy)
- **[Tailwind CSS][tailwind_url]** – Utility-first CSS framework
- **[Radix UI][radix_url]** – Accessible component primitives
- **[CodeMirror][codemirror_url]** – Code editor with Python syntax highlighting
- **[Drizzle ORM][drizzle_url]** – Type-safe database ORM
- **[PostgreSQL][postgres_url]** – Relational database
- **[NextAuth][nextauth_url]** – Authentication for Next.js
- **[Framer Motion][framer_url]** – Animation library
- **[Playwright][playwright_url]** – End-to-end testing
- **[Biome][biome_url]** – Fast linter and formatter

<div align="right">

[&nwarr; Back to top](#readme-top)

</div>

## 🏆 Contributing

Contributions are welcome! Please note:

- **Issues:** [Bug Reports & Feature Requests][issues_url]
- **Pull Requests:** Code improvements & bug fixes
- **Guidelines:** TypeScript strict mode, Biome formatting, write tests

### Development Guidelines

- Follow TypeScript strict type checking
- Use Biome for code formatting (`pnpm format`)
- Write tests for new features
- Ensure all tests pass before submitting

<div align="right">

[&nwarr; Back to top](#readme-top)

</div>

## ⚠️ License

[IFG Agentic][repo_url] is free and open-source software licensed under the [MIT License][license_url].

<div align="right">

[&nwarr; Back to top](#readme-top)

</div>

---

<div align="center">

Made for Austrian Open Data Transparency 🇦🇹

Built with [Vercel AI SDK][vercel_ai_url] • Powered by [data.gv.at][datagvat_url]

</div>

<!-- Badge Links -->
[nextjs_badge]: https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white
[typescript_badge]: https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[react_badge]: https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black
[license_badge]: https://img.shields.io/badge/License-MIT-success?style=for-the-badge
[repo_badge]: https://img.shields.io/badge/REPOSITORY-gray?style=for-the-badge
[issues_badge]: https://img.shields.io/badge/ISSUES-red?style=for-the-badge
[datagvat_badge]: https://img.shields.io/badge/DATA.GV.AT-blue?style=for-the-badge

<!-- Technology Links -->
[nextjs_url]: https://nextjs.org/
[typescript_url]: https://www.typescriptlang.org/
[react_url]: https://react.dev/
[vercel_ai_url]: https://sdk.vercel.ai/
[pyodide_url]: https://pyodide.org/
[tailwind_url]: https://tailwindcss.com/
[radix_url]: https://www.radix-ui.com/
[codemirror_url]: https://codemirror.net/
[drizzle_url]: https://orm.drizzle.team/
[postgres_url]: https://www.postgresql.org/
[nextauth_url]: https://next-auth.js.org/
[framer_url]: https://www.framer.com/motion/
[playwright_url]: https://playwright.dev/
[biome_url]: https://biomejs.dev/

<!-- AI Provider Links -->
[gemini_url]: https://ai.google.dev/
[openai_url]: https://openai.com/
[xai_url]: https://x.ai/

<!-- Repository Links -->
[repo_url]: https://github.com/julian-at/ifg-agentic
[issues_url]: https://github.com/julian-at/ifg-agentic/issues
[license_url]: https://github.com/julian-at/ifg-agentic/blob/main/LICENSE
[readme_de_url]: https://github.com/julian-at/ifg-agentic/blob/main/README.md

<!-- External Links -->
[datagvat_url]: https://www.data.gv.at/
[vercel_url]: https://vercel.com/
