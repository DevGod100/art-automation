// components/Gallery.jsx
'use client'

import { useState } from 'react';

export default function Gallery({ processedImages, onOutpaint }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [isOutpainting, setIsOutpainting] = useState(false);
  const [directions, setDirections] = useState({
    left: 0,
    right: 0,
    up: 0,
    down: 0
  });
  
  const handleDirectionChange = (direction, value) => {
    setDirections(prev => ({
      ...prev,
      [direction]: Math.min(Math.max(0, parseInt(value) || 0), 2000)
    }));
  };
  
  const isValidOutpaint = () => {
    return Object.values(directions).some(val => val > 0);
  };
  
  const handleOutpaint = async (image) => {
    if (!isValidOutpaint()) {
      alert('Please specify at least one outpainting direction');
      return;
    }
    
    setIsOutpainting(true);
    
    try {
      const formData = new FormData();
      formData.append('imageId', image.id);
      formData.append('prompt', prompt);
      
      // Add directions
      Object.entries(directions).forEach(([direction, value]) => {
        formData.append(direction, value);
      });
      
      const response = await fetch('/api/outpaint', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const result = await response.json();
      
      // Call the parent component's handler with the result
      onOutpaint({ 
        ...image, 
        outpaintedPath: result.outpaintedPath,
        status: 'outpainted'
      });
      
      // Reset state
      setSelectedImage(null);
      setPrompt('');
      setDirections({ left: 0, right: 0, up: 0, down: 0 });
      
    } catch (error) {
      console.error('Error during outpainting:', error);
      alert(`Error during outpainting: ${error.message}`);
    } finally {
      setIsOutpainting(false);
    }
  };
  
  if (processedImages.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Processed Images</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedImages.map((image) => (
          <div key={image.id} className="border rounded overflow-hidden">
            <div className="relative">
              <img 
                src={image.outpaintedPath || image.framePath} 
                alt={image.originalName}
                className="w-full h-auto"
              />
              
              {image.status === 'ready_for_outpainting' && (
                <button
                  onClick={() => setSelectedImage(image)}
                  className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Outpaint
                </button>
              )}
            </div>
            
            <div className="p-3">
              <p className="text-sm">{image.originalName}</p>
              <p className="text-xs text-gray-500">
                Status: {image.status.replace(/_/g, ' ')}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Outpainting Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h3 className="text-lg font-semibold mb-4">Outpaint Image</h3>
            
            <div className="mb-4">
              <img 
                src={selectedImage.framePath} 
                alt={selectedImage.originalName}
                className="w-full h-auto max-h-[400px] object-contain"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt (optional)
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how to extend this image..."
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Left (pixels)
                </label>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={directions.left}
                  onChange={(e) => handleDirectionChange('left', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Right (pixels)
                </label>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={directions.right}
                  onChange={(e) => handleDirectionChange('right', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Up (pixels)
                </label>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={directions.up}
                  onChange={(e) => handleDirectionChange('up', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Down (pixels)
                </label>
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={directions.down}
                  onChange={(e) => handleDirectionChange('down', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setSelectedImage(null)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition-colors"
                disabled={isOutpainting}
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleOutpaint(selectedImage)}
                className={`${
                  isValidOutpaint() 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'bg-gray-400 cursor-not-allowed'
                } text-white px-4 py-2 rounded transition-colors`}
                disabled={isOutpainting || !isValidOutpaint()}
              >
                {isOutpainting ? 'Processing...' : 'Start Outpainting'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}