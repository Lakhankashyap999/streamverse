export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');

  try {
    const response = await fetch('https://www.youtube.com/@khusiytlive/live', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await response.text();

    // YouTube explicitly flags active livestreams with "isLiveNow": true in player metadata.
    // When offline or scheduled/upcoming, YouTube includes "LIVE_STREAM_OFFLINE" or "isLiveNow": false.
    const isOffline =
      html.includes('"LIVE_STREAM_OFFLINE"') ||
      html.includes('"isLiveNow":false') ||
      html.includes('LIVE_STREAM_OFFLINE');

    const isUpcoming =
      html.includes('"isUpcoming":true') ||
      html.includes('upcomingEventData') ||
      html.includes('"status":"UPCOMING"');

    const isLiveNowMatch = /"isLiveNow"\s*:\s*true/.test(html);

    // Active live ONLY if isLiveNow is true AND not offline
    const isLive = Boolean(isLiveNowMatch && !isOffline);

    const vidMatch = html.match(
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})">/
    );

    const titleMatch =
      html.match(/<meta name="title" content="([^"]+)">/) ||
      html.match(/<title>([^<]+)<\/title>/);

    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : null;
    const videoId = vidMatch ? vidMatch[1] : null;

    return res.status(200).json({
      isLive,
      isUpcoming,
      videoId: isLive ? videoId : null,
      title: isLive ? title : null,
      streamUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com/@khusiytlive/live',
      channelUrl: 'https://www.youtube.com/@khusiytlive',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    // If checking YouTube fails, default strictly to offline (never false-positive live)
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
