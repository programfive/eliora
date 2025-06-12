
// app/api/text-to-speech/route.js
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

 
    const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    if (cleanText.length > 4096) {
      return NextResponse.json({ error: 'Text too long' }, { status: 400 });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // o 'tts-1-hd' para mejor calidad
        input: cleanText,
        voice: 'nova', // Opciones: alloy, echo, fable, onyx, nova, shimmer
        response_format: 'mp3',
        speed: 1.0, // 0.25 a 4.0
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI TTS API error:', errorData);
      return NextResponse.json({ error: 'Error generating speech' }, { status: 500 });
    }

    // Retornar el audio como stream
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error('Error in text-to-speech:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}