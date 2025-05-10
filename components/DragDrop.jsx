// app/components/DragDrop.jsx
'use client';
import { useRef, useState } from 'react';

// Utility to compute dynamic outpaint offsets for a target aspect ratio
function computeOffsets(origW, origH, targetRatio) {
  const currentRatio = origW / origH;
  let canvasW, canvasH;
  if (currentRatio < targetRatio) {
    canvasH = origH;
    canvasW = Math.round(origH * targetRatio);
  } else {
    canvasW = origW;
    canvasH = Math.round(origW / targetRatio);
  }
  const extraW = canvasW - origW;
  const extraH = canvasH - origH;
  const left = Math.floor(extraW / 2);
  const right = extraW - left;
  const up = Math.floor(extraH / 2);
  const down = extraH - up;
  return { left, right, up, down };
}

async function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result.split(',')[1]);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

export default function DragDrop() {
  const fileInputRef = useRef();
  const [outUrl, setOutUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleFiles = async (files) => {
    setError(null);
    const file = files[0];
    try {
      const b64 = await fileToBase64(file);
      // get original dimensions via Image API
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((r) => (img.onload = r));
      // choose landscape 16:9 ratio, adjust as needed
      const targetRatio = 16 / 9;
      const { left, right, up, down } = computeOffsets(img.naturalWidth, img.naturalHeight, targetRatio);

      const payload = {
        imageBase64: b64,
        prompt: 'found skull in desert, blue lens',
        left,
        right,
        up,
        down,
        output_format: 'webp',
        style_preset: 'enhance',
      };

      const res = await fetch('/api/outpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Server error');
      setOutUrl(data.url);
    } catch (err) {
      console.error('[DragDrop] Error:', err);
      setError(err.message);
    }
  };

  return (
    <div
      onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInputRef.current.click()}
      className="h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-400 p-8 cursor-pointer"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/webp,image/png,image/jpeg"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <svg
        className="w-16 h-16 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <h1 className="text-2xl font-semibold mb-4">Drag/Click to Outpaint</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {outUrl ? <img src={outUrl} alt="outpainted" className="max-w-full max-h-96" /> : <p className="text-gray-500">Drop an image here</p>}
    </div>
  );
}