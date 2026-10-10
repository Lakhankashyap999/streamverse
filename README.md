# 🎮 StreamVerse — KhushiYT Creator Platform

StreamVerse is a high-performance, cinematic gaming creator portfolio and community platform built for BGMI livestreamer **KhushiYT (@khusiytlive)**.

> **Disclaimer:** This project is an unofficial creator showcase and fan-made concept. It is not affiliated with, endorsed by, or sponsored by KRAFTON, PUBG, Battlegrounds Mobile India (BGMI), YouTube, or Google.

---

## ⚡ Key Features

- **Cinematic Gaming Interface:** Tactical battleground aesthetics with Space Grotesk typography, angled HUD panels, gold/magenta neon highlights, and custom CSS-animated PUBG soldier firing loader.
- **Broadcast Status Center:** Realtime stream card displaying LIVE, Scheduled, or Offline states. Only marks verified LIVE when verified through YouTube or set by creator.
- **Video & Highlight Vault:** Video replays and top clutch/rush gameplay clips with category filtering, and privacy-enhanced lazy-loaded modal playback (`youtube-nocookie.com`).
- **Upcoming Broadcast Countdown:** Scheduled streams timeline with local timezone conversion, creator timezone display, and direct Google Calendar reminders.
- **Fan Community Hub:**
  - **Live Polls:** Real votes recorded per session with server-enforced duplicate prevention and creator-configured visibility rules.
  - **Gaming Challenges & Community Matches:** Mission cards with rules, submission deadlines, and match announcements.
  - **Moderated Fan Suggestions:** Viewers submit stream ideas and challenges; submissions remain strictly private until approved.
- **Creator Command Dashboard:**
  - Simple, streamlined administration (no cluttered enterprise charts).
  - Profile & Bio editor (gaming name, bio, photo & banner upload, social links, game ID, UPI support).
  - Video management (YouTube link parser with automatic thumbnail resolution).
  - Stream scheduler with status controls (Scheduled, Go Live, Completed, Archived).
  - Highlight management with featured pins.
  - Poll creator & real vote tally inspector.
  - Suggestion moderation queue with Approve & Publish workflow.
  - Business inquiry inbox for sponsorship and collaboration requests.
- **Zero-Fakes Policy:** No fabricated viewer counts, no fake subscriber statistics, and clear labelling of demonstration data.

---

## 🛠 Technology Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS v4, React Router 7, Framer Motion, Lucide React
- **Backend & Database:** Supabase (PostgreSQL), Supabase Auth, Row Level Security (RLS)
- **Asset Processing:** Pillow for WebP optimization and responsive resolution scaling
- **Testing:** Vitest

---

## 🚀 Getting Started

### 1. Installation

```bash
git clone <repository-url>
cd streamverse
npm install
```

### 2. Running in Local Demo Mode

The application includes a built-in **Local Demo Mode** that runs immediately without requiring any external database configuration. All creator updates and voting persist in your browser's local storage.

```bash
npm run dev
```

Visit `http://localhost:5173`. You can log into the Creator Dashboard via `/login` by clicking **"Enter Demo Dashboard"**.

---

### 3. Connecting to Supabase (Production)

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migration script located at `supabase/migrations/20261010_initial_schema.sql` inside the Supabase SQL Editor.
3. Enable **"Allow anonymous sign-ins"** in **Authentication > Providers > Anonymous**.
4. Create your creator user in **Authentication > Users**, then insert their UUID into the `creator_accounts` table:
   ```sql
   INSERT INTO public.creator_accounts (user_id, role)
   VALUES ('<your-user-uuid>', 'creator');
   ```
5. Create `.env` in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
   ```
6. Start the server with `npm run dev`.

---

## 🧪 Testing & Verification

Run the test suite:

```bash
npm test
```

Run TypeScript verification and production build:

```bash
npm run build
```

---

## 🔒 Security Best Practices

- **Row Level Security (RLS):** Enabled on all tables. Unauthenticated visitors can only read published records.
- **Publishable Key Only:** No service-role keys are exposed in frontend bundles.
- **Link Security:** External URLs are sanitized (HTTPS only, domain allow-listing, credential stripping).
- **Reduced Motion:** Full support for `prefers-reduced-motion` across all animations and loaders.
