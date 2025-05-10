'use client'
import Image from 'next/image'

export default function Gallery({ items }) {
  if (!items.length) {
    return <div className="p-4 text-gray-500">No images yet.</div>
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4">
      {items.map(({ id, url, loading }) => (
        <div
          key={id}
          className="relative w-full h-48 bg-gray-100 rounded overflow-hidden
                     flex items-center justify-center"
        >
          {loading ? (
            <div className="w-12 h-12 border-4 border-gray-200
                            border-t-blue-500 rounded-full animate-spin" />
          ) : (
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
            />
          )}
        </div>
      ))}
    </div>
  )
}
