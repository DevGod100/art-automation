// app/components/OutpaintContainer.jsx
import OutpaintingUI from './OutpaintingUI'
import fs  from 'fs/promises'
import path from 'path'

export default async function OutpaintContainer() {
  const dir = path.join(process.cwd(), 'public', 'outpainted')
  let initialImages = []

  try {
    const names = await fs.readdir(dir)
    const stats = await Promise.all(
      names.map(async name => ({
        name,
        mtime: (await fs.stat(path.join(dir, name))).mtimeMs
      }))
    )
    initialImages = stats
      .sort((a,b) => b.mtime - a.mtime)
      .map(f => `/outpainted/${f.name}`)
  } catch {
    // empty or missing folder — fine
  }

  return <OutpaintingUI initialImages={initialImages} />
}
