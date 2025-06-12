// app/api/speech-to-text/route.js
import {  NextResponse } from 'next/server';


export const runtime = 'edge';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') ;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const openaiFormData = new FormData();
    openaiFormData.append('file', audioFile);
    openaiFormData.append('model', 'whisper-1');
    openaiFormData.append('language', 'es'); // Español
    openaiFormData.append('response_format', 'json');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({ error: 'Error transcribing audio' }, { status: 500 });
    }

    const transcription = await response.json();
    
    return NextResponse.json({ 
      text: transcription.text || '' 
    });

  } catch (error) {
    console.error('Error in speech-to-text:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}