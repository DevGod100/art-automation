// app/components/Gallery.jsx
'use client'

import Image from 'next/image'

export default function Gallery({ items }) {
  if (!items || items.length === 0) {
    return <div className="p-4 text-gray-500">No images yet.</div>
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {items.map(({ id, url, loading, prompt }) => (
        <div key={id} className="flex flex-col space-y-2">
          <div className="w-full relative h-32 md:h-48">
            {loading ? (
              <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <Image
                src={url}
                alt="Outpainted"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            )}
          </div>
          {!loading && prompt && (
            <p className="text-sm text-gray-300 italic">“{prompt}”</p>
          )}
        </div>
      ))}
    </div>
  )
}
