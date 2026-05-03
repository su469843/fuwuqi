import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getBearerToken } from "@/lib/auth";
import { callAI } from "@/lib/ai-gateway";
import { calculateCost, deductBalance, recordUsage } from "@/lib/billing";
import { z } from "zod";

const schema = z.object({
  novelId: z.string(),
  chapterId: z.string().optional(),
  prompt: z.string().min(1),
  modelId: z.string().optional(),
});

function auth(req: Request) {
  const token = getBearerToken(req);
  return verifyToken(token || "");
}

export async function POST(req: Request) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { novelId, chapterId, prompt, modelId } = schema.parse(body);

    const novel = await prisma.novel.findUnique({ where: { id: novelId } });
    if (!novel || novel.userId !== payload.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 500 });

    let channel: { id: string; type: string; baseUrl: string; apiKey: string; models: ChannelModel[] };
    let apiKey = user.apiKey;

    if (!apiKey) {
      const dbChannel = await prisma.aPIChannel.findFirst({
        where: { enabled: true },
        orderBy: { priority: "desc" },
      });
      if (!dbChannel) {
        return NextResponse.json(
          { error: "No channel configured. Please add your own API key." },
          { status: 400 }
        );
      }
      channel = {
        id: "user-key",
        type: "CUSTOM",
        baseUrl: "https://api.openai.com",
        apiKey: user.apiKey || "",
        models: [{ name: modelId || "gpt-4" }],
      };
      apiKey = channel.apiKey;
    } else {
      channel = {
        id: "user-key",
        type: "CUSTOM",
        baseUrl: "https://api.openai.com",
        apiKey: user.apiKey || "",
        models: [{ name: modelId || "gpt-4" }],
      };
    }

    const selectedModel = modelId || channel.models?.[0]?.name || "gpt-4";

    let fullPrompt = prompt;
    if (novel.genre === "BL") fullPrompt = `[攻受文] ${fullPrompt}`;
    else if (novel.genre === "BG") fullPrompt = `[男女文] ${fullPrompt}`;
    if (novel.maleLeadName) fullPrompt += `\n男主: ${novel.maleLeadName}（${novel.maleLeadTraits || ""}）`;
    if (novel.femaleLeadName) fullPrompt += `\n女主: ${novel.femaleLeadName}（${novel.femaleLeadTraits || ""}）`;

    const aiRes = await callAI({
      prompt: fullPrompt,
      model: selectedModel,
      baseUrl: channel.baseUrl,
      apiKey,
      channelType: channel.type,
    });

    const cost = await calculateCost(selectedModel, channel.id, aiRes.inputTokens, aiRes.outputTokens);

    if (!user.apiKey) {
      await deductBalance(payload.userId, cost);
    }

    await recordUsage({
      userId: payload.userId,
      modelId: selectedModel,
      channelId: channel.id,
      inputTokens: aiRes.inputTokens,
      outputTokens: aiRes.outputTokens,
      cost: user.apiKey ? 0 : cost,
      novelId,
      chapterId,
    });

    return NextResponse.json({
      text: aiRes.text,
      inputTokens: aiRes.inputTokens,
      outputTokens: aiRes.outputTokens,
      cost: user.apiKey ? 0 : cost,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    if (err instanceof Error && err.message === "Insufficient balance") {
      return NextResponse.json({ error: "余额不足，请充值" }, { status: 402 });
    }
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

interface ChannelModel {
  name: string;
}
