function isScheduledLiveTime() {
  const now = new Date();
  const utcMs = now.getTime();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(utcMs + istOffsetMs);
  const h = istDate.getUTCHours();
  const m = istDate.getUTCMinutes();
  const totalMinutes = h * 60 + m;
  // 10:00 PM (22:00 = 1320 min) to 5:00 AM (05:00 = 300 min) IST
  return totalMinutes >= 1320 || totalMinutes < 300;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const channelHandle = 'khusiytlive';
    const channelId = 'UCWXwHv3czu_EUYCN_pRhs2A';

    // 1. Fetch channel's permanent /live endpoint
    const response = await fetch(`https://www.youtube.com/@${channelHandle}/live`, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg; CONSENT=YES+cb.20210328-17-p0.en+FX+478;',
      },
    });

    const html = await response.text();
    const finalUrl = response.url || '';

    // Extract canonical URL (YouTube sets canonical to /watch?v=VIDEO_ID if currently live)
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
    const canonicalUrl = canonicalMatch ? canonicalMatch[1] : '';
    const isWatchPage = canonicalUrl.includes('/watch?v=') || finalUrl.includes('/watch?v=');

    // Extract Video ID from canonical or videoDetails
    const canonicalVidMatch = canonicalUrl.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    const vidDetailsMatch = html.match(/"videoDetails"\s*:\s*\{"videoId"\s*:\s*"([a-zA-Z0-9_-]{11})"/);
    const fallbackVidMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    const activeVideoId = canonicalVidMatch?.[1] || vidDetailsMatch?.[1] || (isWatchPage ? fallbackVidMatch?.[1] : null);

    // Live indicators in YouTube page data
    const hasLiveBadge = html.includes('BADGE_STYLE_TYPE_LIVE_NOW') || html.includes('"label":"LIVE"');
    const hasIsLiveNow = /"isLiveNow"\s*:\s*true/.test(html);
    const hasIsLive = /"isLive"\s*:\s*true/.test(html);
    const hasIsLiveContent = /"isLiveContent"\s*:\s*true/.test(html);
    const hasLiveBroadcast = /"liveBroadcastDetails"\s*:\s*\{[^}]*"isLiveNow"\s*:\s*true/.test(html);
    const isUpcoming = html.includes('"isUpcoming":true') || html.includes('upcomingEventData');
    const isOfflineExplicit = html.includes('LIVE_STREAM_OFFLINE') && !hasIsLiveNow && !hasLiveBadge;

    // Stream Title
    const titleMatch =
      html.match(/<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i) ||
      html.match(/<title>([^<]+)<\/title>/i);
    const rawTitle = titleMatch ? titleMatch[1].replace(/\s*-\s*YouTube$/i, '').trim() : null;
    const isChannelOnlyTitle = rawTitle === 'KhushiYT' || !rawTitle;

    const isScheduleActive = isScheduledLiveTime();

    // Active Live State: YouTube live signals detected OR within daily 10 PM - 5 AM IST window
    const isLive = Boolean(
      (isWatchPage &&
      !isUpcoming &&
      !isOfflineExplicit &&
      (hasLiveBadge || hasIsLiveNow || hasIsLive || hasIsLiveContent || hasLiveBroadcast || !isChannelOnlyTitle)) ||
      isScheduleActive
    );

    const streamTitle = isLive ? (rawTitle || 'BGMI Rank Push Livestream 🔴 | KhushiYT') : null;
    const videoId = isLive ? activeVideoId : null;

    return res.status(200).json({
      isLive,
      isUpcoming,
      videoId,
      title: streamTitle,
      streamUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : `https://www.youtube.com/@${channelHandle}/live`,
      channelUrl: `https://www.youtube.com/@${channelHandle}`,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    const isScheduleActive = isScheduledLiveTime();
    return res.status(200).json({
      isLive: isScheduleActive,
      isUpcoming: false,
      videoId: null,
      title: isScheduleActive ? 'BGMI Rank Push Livestream 🔴 | KhushiYT' : null,
      streamUrl: 'https://www.youtube.com/@khusiytlive/live',
      channelUrl: 'https://www.youtube.com/@khusiytlive',
      fallback: true,
      updatedAt: new Date().toISOString(),
    });
  }
}
