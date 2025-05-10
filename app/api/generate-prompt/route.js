// app/api/generate-prompt/route.js
import { NextResponse } from "next/server"
import { openai }      from "@/lib/openai"

export async function POST(req) {
  try {
    const { imageUrl } = await req.json()

    // steer GPT toward a single-line cinematic prompt
    const systemPrompt = `
You are an expert prompt‐engineer for cinematic video. Given an image URL, write a single-line, richly descriptive prompt capturing mood, setting, style, lighting, and composition optimized for a 16:9 video. Return ONLY the prompt text.
    `.trim()

    const userPrompt = `Image URL: ${imageUrl}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt }
      ],
      max_tokens: 60,
      temperature: 0.8
    })

    const prompt = completion.choices[0]?.message?.content.trim() || ""
    return NextResponse.json({ prompt })
  } catch (e) {
    console.error("[generate-prompt] Error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
