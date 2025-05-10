'use client'
import Image from 'next/image'

export default function Gallery({ images }) {
  if (!images.length) {
    return <div className="p-4 text-gray-500">No images yet.</div>
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {images.map(src => (
        <div key={src} className="relative w-full h-48 rounded overflow-hidden">
          <Image
            src={src}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  )
}
