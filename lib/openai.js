// lib/openai.js
import OpenAI from "openai"

export const openai = new OpenAI({
  // you can omit apiKey here if OPENAI_API_KEY is set in env
  apiKey: process.env.OPENAI_API_KEY
})
