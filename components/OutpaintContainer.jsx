// app/components/OutpaintContainer.jsx
import DragDrop from './DragDrop'
import Gallery  from './Gallery'
import fs       from 'fs/promises'
import path     from 'path'

export default async function OutpaintContainer() {
  // load & sort your outpainted images
  const dir   = path.join(process.cwd(), 'public', 'outpainted')
  let images  = []

  try {
    const names = await fs.readdir(dir)
    const stats = await Promise.all(
      names.map(async name => ({
        name,
        mtime: (await fs.stat(path.join(dir, name))).mtimeMs
      }))
    )
    images = stats
      .sort((a, b) => b.mtime - a.mtime)
      .map(f => `/outpainted/${f.name}`)
  } catch {
    // no images yet
  }

  return (
    <div className="flex h-screen">
      {/* Left 2/3: Drag & Drop */}
      <div className="w-2/3">
        <DragDrop />
      </div>
      {/* Right 1/3: Scrollable Gallery */}
      <div className="w-1/3 border-l">
        <Gallery images={images} />
      </div>
    </div>
  )
}
