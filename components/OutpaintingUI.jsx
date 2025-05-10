// app/components/OutpaintingUI.jsx
'use client'

import { useState } from 'react'
import DragDrop from './DragDrop'
import Gallery from './Gallery'

// helper: convert File to base64 string
const fileToBase64 = file =>
  new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => res(reader.result.split(',')[1])
    reader.onerror = rej
    reader.readAsDataURL(file)
  })

// helper: compute 16:9 outpaint offsets
function computeOffsets(width, height) {
  const ratio = 16 / 9
  let canvasW, canvasH
  if (width / height < ratio) {
    canvasH = height
    canvasW = Math.round(height * ratio)
  } else {
    canvasW = width
    canvasH = Math.round(width / ratio)
  }
  const extraW = canvasW - width
  const extraH = canvasH - height
  const left = Math.floor(extraW / 2)
  const right = extraW - left
  const up = Math.floor(extraH / 2)
  const down = extraH - up
  return { left, right, up, down }
}

export default function OutpaintingUI({ initialImages }) {
  // gallery state: { id, url, loading }
  const [items, setItems] = useState(
    initialImages.map(url => ({ id: url, url, loading: false }))
  )

  const onFileDrop = async file => {
    const id = `new-${Date.now()}`
    setItems(prev => [{ id, url: null, loading: true }, ...prev])

    try {
      const b64 = await fileToBase64(file)
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise(r => (img.onload = r))
      const { left, right, up, down } = computeOffsets(img.naturalWidth, img.naturalHeight)

      const res = await fetch('/api/outpaint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: b64,
          prompt: 'found skull in desert, blue lens',
          left,
          right,
          up,
          down,
          output_format: 'webp',
          style_preset: 'enhance'
        })
      })

      const { url, error } = await res.json()
      if (!res.ok) throw new Error(error || 'Outpaint failed')

      setItems(prev =>
        prev.map(item =>
          item.id === id ? { id, url, loading: false } : item
        )
      )
    } catch (err) {
      console.error('[OutpaintingUI] Error:', err)
      setItems(prev => prev.filter(item => item.id !== id))
    }
  }

  return (
    <div className="flex h-screen">
      <div className="w-2/3">
        <DragDrop onFileDrop={onFileDrop} />
      </div>
      <div className="w-1/3 border-l">
        <Gallery items={items} />
      </div>
    </div>
  )
}
