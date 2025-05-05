'use client'

import { useState, useCallback } from 'react'

export default function ImageProcessor({ file, onProcessed, onError }) {
  const [progress, setProgress] = useState(0)

  const processImage = useCallback(async () => {
    if (!file) return

    try {
      setProgress(10)
      
      // Create a new image element from the file
      const image = new Image()
      image.src = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        image.onload = resolve
        image.onerror = reject
      })
      
      setProgress(30)
      
      // Create canvas with target dimensions (1920x1080)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = 1920
      canvas.height = 1080
      
      // Calculate scaling and positioning
      const targetRatio = canvas.width / canvas.height
      const imageRatio = image.width / image.height
      
      let drawWidth, drawHeight, xOffset, yOffset
      
      if (imageRatio > targetRatio) {
        // Image is wider proportionally than target
        drawHeight = canvas.height
        drawWidth = image.width * (drawHeight / image.height)
        xOffset = (canvas.width - drawWidth) / 2
        yOffset = 0
      } else {
        // Image is taller proportionally than target
        drawWidth = canvas.width
        drawHeight = image.height * (drawWidth / image.width)
        xOffset = 0
        yOffset = (canvas.height - drawHeight) / 2
      }
      
      // Fill canvas with a light gray background
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw the image centered
      ctx.drawImage(image, xOffset, yOffset, drawWidth, drawHeight)
      
      setProgress(60)
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
      
      // Prepare form data for API submission
      const formData = new FormData()
      formData.append('image', blob, file.name)
      formData.append('originalName', file.name)
      
      setProgress(80)
      
      // Send to our API endpoint for saving and further processing
      const response = await fetch('/api/processImage', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }
      
      const result = await response.json()
      setProgress(100)
      
      // Call the callback with the processed image data
      onProcessed({
        id: result.id,
        originalName: file.name,
        framePath: result.framePath,
        originalDimensions: { width: image.width, height: image.height },
        status: 'ready_for_outpainting',
        progress: 100
      })
      
      // Clean up
      URL.revokeObjectURL(image.src)
      
    } catch (error) {
      console.error('Error processing image:', error)
      onError(error.message)
    }
  }, [file, onProcessed, onError])

  // Start processing when component mounts
  useState(() => {
    if (file) {
      processImage()
    }
  }, [file, processImage])

  return (
    <div className="relative w-full">
      <div className="h-2 w-full bg-gray-200 rounded">
        <div 
          className="h-full bg-blue-500 rounded transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="text-sm text-gray-600 mt-1">
        Processing {file?.name}: {progress}%
      </div>
    </div>
  )
}