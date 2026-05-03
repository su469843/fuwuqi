export interface AIRequest {
  prompt: string;
  model: string;
  baseUrl: string;
  apiKey: string;
  channelType: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
}

export async function callAI(req: AIRequest): Promise<AIResponse> {
  const { prompt, model, baseUrl, apiKey, channelType, maxTokens = 4096, temperature = 0.7 } = req;

  let url: string;
  let body: unknown;

  if (channelType === "OPENAI" || channelType === "CUSTOM") {
    url = `${baseUrl}/chat/completions`;
    body = {
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    };
  } else if (channelType === "CLAUDE") {
    url = `${baseUrl}/v1/messages`;
    body = {
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    };
  } else {
    url = `${baseUrl}/v1/chat/completions`;
    body = {
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature,
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (channelType === "CLAUDE") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI API error (${res.status}): ${errText}`);
  }

  const data = await res.json();

  if (channelType === "CLAUDE") {
    return {
      text: data.content?.[0]?.text || "",
      inputTokens: data.usage?.input_tokens || 0,
      outputTokens: data.usage?.output_tokens || 0,
    };
  }

  return {
    text: data.choices?.[0]?.message?.content || "",
    inputTokens: data.usage?.prompt_tokens || 0,
    outputTokens: data.usage?.completion_tokens || 0,
  };
}
