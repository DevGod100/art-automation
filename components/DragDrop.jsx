'use client'
import { useRef } from 'react'

export default function DragDrop({ onFileDrop }) {
  const inputRef = useRef(null)

  const handle = files => {
    if (files && files[0]) onFileDrop(files[0])
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center
                 border-4 border-dashed border-gray-400 p-8 cursor-pointer"
      onDrop={e => { e.preventDefault(); handle(e.dataTransfer.files) }}
      onDragOver={e => e.preventDefault()}
      onClick={() => inputRef.current.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/png,image/jpeg"
        hidden
        onChange={e => handle(e.target.files)}
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
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9
             M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <h1 className="text-2xl font-semibold mb-4">
        Drag or Click to Outpaint
      </h1>
    </div>
  )
}
