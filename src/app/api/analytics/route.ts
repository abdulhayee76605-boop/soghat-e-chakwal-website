import { NextResponse } from 'next/server';

let liveAnalytics = {
  sessions: 0,
  pageViews: 0,
  productViews: 0,
  addToCart: 0,
  checkouts: 0,
  orders: 0,
  lastUpdated: new Date().toISOString(),
};

export async function GET() {
  return NextResponse.json(liveAnalytics);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const step = body.step as keyof typeof liveAnalytics;
    if (step && typeof liveAnalytics[step] === 'number') {
      (liveAnalytics[step] as number) += 1;
      liveAnalytics.lastUpdated = new Date().toISOString();
    }
    return NextResponse.json(liveAnalytics);
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
