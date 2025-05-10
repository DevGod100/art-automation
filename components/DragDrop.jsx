// app/components/DragDrop.jsx
'use client'

import { useRef, useState } from 'react'

/**
 * Convert a File/Blob into a base64 string (without data: prefix).
 */
async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Given original image dimensions and a target aspect ratio,
 * compute how many pixels to outpaint on each side to center it.
 */
function computeOffsets(origW, origH, targetRatio) {
  const currentRatio = origW / origH
  let canvasW, canvasH

  if (currentRatio < targetRatio) {
    // image is too tall -> widen canvas
    canvasH = origH
    canvasW = Math.round(origH * targetRatio)
  } else {
    // image is too wide -> heighten canvas
    canvasW = origW
    canvasH = Math.round(origW / targetRatio)
  }

  const extraW = canvasW - origW
  const extraH = canvasH - origH
  const left  = Math.floor(extraW / 2)
  const right = extraW - left
  const up    = Math.floor(extraH / 2)
  const down  = extraH - up

  return { left, right, up, down }
}

export default function DragDrop() {
  const fileInputRef = useRef(null)
  const [outUrl, setOutUrl] = useState(null)
  const [error,  setError]  = useState(null)

  const handleFiles = async (files) => {
    setError(null)
    const file = files[0]
    if (!file) return

    try {
      // convert file to base64
      const b64 = await fileToBase64(file)

      // load to measure original dimensions
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((r, rej) => {
        img.onload  = r
        img.onerror = rej
      })

      // compute 16:9 offsets (adjust ratio here if desired)
      const targetRatio = 16 / 9
      const { left, right, up, down } = computeOffsets(
        img.naturalWidth,
        img.naturalHeight,
        targetRatio
      )

      // prepare payload
      const payload = {
        imageBase64: b64,
        prompt: 'found skull in desert, blue lens',
        left,
        right,
        up,
        down,
        output_format: 'webp',
        style_preset: 'enhance'
      }

      // call your Next.js API route
      const res = await fetch('/api/outpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error')

      setOutUrl(data.url)
    } catch (err) {
      console.error('[DragDrop] Error:', err)
      setError(err.message)
    }
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-400 p-8 cursor-pointer"
      onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      onDragOver={e => e.preventDefault()}
      onClick={() => fileInputRef.current.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/webp,image/png,image/jpeg"
        hidden
        onChange={e => handleFiles(e.target.files)}
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

      <h1 className="text-2xl font-semibold mb-4">Drag or Click to Outpaint</h1>

      {error && (
        <p className="text-red-500 mb-4">
          Error: {error}
        </p>
      )}

      {outUrl ? (
        <img
          src={outUrl}
          alt="Outpainted result"
          className="max-w-full max-h-96 object-contain rounded shadow"
        />
      ) : (
        <p className="text-gray-500">
          Drop an image here to start outpainting.
        </p>
      )}
    </div>
  )
}
