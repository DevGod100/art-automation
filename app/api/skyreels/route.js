export async function POST(req) {
    const { prompt, imageUrl } = await req.json()
    const res = await fetch('https://<your-runpod-url>:8000/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, image_url: imageUrl })
    })
    const { video_url } = await res.json()
    return NextResponse.json({ video_url })
  }
  