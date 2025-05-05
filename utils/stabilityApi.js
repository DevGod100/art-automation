// utils/stabilityApi.js
export async function checkApiConnection() {
    const response = await fetch('https://api.stability.ai/v1/engines/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.STABILITY_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API connection failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  export async function outpaintImage(imageBase64, prompt, directions) {
    const apiRequestBody = {
      image: `data:image/png;base64,${imageBase64}`,
      prompt: prompt,
      outcrop: {
        left: directions.left || 0,
        right: directions.right || 0,
        top: directions.up || 0,
        bottom: directions.down || 0
      },
      parameters: {
        cfg_scale: 7,
        samples: 1,
        steps: 30
      }
    };
    
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
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || 'Unknown error');
      } catch (e) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }
    
    return await response.json();
  }