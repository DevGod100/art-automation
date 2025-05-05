'use client'

import { useState, useRef } from 'react'
import ImagePreview from './ImagePreview'

export default function DragDrop() {
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const onDrop = e => {
    e.preventDefault()
    setFiles(Array.from(e.dataTransfer.files))
  }

  const onDragOver = e => {
    e.preventDefault()
  }

  const handleClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={handleClick}
      className="h-full flex flex-col items-center justify-center border-4 border-dashed border-gray-400 p-8 cursor-pointer"
    >
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
        multiple
      />

      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>

      <h1 className="text-2xl font-semibold mb-4">Drag &amp; Drop Files Here</h1>

      {files.length > 0 ? (
        <div className="flex flex-wrap justify-center">
          {files.map((file) => (
            <ImagePreview key={file.name} file={file} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No files yet. Drop or click to select images.</p>
      )}
    </div>
  )
}