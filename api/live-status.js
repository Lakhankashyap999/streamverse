export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=45, stale-while-revalidate=90');

  try {
    const response = await fetch('https://www.youtube.com/@khusiytlive/live', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await response.text();

    const isLive =
      html.includes('"isLive":true') ||
      html.includes('"isLiveBroadcast":true') ||
      html.includes('"status":"LIVE"');

    const isUpcoming =
      html.includes('"isUpcoming":true') || html.includes('upcomingEventData');

    const vidMatch = html.match(
      /<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})">/
    );

    const titleMatch =
      html.match(/<meta name="title" content="([^"]+)">/) ||
      html.match(/<title>([^<]+)<\/title>/);

    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : null;
    const videoId = vidMatch ? vidMatch[1] : (isLive ? 'WWeleSTclPg' : null);

    return res.status(200).json({
      isLive,
      isUpcoming,
      videoId,
      title: title || (isLive ? 'TOP 100 Rank Push With Rush Gameplay 🔴 | BGMI' : null),
      streamUrl: videoId ? `https://www.youtube.com/watch?v=${videoId}` : 'https://www.youtube.com/@khusiytlive/live',
      channelUrl: 'https://www.youtube.com/@khusiytlive',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(200).json({
      isLive: true,
      isUpcoming: false,
      videoId: 'WWeleSTclPg',
      title: 'BGMI OCEAN ODYSSEY IS BACK🐟| RANK PUSH🔥',
      streamUrl: 'https://www.youtube.com/watch?v=WWeleSTclPg',
      channelUrl: 'https://www.youtube.com/@khusiytlive',
      fallback: true,
      updatedAt: new Date().toISOString(),
    });
  }
}
