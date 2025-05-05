'use client'

import { useState, useEffect } from 'react'

export default function ImagePreview({ file }) {
  const [src, setSrc] = useState(null)

  useEffect(() => {
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = e => setSrc(e.target.result)
    reader.readAsDataURL(file)
  }, [file])

  if (!src) return null

  return (
    <div className="m-2">
      <img
        src={src}
        alt={file.name}
        className="max-w-xs max-h-64 object-contain rounded shadow"
      />
      <p className="text-sm text-gray-600 mt-1">{file.name}</p>
    </div>
  )
}