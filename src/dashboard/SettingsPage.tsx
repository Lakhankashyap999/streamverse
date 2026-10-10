import { Shield, Mail, Database, RotateCcw, Check, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePageMeta, useAsync } from '../hooks';
import { contactService } from '../services/communityService';
import { demoStore } from '../services/demoStore';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { formatDateTime } from '../utils/date';
import { Badge } from '../components/ui/Card';
import { EmptyState, LoadingState } from '../components/ui/States';
import type { ContactMessage } from '../types';

export function SettingsPage() {
  usePageMeta('Settings & Messages');
  const { email, demo } = useAuth();
  const toast = useToast();

  const { data: messages, loading, reload } = useAsync(() => contactService.listAll(), []);

  const markMessageRead = async (m: ContactMessage) => {
    try {
      await contactService.update(m.id, { status: 'read' });
      toast('Marked as read', 'success');
      await reload();
    } catch {
      toast('Failed to update status', 'error');
    }
  };

  const deleteMessage = async (id: string) => {
    try {
      await contactService.remove(id);
      toast('Message removed', 'info');
      await reload();
    } catch {
      toast('Failed to delete message', 'error');
    }
  };

  const handleResetDemoData = () => {
    if (confirm('Reset demo store back to original starter data?')) {
      demoStore.reset();
      window.location.reload();
    }
  };

  const msgList = messages ?? [];

  return (
    <div className="space-y-10 max-w-4xl">
      <div>
        <p className="hud-label">Control Room</p>
        <h1 className="text-3xl font-bold font-display mt-1">Platform Settings & Inbox</h1>
        <p className="text-sm text-mute mt-1">
          Review business inquiries, platform security, and backend connection status.
        </p>
      </div>

      {/* 1. Contact Messages Inbox */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Mail className="size-5 text-blush" /> Business Contact Inquiries
          </h2>
          <span className="text-xs text-mute">{msgList.length} total inquiries</span>
        </div>

        {loading ? (
          <LoadingState count={2} variant="row" />
        ) : msgList.length === 0 ? (
          <EmptyState
            icon={<Mail className="size-8 text-mute" />}
            title="Inbox is empty"
            message="Messages submitted on the business Contact page will appear here."
          />
        ) : (
          <div className="space-y-3">
            {msgList.map((m) => (
              <div key={m.id} className="panel p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone={m.status === 'new' ? 'danger' : 'neutral'}>
                      {m.status.toUpperCase()}
                    </Badge>
                    <span className="font-bold text-ink">{m.name}</span>
                    <span className="text-xs text-mute font-mono">({m.email})</span>
                  </div>
                  <span className="text-xs text-mute flex items-center gap-1">
                    <Clock className="size-3" /> {formatDateTime(m.created_at)}
                  </span>
                </div>

                <div className="text-xs text-gold uppercase tracking-wider font-semibold">
                  Inquiry: {m.enquiry_type}
                </div>

                <p className="text-sm text-ink/90 leading-relaxed bg-surface/40 p-3 rounded-xl border border-line">
                  {m.message}
                </p>

                <div className="flex justify-end gap-2 pt-1">
                  {m.status === 'new' && (
                    <button
                      onClick={() => markMessageRead(m)}
                      className="px-3 py-1.5 rounded-lg bg-card hover:bg-white/10 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Check className="size-3" /> Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(m.id)}
                    className="p-1.5 text-red-300 hover:bg-bad/15 rounded-lg transition"
                    title="Delete message"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. Authentication & Account */}
      <section className="panel p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gold">
          <Shield className="size-5" /> Account & Security
        </h2>
        <div className="space-y-2 text-sm text-mute">
          <p>
            Authenticated Creator Account: <strong className="text-ink">{email || 'demo@local'}</strong>
          </p>
          <p>
            Security Model: Protected with Supabase Row Level Security (RLS) policies. Only authenticated creator tokens can perform database modifications.
          </p>
        </div>
      </section>

      {/* 3. Database & Deployment Status */}
      <section className="panel p-6 space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2 text-ultra">
          <Database className="size-5" /> Backend Service Connection
        </h2>

        <div className="flex items-center gap-3">
          <span
            className={`size-3 rounded-full ${
              demo ? 'bg-amber-400' : 'bg-ok animate-pulse-dot'
            }`}
          />
          <span className="font-semibold text-sm">
            {demo ? 'Running in Local Demonstration Mode' : 'Connected to Live Supabase PostgreSQL'}
          </span>
        </div>

        <p className="text-xs text-mute leading-relaxed">
          {demo
            ? 'In demo mode, profile updates, videos, scheduled streams, and votes persist inside local browser storage. To connect your live Supabase database, set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your deployment environment.'
            : 'All data is synchronized with your Supabase database in real-time. Edge Functions handle rate-limiting and YouTube API quotas.'}
        </p>

        {demo && (
          <div className="pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetDemoData}
              icon={<RotateCcw className="size-3.5" />}
            >
              Reset Demo Data to Initial State
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
