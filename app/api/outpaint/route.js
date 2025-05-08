// app/api/outpaint/route.js
import { outpaint } from '../../../lib/stability';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req) {
  try {
    const params = await req.json();
    const buffer = await outpaint(params);

    // write to public/outpainted
    const dir = path.join(process.cwd(), 'public', 'outpainted');
    await fs.mkdir(dir, { recursive: true });
    const ext = params.output_format || 'png';
    const filename = `outpainted-${Date.now()}.${ext}`;
    const filePath = path.join(dir, filename);
    await fs.writeFile(filePath, Buffer.from(buffer));
    console.log(`[Outpaint] Saved file at ${filePath}`);

    // URL accessible via http://localhost:3000/outpainted/<filename>
    return NextResponse.json({ url: `/outpainted/${filename}` });
  } catch (err) {
    console.error('[Outpaint] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}