# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server on port 3333
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build locally
```

### Environment Setup
```bash
npm install          # Install dependencies
```

## Architecture Overview

**RC Build Log** is a Vue 3 application for RC enthusiasts to document and share their build projects, built with Supabase backend and designed for GitHub Pages deployment.

### Tech Stack
- **Frontend**: Vue 3 (Composition API) + Vite
- **State Management**: Pinia with persistence
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS (via main.css)
- **Router**: Vue Router with auth guards
- **AI Integration**: Multiple LLM providers (Ollama, HuggingFace, OpenRouter, Replicate)

### Key Architecture Patterns

**Store-Driven Architecture**: The application uses two main Pinia stores:
- `dataStore.js` (src/store/dataStore.js:1): Manages projects, logs, images, videos, documents
- `authStore.js` (src/store/authStore.js:1): Handles authentication state and Supabase auth

**Initialization Pattern**: Both stores have async `initialize()` methods called in main.js:23-27 before app mounting, ensuring proper state setup.

**Supabase Integration**: Centralized in src/lib/supabase.js:1 with environment-based configuration and connection testing.

**Route Protection**: Router guards in src/router/index.js:27-45 protect authenticated routes and handle redirects.

**Media Management**: Comprehensive CRUD operations for images, videos, and documents with consistent patterns across all media types.

### LLM Parser System

**Multi-Provider LLM Support**: The application includes an advanced LLM integration system in src/services/llmParser.js:1 that supports:
- Local providers: Ollama, LocalAI
- Cloud providers: HuggingFace, OpenRouter, Replicate
- Configuration managed in src/config/llm.js:1

**RC Spec Extraction**: Specialized prompt engineering for extracting RC vehicle specifications from text, with structured JSON output covering vehicle info, motor/engine, drivetrain, suspension, electronics, body/chassis, performance, and modifications.

**Auto-Population**: The system can automatically populate build spec sheets by parsing project logs, images, and video descriptions using the `autoPopulateBuildSpecs()` method.

### Database Schema Pattern
The application follows a user-centric data model where all entities (projects, logs, images, videos, documents, build_spec_sheets) are tied to `user_id` for security and data isolation.

### Component Architecture
- **Modal System**: Consistent modal patterns for create/edit operations (CreateProjectModal, EditProjectModal, etc.)
- **Form Components**: Specialized forms in components/log-forms/ for different media types
- **Upload Handling**: Dedicated modals for different upload types (ImageUploadModal, VideoUploadModal, DocumentUploadModal)

### Development Notes

**Vite Configuration**: Custom base path for GitHub Pages deployment (vite.config.js:7) and development server on port 3333.

**Environment Variables**: Supports multiple API keys for different LLM providers (VITE_HUGGINGFACE_API_KEY, VITE_OPENROUTER_API_KEY, etc.) alongside standard Supabase configuration.

**Persistence**: State persistence configured for key store paths with localStorage, including restore hooks for data fetching.

**Build Process**: Standard Vite build process with GitHub Pages-compatible configuration and static asset handling.

**Offline Support**: The dataStore includes offline state tracking with graceful degradation when API calls fail.

## Important Implementation Details

- All Supabase operations include proper error handling and user authentication checks
- The LLM parser includes fallback error handling and response cleaning for robust JSON parsing
- State management follows reactive patterns with Vue 3 Composition API
- Route navigation includes authentication state validation
- Media uploads follow consistent patterns with progress tracking and error states