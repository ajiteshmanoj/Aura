const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-4o';

export async function callAI(systemPrompt, userMessage, options = {}) {
  if (!OPENAI_API_KEY) return options.fallback || null;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: options.messages || [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: options.maxTokens || 1024,
        temperature: options.temperature || 0.7,
      }),
    });

    const data = await response.json();
    if (data.error) {
      console.error('OpenAI error:', data.error);
      return options.fallback || null;
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI call failed:', error);
    return options.fallback || null;
  }
}

export function hasAIKey() {
  return !!OPENAI_API_KEY;
}
