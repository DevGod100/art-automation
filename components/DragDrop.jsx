// app/components/DragDrop.jsx
'use client';
import { useRef, useState } from 'react';

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
      const payload = { imageBase64: b64, prompt: 'found skull in desert, blue lens', left: 0, right: 200, up: 0, down: 0, output_format: 'webp' };
      const res = await fetch('/api/outpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown server error');
      setOutUrl(data.url);
    } catch (err) {
      console.error('[DragDrop] Error:', err);
      setError(err.message);
    }
  };

  return (
    <div onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files); }} onDragOver={e => e.preventDefault()} onClick={() => fileInputRef.current.click()} className="h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-400 p-8 cursor-pointer">
      <input ref={fileInputRef} type="file" accept="image/webp,image/png,image/jpeg" hidden multiple={false} onChange={e => handleFiles(e.target.files)} />
      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
      <h1 className="text-2xl font-semibold mb-4">Drag/Click to Outpaint</h1>
      {error && <p className="text-red-500 mb-4">Error: {error}</p>}
      {outUrl ? <img src={outUrl} className="max-w-full max-h-96" alt="outpainted"/> : <p className="text-gray-500">Drop an image here</p>}
    </div>
  );
}
