import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PageContainer';
import { HomePage } from '../pages/HomePage';
import { StreamsPage } from '../pages/StreamsPage';
import { HighlightsPage } from '../pages/HighlightsPage';
import { CommunityPage } from '../pages/CommunityPage';
import { AboutPage } from '../pages/AboutPage';
import { ContactPage } from '../pages/ContactPage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { TermsPage } from '../pages/TermsPage';
import { LoginPage } from '../pages/LoginPage';
import { NotFoundPage } from '../pages/NotFoundPage';

import { DashboardLayout } from '../dashboard/DashboardLayout';
import { DashboardOverview } from '../dashboard/DashboardOverview';
import { ProfilePage as DashboardProfilePage } from '../dashboard/ProfilePage';
import { VideosPage as DashboardVideosPage } from '../dashboard/VideosPage';
import { StreamsPage as DashboardStreamsPage } from '../dashboard/StreamsPage';
import { HighlightsPage as DashboardHighlightsPage } from '../dashboard/HighlightsPage';
import { PollsPage as DashboardPollsPage } from '../dashboard/PollsPage';
import { SuggestionsPage as DashboardSuggestionsPage } from '../dashboard/SuggestionsPage';
import { SettingsPage as DashboardSettingsPage } from '../dashboard/SettingsPage';

export const router = createBrowserRouter([
  // Public Routes (wrapped in PublicLayout with navbar, footer, demo notification)
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'streams', element: <StreamsPage /> },
      { path: 'highlights', element: <HighlightsPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'privacy', element: <PrivacyPage /> },
      { path: 'terms', element: <TermsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },

  // Protected Creator Dashboard
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <DashboardOverview /> },
      { path: 'profile', element: <DashboardProfilePage /> },
      { path: 'videos', element: <DashboardVideosPage /> },
      { path: 'streams', element: <DashboardStreamsPage /> },
      { path: 'highlights', element: <DashboardHighlightsPage /> },
      { path: 'polls', element: <DashboardPollsPage /> },
      { path: 'suggestions', element: <DashboardSuggestionsPage /> },
      { path: 'settings', element: <DashboardSettingsPage /> },
      { path: '*', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
