import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. First, attempt to fetch the raw HTML page of Devfolio Hackathons
    const htmlRes = await fetch('https://devfolio.co/hackathons', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (htmlRes.ok) {
      const html = await htmlRes.text();
      
      // 2. Extract the Next.js data injected into the page window
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
      
      if (nextDataMatch && nextDataMatch[1]) {
        const nextData = JSON.parse(nextDataMatch[1]);
        
        // 3. Navigate the Next.js props to find hackathons.
        // It's typically inside props.pageProps.initialState.hackathons or similar.
        // To be resilient against schema changes, we serialize and regex search for objects that look like hackathons.
        
        const dataStr = JSON.stringify(nextData);
        // Look for objects containing name, slug, starts_at, and desc
        const hackathonMatches = [...dataStr.matchAll(/{"name":"([^"]+)",(?:.*?)?"slug":"([^"]+)",(?:.*?)?"desc":"([^"]*)",(?:.*?)?"starts_at":"([^"]+)",(?:.*?)?"ends_at":"([^"]+)"/g)];
        
        if (hackathonMatches.length > 0) {
          const extractedHacks = hackathonMatches.map(m => ({
            _id: m[2], // Use slug as ID
            name: m[1],
            slug: m[2],
            desc: m[3],
            starts_at: m[4],
            ends_at: m[5],
            url: `https://${m[2]}.devfolio.co`
          }));

          // Sort by start date
          extractedHacks.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

          // Remove duplicates
          const uniqueHacks = extractedHacks.filter((hack, index, self) => 
            index === self.findIndex((t) => t.slug === hack.slug)
          );

          if (uniqueHacks.length > 0) {
            return NextResponse.json({ hits: uniqueHacks });
          }
        }
      }
    }
  } catch (error) {
    console.error("Devfolio fetch/scrape failed, falling back to mock data:", error);
  }

  // Fallback mock data if Devfolio has completely changed their client-side structure
  const mockData = {
    hits: [
      {
        _id: "mock1",
        name: "EthGlobal Tokyo 2026",
        desc: "The largest Web3 ecosystem hackathon returning to Tokyo. Build the future of decentralization.",
        starts_at: "2026-05-15T09:00:00Z",
        ends_at: "2026-05-17T18:00:00Z",
        slug: "ethglobal-tokyo",
        url: "https://ethglobal.com/events/tokyo"
      },
      {
        _id: "mock2",
        name: "AI Innovators Challenge",
        desc: "Create next-gen AI applications using state-of-the-art LLMs and computer vision models.",
        starts_at: "2026-04-10T00:00:00Z",
        ends_at: "2026-04-12T00:00:00Z",
        slug: "ai-innovators",
        url: "https://ai-innovators.devfolio.co"
      },
      {
        _id: "mock3",
        name: "GreenTech Hacks",
        desc: "Solve climate change issues with technology. A 48-hour sprint for Earth.",
        starts_at: "2026-06-01T10:00:00Z",
        ends_at: "2026-06-03T10:00:00Z",
        slug: "greentech-hacks",
        url: "https://greentech.devfolio.co"
      }
    ]
  };

  return NextResponse.json(mockData);
}
