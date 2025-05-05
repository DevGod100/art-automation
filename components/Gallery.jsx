'use client'

import { useState } from 'react'

export default function Gallery({ processingImages = [], completedImages = [] }) {
  return (
    <div className="space-y-6">
      {/* Processing Images Section */}
      {processingImages.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Processing</h3>
          <div className="space-y-4">
            {processingImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{image.name}</span>
                  <span className="text-sm text-gray-500">{image.status}</span>
                </div>
                
                {image.previewUrl && (
                  <div className="mb-3">
                    <img 
                      src={image.previewUrl} 
                      alt="Preview" 
                      className="h-40 object-contain mx-auto"
                    />
                  </div>
                )}
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${image.progress || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Completed Images Section */}
      {completedImages.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Completed</h3>
          <div className="grid grid-cols-1 gap-4">
            {completedImages.map((image) => (
              <div key={image.id} className="border rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{image.name}</span>
                  <a 
                    href={image.resultUrl} 
                    download
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Download
                  </a>
                </div>
                <img 
                  src={image.resultUrl} 
                  alt={image.name} 
                  className="w-full rounded"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {processingImages.length === 0 && completedImages.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-500">
            No images yet. Drag and drop images to start processing.
          </p>
        </div>
      )}
    </div>
  )
}