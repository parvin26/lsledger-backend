import { readFileSync } from 'fs'
import { join } from 'path'

const AI_API_KEY = process.env.AI_API_KEY
const AI_MODEL_NAME = process.env.AI_MODEL_NAME || 'gpt-4'

if (!AI_API_KEY) {
  throw new Error('AI_API_KEY is not set')
}

interface AIRequest {
  prompt: string
  systemPrompt?: string
  temperature?: number
}

interface AIResponse {
  content: string
}

async function callAIProvider(request: AIRequest): Promise<string> {
  // Support OpenAI-compatible API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_API_KEY}`
    },
    body: JSON.stringify({
      model: AI_MODEL_NAME,
      messages: [
        ...(request.systemPrompt ? [{ role: 'system', content: request.systemPrompt }] : []),
        { role: 'user', content: request.prompt }
      ],
      temperature: request.temperature ?? 0.7,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`AI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

export async function callAIWithStrictJSON<T>(
  promptFile: string,
  userPrompt: string,
  schema?: unknown
): Promise<T> {
  const promptPath = join(process.cwd(), 'prompts', promptFile)
  const systemPrompt = readFileSync(promptPath, 'utf-8')
  
  // Use prompt verbatim - no additional instructions
  const fullPrompt = userPrompt

  try {
    const response = await callAIProvider({
      prompt: fullPrompt,
      systemPrompt,
      temperature: 0.3
    })

    // Extract JSON from response (handle markdown code blocks)
    let jsonString = response.trim()
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '')
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '')
    }

    const parsed = JSON.parse(jsonString) as T
    return parsed
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`AI returned invalid JSON: ${error.message}`)
    }
    throw error
  }
}
