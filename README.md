# Amorium API

## 🚀 Quick Start

### Prerequisites
- Node.js installed
- Environment variables configured

### Local Development Setup

1. **Create Environment File**
   ```bash
   # Create .env file in the root directory
   cp .env
   ```

2. **Configure Environment Variables**
   ```
   ABLY_ROOT_TOKEN=<your_ably_token>
   DATABASE_URL=<your_database_url>
   SUPABASE_URL=<your_supabase_url>
   SUPABASE_ANON_KEY=<your_supabase_anon_key>
   SUPABASE_ROLE_KEY=<your_supabase_role_key>
   TELEGRAM_BOT_TOKEN=<your_telegram_bot_token>
   PORT=3001
   CORS_ORIGINS=http://localhost:3000
   ADMIN_TOKEN_EXPIRATION_TIME=3600000
   ADMIN_REFRESH_TOKEN_EXPIRATION_TIME=86400000
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Database Setup** (For new databases only)
   ```bash
   # Generate database migrations
   yarn run db:generate
   
   # Seed root admin user
   yarn run db:seed-root-admin
   
   # Seed tariff plans
   yarn run db:seed-tariffs
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `yarn run db:generate` | Generate database migrations |
| `yarn run db:seed-root-admin` | Seed root admin user |
| `yarn run db:seed-tariffs` | Seed tariff plans |
| `npm run build` | Build production bundle |
| `npm start` | Start production server |

The API will be available at `http://localhost:3000` once started.