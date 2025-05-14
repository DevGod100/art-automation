// app/api/generateVideo/route.js
import { NextResponse } from 'next/server'
export async function POST(req) {
  const { prompt, imageUrl } = await req.json()
  const res = await fetch(
    process.env.NEXT_PUBLIC_SKYREELS_URL + '/generate-video',
    { method: 'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ prompt, image_url: imageUrl }) }
  )
  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err }, { status: res.status })
  }
  const { video_url } = await res.json()
  return NextResponse.json({ videoUrl: video_url })
}
