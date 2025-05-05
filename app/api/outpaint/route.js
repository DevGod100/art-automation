// app/api/outpaint/route.js
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageId = formData.get('imageId');
    const prompt = formData.get('prompt') || '';
    const outpaintDirections = {
      left: parseInt(formData.get('left') || '0'),
      right: parseInt(formData.get('right') || '0'),
      up: parseInt(formData.get('up') || '0'),
      down: parseInt(formData.get('down') || '0'),
    };
    
    // Ensure at least one direction has a value
    if (Object.values(outpaintDirections).every(val => val === 0)) {
      return NextResponse.json(
        { error: 'At least one outpainting direction must be specified' },
        { status: 400 }
      );
    }
    
    // Get the image path and read the image file
    const imagePath = path.join(process.cwd(), 'public', 'outpaints', `${imageId}-frame.png`);
    const imageBuffer = await fs.readFile(imagePath);
    
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');
    
    // Prepare the request to Stability AI's outpainting endpoint
    const apiRequestBody = {
      image: `data:image/png;base64,${base64Image}`,
      prompt: prompt,
      outcrop: {
        left: outpaintDirections.left,
        right: outpaintDirections.right,
        top: outpaintDirections.up,
        bottom: outpaintDirections.down
      },
      parameters: {
        cfg_scale: 7,
        samples: 1,
        steps: 30
      }
    };
    
    // Make the API call to Stability AI
    const response = await fetch('https://api.stability.ai/v2beta/generation/image-to-image/outpaint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(apiRequestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability API error response:', errorText);
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(`Stability API error: ${errorData.message || 'Unknown error'}`);
      } catch (e) {
        throw new Error(`Stability API error: ${response.status} ${response.statusText}`);
      }
    }
    
    // Parse the response
    const resultData = await response.json();
    
    // Save the outpainted image
    const outpaintedBuffer = Buffer.from(resultData.artifacts[0].base64, 'base64');
    const outpaintedPath = path.join('outpaints', `${imageId}-outpainted.webp`);
    const fullOutpaintedPath = path.join(process.cwd(), 'public', outpaintedPath);
    
    await writeFile(fullOutpaintedPath, outpaintedBuffer);
    
    return NextResponse.json({
      id: imageId,
      outpaintedPath: '/' + outpaintedPath,
      message: 'Image outpainted and saved successfully'
    });
    
  } catch (error) {
    console.error('Error outpainting image:', error);
    return NextResponse.json(
      { error: 'Error outpainting image: ' + error.message },
      { status: 500 }
    );
  }
}