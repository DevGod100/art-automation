'use client'

import { useState } from 'react'
import DragDrop from './DragDrop'
import Gallery from './Gallery'

export default function OutpaintingApp() {
  const [processingImages, setProcessingImages] = useState([])
  const [completedImages, setCompletedImages] = useState([])
  
  const handleFilesDrop = (files) => {
    // Create new image objects for processing
    const newImages = Array.from(files).map(file => ({
      id: `${file.name}-${Date.now()}`,  // Unique ID
      name: file.name,
      file: file,
      status: 'Queued',
      progress: 0,
      previewUrl: URL.createObjectURL(file)
    }))
    
    // Add to processing queue
    setProcessingImages(prev => [...newImages, ...prev])
    
    // Simulate processing (in a real app, you'd use ImageProcessor)
    newImages.forEach(image => {
      // Simulate a delay before marking as complete
      setTimeout(() => {
        // Remove from processing
        setProcessingImages(prev => 
          prev.filter(img => img.id !== image.id)
        )
        
        // Add to completed with the same preview URL for testing
        setCompletedImages(prev => [
          {
            id: image.id,
            name: image.name,
            resultUrl: image.previewUrl
          },
          ...prev
        ])
      }, 3000) // 3 second delay for testing
    })
  }
  
  return (
    <div className="grid grid-cols-2 min-h-screen">
      {/* Left side: Drag and drop area */}
      <div className="border-r border-gray-300 p-4">
        <DragDrop onFilesDrop={handleFilesDrop} />
      </div>
      
      {/* Right side: Gallery panel */}
      <div className="overflow-y-auto p-4">
        <h2 className="text-xl font-semibold mb-4">Results Gallery</h2>
        <Gallery 
          processingImages={processingImages}
          completedImages={completedImages}
        />
      </div>
    </div>
  )
}