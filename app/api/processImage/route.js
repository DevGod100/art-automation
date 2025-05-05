// app/api/processImage/route.js
import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid' // You'll need to add this dependency

export async function POST(request) {
  try {
    const formData = await request.formData()
    const image = formData.get('image')
    const originalName = formData.get('originalName')
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }
    
    // Create a unique ID for this image
    const id = uuidv4()
    
    // Create directories if they don't exist
    const uploadDir = path.join(process.cwd(), 'public', 'outpaints')
    await mkdir(uploadDir, { recursive: true })
    
    // Process the image (save the framed version)
    const buffer = Buffer.from(await image.arrayBuffer())
    const framePath = path.join('outpaints', `${id}-frame.png`)
    const fullFramePath = path.join(process.cwd(), 'public', framePath)
    
    // Save the framed image
    await writeFile(fullFramePath, buffer)
    
    // Return data to the client
    return NextResponse.json({
      id,
      framePath: '/' + framePath, // Path relative to public directory for client access
      originalName,
      message: 'Image processed and saved successfully'
    })
    
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Error processing image: ' + error.message },
      { status: 500 }
    )
  }
}