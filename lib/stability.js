// lib/stability.js
import FormData from 'form-data';

// v2beta outpainting URL
const STABILITY_BASE = 'https://api.stability.ai/v2beta';

/**
 * Outpaint via Stability AI v2beta
 */
export async function outpaint({
  imageBase64,
  prompt = '',
  seed = 0,
  creativity = 0.5,
  style_preset = '',
  output_format = 'png',
  left = 0,
  right = 0,
  up = 0,
  down = 0,
}) {
  const url = `${STABILITY_BASE}/stable-image/edit/outpaint`;
  const imgBuffer = Buffer.from(imageBase64, 'base64');
  const form = new FormData();
  form.append('image', imgBuffer, { filename: 'in.webp' });
  form.append('prompt', prompt);
  form.append('seed', seed);
  form.append('creativity', creativity);
  form.append('style_preset', style_preset);
  form.append('output_format', output_format);
  form.append('left', left);
  form.append('right', right);
  form.append('up', up);
  form.append('down', down);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.STABILITY_API_KEY}`,
      Accept: 'image/*',
      ...form.getHeaders(),
    },
    body: form.getBuffer(),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Stability outpaint error ${res.status}: ${errText}`);
  }

  return await res.arrayBuffer();
}
