// app/api/test-stability/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch engines to test API connectivity
    const response = await fetch('https://api.stability.ai/v1/engines/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Stability API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, engines: data });
  } catch (error) {
    console.error('Stability API connection error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}