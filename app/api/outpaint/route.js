// app/api/outpaint/route.js
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import fs from 'fs/promises';
import FormData from 'form-data';
import fetch from 'node-fetch';

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
    
    // Get the image path
    const imagePath = path.join(process.cwd(), 'public', 'outpaints', `${imageId}-frame.png`);
    
    // Read the image file
    const imageBuffer = await fs.readFile(imagePath);
    
    // Create form data for the API request
    const apiFormData = new FormData();
    apiFormData.append('image', imageBuffer, { filename: `${imageId}-frame.png` });
    
    // Add outpaint directions
    for (const [direction, value] of Object.entries(outpaintDirections)) {
      if (value > 0) {
        apiFormData.append(direction, value.toString());
      }
    }
    
    // Add optional parameters
    if (prompt) {
      apiFormData.append('prompt', prompt);
    }
    
    apiFormData.append('output_format', 'webp');  // Since you're using webp
    
    // Make the API call to Stability AI
    const response = await fetch('https://api.stability.ai/v2beta/stable-image/edit/outpaint', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Accept': 'application/json',
        ...apiFormData.getHeaders()
      },
      body: apiFormData
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