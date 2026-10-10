import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Save, Upload, User, Image as ImageIcon, Sparkles, AlertCircle } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { usePageMeta } from '../hooks';
import { profileService } from '../services/profileService';
import { storageService } from '../services/storageService';
import { useToast } from '../components/ui/Toast';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Toggle, Select } from '../components/ui/Input';
import { SafeImage } from '../components/ui/Display';
import { friendlyError } from '../utils/misc';
import type { LiveStatusMode } from '../types';

export function ProfilePage() {
  const { profile, reload } = useProfile();
  usePageMeta('Manage Creator Profile');
  const toast = useToast();

  const [form, setForm] = useState({
    gaming_name: profile.gaming_name || '',
    display_name: profile.display_name || '',
    handle: profile.handle || '',
    tagline: profile.tagline || '',
    bio: profile.bio || '',
    avatar_url: profile.avatar_url || '',
    banner_url: profile.banner_url || '',
    youtube_url: profile.youtube_url || '',
    instagram_url: profile.instagram_url || '',
    discord_url: profile.discord_url || '',
    whatsapp_url: profile.whatsapp_url || '',
    membership_url: profile.membership_url || '',
    favourite_modes: profile.favourite_modes?.join(', ') || '',
    game_id: profile.game_id || '',
    upi_id: profile.upi_id || '',
    show_upi: profile.show_upi,
    country: profile.country || '',
    journey: profile.journey || '',
    setup: profile.setup || '',
    achievements: profile.achievements || '',
    community_message: profile.community_message || '',
    live_status_mode: profile.live_status_mode || 'auto',
    show_stats: profile.show_stats,
    stats_subscribers: profile.stats_snapshot?.subscribers || '',
    stats_videos: profile.stats_snapshot?.videos || '',
    stats_views: profile.stats_snapshot?.views || '',
    stats_instagram: profile.stats_snapshot?.instagram_followers || '',
  });

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [error, setError] = useState('');

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await storageService.uploadImage(file, 'avatar');
      setForm((prev) => ({ ...prev, avatar_url: url }));
      toast('Profile photo updated!', 'success');
    } catch (err) {
      toast(friendlyError(err, 'Avatar upload failed'), 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBannerUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await storageService.uploadImage(file, 'banner');
      setForm((prev) => ({ ...prev, banner_url: url }));
      toast('Banner image updated!', 'success');
    } catch (err) {
      toast(friendlyError(err, 'Banner upload failed'), 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const modes = form.favourite_modes
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    try {
      await profileService.save({
        gaming_name: form.gaming_name.trim(),
        display_name: form.display_name.trim() || null,
        handle: form.handle.trim() || null,
        tagline: form.tagline.trim() || null,
        bio: form.bio.trim() || null,
        avatar_url: form.avatar_url.trim() || null,
        banner_url: form.banner_url.trim() || null,
        youtube_url: form.youtube_url.trim() || null,
        instagram_url: form.instagram_url.trim() || null,
        discord_url: form.discord_url.trim() || null,
        whatsapp_url: form.whatsapp_url.trim() || null,
        membership_url: form.membership_url.trim() || null,
        favourite_modes: modes,
        game_id: form.game_id.trim() || null,
        upi_id: form.upi_id.trim() || null,
        show_upi: form.show_upi,
        country: form.country.trim() || null,
        journey: form.journey.trim() || null,
        setup: form.setup.trim() || null,
        achievements: form.achievements.trim() || null,
        community_message: form.community_message.trim() || null,
        live_status_mode: form.live_status_mode as LiveStatusMode,
        show_stats: form.show_stats,
        stats_snapshot: form.show_stats
          ? {
              subscribers: form.stats_subscribers.trim() || undefined,
              videos: form.stats_videos.trim() || undefined,
              views: form.stats_views.trim() || undefined,
              instagram_followers: form.stats_instagram.trim() || undefined,
              as_of: new Date().toISOString().slice(0, 10),
            }
          : null,
      });

      await reload();
      toast('Profile updated successfully!', 'success');
    } catch (err) {
      setError(friendlyError(err, 'Failed to save profile changes.'));
      toast('Error saving profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <p className="hud-label">Profile Configuration</p>
        <h1 className="text-3xl font-bold font-display mt-1">Creator Profile & Brand</h1>
        <p className="text-sm text-mute mt-1">
          Customize your gaming name, bio, visuals, links, and game details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Visuals: Avatar & Banner */}
        <div className="panel p-6 space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ImageIcon className="size-5 text-blush" /> Visual Branding
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Avatar */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-ink block">Profile Photo (Avatar)</label>
              <div className="flex items-center gap-4">
                <SafeImage
                  src={form.avatar_url}
                  alt="Avatar preview"
                  className="size-20 rounded-2xl border-2 border-line object-cover"
                />
                <div className="space-y-2">
                  <label className="clip-angle-sm inline-flex items-center gap-2 bg-card hover:bg-white/10 border border-line px-3 py-1.5 text-xs font-semibold cursor-pointer transition">
                    <Upload className="size-3.5" />
                    <span>{uploadingAvatar ? 'Uploading…' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[0.7rem] text-mute">JPG, PNG, WebP (Max 8MB)</p>
                </div>
              </div>
              <Input
                label="Or Avatar URL"
                value={form.avatar_url}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                placeholder="/images/creator/... or https://"
              />
            </div>

            {/* Banner */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-ink block">Channel Banner</label>
              <div className="h-20 rounded-xl overflow-hidden border border-line bg-surface relative">
                <SafeImage
                  src={form.banner_url}
                  alt="Banner preview"
                  className="size-full object-cover"
                />
              </div>
              <label className="clip-angle-sm inline-flex items-center gap-2 bg-card hover:bg-white/10 border border-line px-3 py-1.5 text-xs font-semibold cursor-pointer transition">
                <Upload className="size-3.5" />
                <span>{uploadingBanner ? 'Uploading…' : 'Upload Banner'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="hidden"
                />
              </label>
              <Input
                label="Or Banner URL"
                value={form.banner_url}
                onChange={(e) => setForm({ ...form, banner_url: e.target.value })}
                placeholder="/images/creator/... or https://"
              />
            </div>
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="size-5 text-gold" /> Identity & Description
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Gaming Name"
              required
              value={form.gaming_name}
              onChange={(e) => setForm({ ...form, gaming_name: e.target.value })}
            />
            <Input
              label="Display / Real First Name (Optional)"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Social Handle"
              value={form.handle}
              onChange={(e) => setForm({ ...form, handle: e.target.value })}
              placeholder="@khusiytlive"
            />
            <Input
              label="Tagline"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              placeholder="Girl Gamer · BGMI Livestreamer"
            />
          </div>

          <Textarea
            label="Biography"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            hint="Introduces you on the homepage and about page."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="BGMI Game ID"
              value={form.game_id}
              onChange={(e) => setForm({ ...form, game_id: e.target.value })}
              placeholder="5112658248"
            />
            <Input
              label="Country / Region"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="India"
            />
          </div>

          <Input
            label="Favourite Game Modes (comma-separated)"
            value={form.favourite_modes}
            onChange={(e) => setForm({ ...form, favourite_modes: e.target.value })}
            placeholder="TOP 100 Rank Push, Rush Gameplay, Squad Matches"
          />
        </div>

        {/* Social Links */}
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="size-5 text-ultra" /> Official Social Profiles
          </h2>
          <p className="text-xs text-mute">
            Only links with valid URLs will be displayed on the website. Empty fields are hidden automatically.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="YouTube Channel URL"
              value={form.youtube_url}
              onChange={(e) => setForm({ ...form, youtube_url: e.target.value })}
              placeholder="https://www.youtube.com/@khusiytlive"
            />
            <Input
              label="Instagram URL"
              value={form.instagram_url}
              onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
              placeholder="https://www.instagram.com/igkhusi"
            />
            <Input
              label="Discord Invite URL"
              value={form.discord_url}
              onChange={(e) => setForm({ ...form, discord_url: e.target.value })}
              placeholder="https://discord.gg/YrhMyQMsMX"
            />
            <Input
              label="WhatsApp Channel (Optional)"
              value={form.whatsapp_url}
              onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value })}
              placeholder="https://whatsapp.com/channel/..."
            />
            <Input
              label="YouTube Channel Membership URL"
              value={form.membership_url}
              onChange={(e) => setForm({ ...form, membership_url: e.target.value })}
              placeholder="https://www.youtube.com/@khusiytlive/join"
            />
            <Input
              label="UPI ID (for Support)"
              value={form.upi_id}
              onChange={(e) => setForm({ ...form, upi_id: e.target.value })}
              placeholder="95997292@ybl"
            />
          </div>

          <Toggle
            label="Display UPI Support on Homepage"
            description="Allows fans to copy your UPI address directly from the website."
            checked={form.show_upi}
            onChange={(v) => setForm({ ...form, show_upi: v })}
          />
        </div>

        {/* Live Broadcast Override */}
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-bold">Stream Status Setting</h2>
          <Select
            label="Live Status Display Mode"
            value={form.live_status_mode}
            onChange={(e) => setForm({ ...form, live_status_mode: e.target.value as LiveStatusMode })}
            hint="'Auto' checks scheduled streams or YouTube API; 'Live Now' forces the Live badge on; 'Offline' hides the live banner."
          >
            <option value="auto">Auto (Verify via Schedule & YouTube)</option>
            <option value="live">Force Live Now (Manual broadcast alert)</option>
            <option value="offline">Force Offline (No active broadcast)</option>
          </Select>
        </div>

        {/* Stats Snapshot */}
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-bold">Public Channel Snapshot (Optional)</h2>
          <p className="text-xs text-mute">
            Allows showing public subscriber and video stats entered manually by the creator.
          </p>

          <Toggle
            label="Show Channel Snapshot on Homepage"
            checked={form.show_stats}
            onChange={(v) => setForm({ ...form, show_stats: v })}
          />

          {form.show_stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
              <Input
                label="Subscribers"
                value={form.stats_subscribers}
                onChange={(e) => setForm({ ...form, stats_subscribers: e.target.value })}
                placeholder="27.6K"
              />
              <Input
                label="Videos"
                value={form.stats_videos}
                onChange={(e) => setForm({ ...form, stats_videos: e.target.value })}
                placeholder="1.1K"
              />
              <Input
                label="Total Views"
                value={form.stats_views}
                onChange={(e) => setForm({ ...form, stats_views: e.target.value })}
                placeholder="1.9M"
              />
              <Input
                label="Instagram Followers"
                value={form.stats_instagram}
                onChange={(e) => setForm({ ...form, stats_instagram: e.target.value })}
                placeholder="9.4K"
              />
            </div>
          )}
        </div>

        {/* Story & Setup */}
        <div className="panel p-6 space-y-4">
          <h2 className="text-lg font-bold">About Page Details</h2>
          <Textarea
            label="Gaming Journey"
            rows={3}
            value={form.journey}
            onChange={(e) => setForm({ ...form, journey: e.target.value })}
            placeholder="Tell your story of how you started gaming..."
          />
          <Textarea
            label="Gaming Setup & Gear"
            rows={2}
            value={form.setup}
            onChange={(e) => setForm({ ...form, setup: e.target.value })}
            placeholder="Device: iPad Pro / iPhone / PC, Headphones, Mic, etc."
          />
          <Textarea
            label="Achievements"
            rows={2}
            value={form.achievements}
            onChange={(e) => setForm({ ...form, achievements: e.target.value })}
            placeholder="Rank achievements, tournament standings, milestones..."
          />
          <Textarea
            label="Community Message"
            rows={2}
            value={form.community_message}
            onChange={(e) => setForm({ ...form, community_message: e.target.value })}
            placeholder="A special thank you note to your viewers..."
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-300 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </p>
        )}

        <Button type="submit" loading={saving} size="lg" icon={<Save className="size-5" />}>
          Save Profile Changes
        </Button>
      </form>
    </div>
  );
}
