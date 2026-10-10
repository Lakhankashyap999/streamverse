import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PageContainer';
import { HomePage } from '../pages/HomePage';
import { PubgLoader } from '../components/ui/PubgLoader';

// Lazy-load secondary public pages
const StreamsPage = lazy(() => import('../pages/StreamsPage').then((m) => ({ default: m.StreamsPage })));
const HighlightsPage = lazy(() => import('../pages/HighlightsPage').then((m) => ({ default: m.HighlightsPage })));
const CommunityPage = lazy(() => import('../pages/CommunityPage').then((m) => ({ default: m.CommunityPage })));
const AboutPage = lazy(() => import('../pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('../pages/TermsPage').then((m) => ({ default: m.TermsPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Lazy-load creator dashboard pages
const DashboardLayout = lazy(() => import('../dashboard/DashboardLayout').then((m) => ({ default: m.DashboardLayout })));
const DashboardOverview = lazy(() => import('../dashboard/DashboardOverview').then((m) => ({ default: m.DashboardOverview })));
const DashboardProfilePage = lazy(() => import('../dashboard/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const DashboardVideosPage = lazy(() => import('../dashboard/VideosPage').then((m) => ({ default: m.VideosPage })));
const DashboardStreamsPage = lazy(() => import('../dashboard/StreamsPage').then((m) => ({ default: m.StreamsPage })));
const DashboardHighlightsPage = lazy(() => import('../dashboard/HighlightsPage').then((m) => ({ default: m.HighlightsPage })));
const DashboardPollsPage = lazy(() => import('../dashboard/PollsPage').then((m) => ({ default: m.PollsPage })));
const DashboardSuggestionsPage = lazy(() => import('../dashboard/SuggestionsPage').then((m) => ({ default: m.SuggestionsPage })));
const DashboardSettingsPage = lazy(() => import('../dashboard/SettingsPage').then((m) => ({ default: m.SettingsPage })));

function LazyRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PubgLoader />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  // Public Routes (wrapped in PublicLayout with navbar, footer, demo notification)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'streams', element: <LazyRoute><StreamsPage /></LazyRoute> },
      { path: 'highlights', element: <LazyRoute><HighlightsPage /></LazyRoute> },
      { path: 'community', element: <LazyRoute><CommunityPage /></LazyRoute> },
      { path: 'about', element: <LazyRoute><AboutPage /></LazyRoute> },
      { path: 'contact', element: <LazyRoute><ContactPage /></LazyRoute> },
      { path: 'privacy', element: <LazyRoute><PrivacyPage /></LazyRoute> },
      { path: 'terms', element: <LazyRoute><TermsPage /></LazyRoute> },
      { path: 'login', element: <LazyRoute><LoginPage /></LazyRoute> },
      { path: '404', element: <LazyRoute><NotFoundPage /></LazyRoute> },
      { path: '*', element: <LazyRoute><NotFoundPage /></LazyRoute> },
    ],
  },

  // Protected Creator Dashboard
  {
    path: '/dashboard',
    element: <LazyRoute><DashboardLayout /></LazyRoute>,
    children: [
      { index: true, element: <LazyRoute><DashboardOverview /></LazyRoute> },
      { path: 'profile', element: <LazyRoute><DashboardProfilePage /></LazyRoute> },
      { path: 'videos', element: <LazyRoute><DashboardVideosPage /></LazyRoute> },
      { path: 'streams', element: <LazyRoute><DashboardStreamsPage /></LazyRoute> },
      { path: 'highlights', element: <LazyRoute><DashboardHighlightsPage /></LazyRoute> },
      { path: 'polls', element: <LazyRoute><DashboardPollsPage /></LazyRoute> },
      { path: 'suggestions', element: <LazyRoute><DashboardSuggestionsPage /></LazyRoute> },
      { path: 'settings', element: <LazyRoute><DashboardSettingsPage /></LazyRoute> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
