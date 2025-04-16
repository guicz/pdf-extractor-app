import { NextRequest } from 'next/server';
import { Readable } from 'stream';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { content, prompt, model } = await req.json();

  if (!content || !prompt || !model) {
    return new Response('Missing required fields', { status: 400 });
  }

  if (model === 'claude-3-7-sonnet-20250219') {
    // Anthropic streaming
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return new Response('Anthropic API key not configured', { status: 500 });
    const client = new Anthropic({ apiKey });
    const stream = await client.messages.stream({
      messages: [{ role: 'user', content: `${prompt}\n\n${content}` }],
      model,
      max_tokens: 8192,
    });
    const encoder = new TextEncoder();
    const readable = new Readable({
      read() {},
    });
    stream.on('text', (text: string) => {
      readable.push(encoder.encode(`data: ${text}\n\n`));
    });
    stream.on('end', () => {
      readable.push(null);
    });
    stream.on('error', (err: any) => {
      readable.destroy(err);
    });
    return new Response(readable as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } else if (model === 'o3-mini') {
    // OpenAI streaming
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new Response('OpenAI API key not configured', { status: 500 });
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content },
      ],
      stream: true,
    });
    const encoder = new TextEncoder();
    const readable = new Readable({
      read() {},
    });
    (async () => {
      for await (const event of response) {
        const delta = event.choices?.[0]?.delta?.content;
        if (delta) {
          readable.push(encoder.encode(`data: ${delta}\n\n`));
        }
      }
      readable.push(null);
    })();
    return new Response(readable as any, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } else {
    return new Response('Modelo não suportado para streaming', { status: 400 });
  }
}
