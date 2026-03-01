import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Anthropic API key not configured' },
      { status: 500 },
    );
  }

  try {
    const { system, messages } = await req.json();

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Anthropic API error:', response.status, errorBody);
      let detail = '';
      try {
        const parsed = JSON.parse(errorBody);
        detail = parsed?.error?.message || errorBody;
      } catch {
        detail = errorBody;
      }
      return NextResponse.json(
        { error: detail || `Anthropic API error: ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? '';
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 },
    );
  }
}
