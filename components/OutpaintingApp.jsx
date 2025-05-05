'use client'

import { useState } from 'react'
import DragDrop from './DragDrop'
import ImageProcessor from './ImageProcessor'

export default function OutpaintingApp() {
  const [files, setFiles] = useState([])
  const [processedImages, setProcessedImages] = useState([])
  const [errors, setErrors] = useState([])

  const handleFiles = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  const handleProcessed = (processedImage) => {
    setProcessedImages(prev => [...prev, processedImage])
    // Remove from the processing list
    setFiles(prev => prev.filter(file => file.name !== processedImage.originalName))
  }

  const handleError = (errorMessage, file) => {
    setErrors(prev => [...prev, { message: errorMessage, file: file?.name }])
    // Remove from the processing list if there was a file
    if (file) {
      setFiles(prev => prev.filter(f => f.name !== file.name))
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Image Outpainting App</h1>
      
      {/* Drag & Drop Area */}
      <DragDrop onFilesDrop={handleFiles} />
      
      {/* Processing Files */}
      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Processing Files</h2>
          <div className="space-y-4">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="p-4 border rounded">
                <ImageProcessor 
                  file={file} 
                  onProcessed={handleProcessed}
                  onError={(message) => handleError(message, file)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Processed Images Gallery */}
      {processedImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Processed Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedImages.map((image) => (
              <div key={image.id} className="border rounded overflow-hidden">
                <img 
                  src={image.framePath} 
                  alt={image.originalName}
                  className="w-full h-auto"
                />
                <div className="p-3">
                  <p className="text-sm">{image.originalName}</p>
                  <p className="text-xs text-gray-500">
                    Status: {image.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Errors</h2>
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                <p className="text-red-700">
                  {error.file ? `Error processing ${error.file}: ` : ''}
                  {error.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}