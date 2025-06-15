# RC Build Log

A modern web application for RC enthusiasts to document and share their build projects. Built with Vue 3, Vite, and Supabase.

## Features

- 🔐 **Authentication**
  - Secure user authentication with Supabase
  - Protected routes and user-specific content
  - Profile management

- 📝 **Project Management**
  - Create and manage RC build projects
  - Detailed project information tracking
  - Project status and progress monitoring

- 📸 **Media Support**
  - Image uploads for build progress
  - Video integration for demonstrations
  - Rich media galleries

- 📋 **Log System**
  - Detailed build logs with timestamps
  - Tag-based organization
  - Link sharing and reference management

- 🏷️ **Organization**
  - Tag-based categorization
  - Search and filter capabilities
  - Sort by date, popularity, or status

## Tech Stack

- **Frontend**
  - Vue 3 with Composition API
  - Vite for fast development and building
  - Tailwind CSS for styling
  - Pinia for state management

- **Backend**
  - Supabase for backend services
  - PostgreSQL database
  - Real-time subscriptions
  - File storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/rcbuildlog.git
   cd rcbuildlog
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

### Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
rcbuildlog/
├── src/
│   ├── assets/        # Static assets
│   ├── components/    # Vue components
│   ├── router/        # Vue Router configuration
│   ├── store/         # Pinia store modules
│   ├── views/         # Page components
│   ├── App.vue        # Root component
│   └── main.js        # Application entry point
├── public/            # Public static files
└── index.html         # HTML template
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## Support

For support, email support@rcbuildlog.com or open an issue in the GitHub repository.

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).
