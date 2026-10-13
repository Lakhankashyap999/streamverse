export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    const response = await fetch('https://www.youtube.com/@khusiytlive/live', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg; CONSENT=YES+cb.20210328-17-p0.en+FX+478;',
      },
    });

    const html = await response.text();

    const isOffline = html.includes('LIVE_STREAM_OFFLINE');
    const isUpcoming = html.includes('"isUpcoming":true') || html.includes('upcomingEventData');
    const hasLiveNow = /"isLiveNow"\s*:\s*true/.test(html);
    const hasLivePlayer = html.includes('"status":"OK"') && html.includes('"isLive":true');

    // True ONLY when actively live, NOT offline and NOT upcoming
    const isLive = Boolean((hasLiveNow || hasLivePlayer) && !isOffline && !isUpcoming);

    const vidMatch = html.match(/\/watch\?v=([a-zA-Z0-9_-]{11})/);
    const titleMatch =
      html.match(/<meta name="title" content="([^"]+)">/) ||
      html.match(/<title>([^<]+)<\/title>/);

    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : null;
    const videoId = vidMatch ? vidMatch[1] : (isLive ? 'WtpOElc_3pg' : null);

    return res.status(200).json({
      isLive,
      isUpcoming,
      videoId: isLive ? videoId : null,
      title: isLive ? (title || 'BGMI Rank Push Livestream 🔴 | KhushiYT') : null,
      streamUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com/@khusiytlive/live',
      channelUrl: 'https://www.youtube.com/@khusiytlive',
      debug: {
        isOffline,
        isUpcoming,
        hasLiveNow,
        hasLivePlayer,
        hasLiveStreamOffline: html.includes('LIVE_STREAM_OFFLINE'),
        htmlLength: html.length,
        vidMatch: vidMatch ? vidMatch[1] : null,
        title: title || null,
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(200).json({
      isLive: false,
      isUpcoming: false,
      videoId: null,
      title: null,
      streamUrl: 'https://www.youtube.com/@khusiytlive/live',
      channelUrl: 'https://www.youtube.com/@khusiytlive',
      fallback: true,
      updatedAt: new Date().toISOString(),
    });
  }
}
