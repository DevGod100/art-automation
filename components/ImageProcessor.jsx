'use client'

import { useEffect } from 'react'

export default function ImageProcessor({ images = [], onUpdateImage, onComplete }) {
  useEffect(() => {
    const processNextImage = async () => {
      // Find the first image that needs processing
      const imageToProcess = images.find(img => !img.processing && !img.completed)
      
      if (!imageToProcess) return
      
      try {
        // Mark as processing and update progress
        onUpdateImage(imageToProcess.id, { 
          processing: true,
          progress: 10 
        })
        
        // 1. First, fit the image into a 1920x1080 frame without cropping
        const paddedCanvas = await fitImageToFrame(imageToProcess.file)
        
        // Update progress
        onUpdateImage(imageToProcess.id, { progress: 40 })
        
        // 2. In a real app, this is where you'd send to Stable Diffusion API
        // For now, we'll just simulate a delay and use the padded image
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update progress
        onUpdateImage(imageToProcess.id, { progress: 90 })
        
        // Convert canvas to blob for saving
        const processedBlob = await canvasToBlob(paddedCanvas)
        
        // 3. In a real app, save to server and get URL
        // For now, create a local object URL
        const resultUrl = URL.createObjectURL(processedBlob)
        
        // Mark as completed
        onUpdateImage(imageToProcess.id, { 
          processing: false,
          completed: true,
          progress: 100,
          resultUrl
        })
        
        // Notify parent that processing is complete
        onComplete(imageToProcess.id, { resultUrl })
        
      } catch (error) {
        console.error('Error processing image:', error)
        onUpdateImage(imageToProcess.id, { 
          processing: false,
          error: error.message 
        })
      }
    }
    
    // If there are unprocessed images, start processing
    if (images.some(img => !img.processing && !img.completed)) {
      processNextImage()
    }
  }, [images, onUpdateImage, onComplete])
  
  return null // This component doesn't render anything
}

// Helper function to fit an image into a 1920x1080 frame without cropping
async function fitImageToFrame(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      // Create canvas with 1920x1080 dimensions (16:9 aspect ratio)
      const canvas = document.createElement('canvas')
      canvas.width = 1920
      canvas.height = 1080
      const ctx = canvas.getContext('2d')
      
      // Fill with a neutral background color
      ctx.fillStyle = '#f0f0f0'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Calculate scaling to fit image without cropping
      const imgRatio = img.width / img.height
      const canvasRatio = canvas.width / canvas.height
      
      let drawWidth, drawHeight, x, y
      
      if (imgRatio > canvasRatio) {
        // Image is wider than canvas ratio - scale by width
        drawWidth = canvas.width
        drawHeight = canvas.width / imgRatio
        x = 0
        y = (canvas.height - drawHeight) / 2
      } else {
        // Image is taller than canvas ratio - scale by height
        drawHeight = canvas.height
        drawWidth = canvas.height * imgRatio
        x = (canvas.width - drawWidth) / 2
        y = 0
      }
      
      // Draw the image centered in the canvas
      ctx.drawImage(img, x, y, drawWidth, drawHeight)
      
      resolve(canvas)
    }
    
    img.onerror = () => reject(new Error('Failed to load image'))
    
    img.src = URL.createObjectURL(file)
  })
}

// Helper function to convert a canvas to a Blob
function canvasToBlob(canvas) {
  return new Promise(resolve => {
    canvas.toBlob(blob => {
      resolve(blob)
    }, 'image/png')
  })
}