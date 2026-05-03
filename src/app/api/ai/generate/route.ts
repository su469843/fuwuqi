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

    let channel;
    let apiKey = user.apiKey;

    // 优先使用用户自己的 key
    if (!apiKey) {
      channel = await prisma.aPIChannel.findFirst({
        where: { enabled: true },
        orderBy: { priority: "desc" },
      });
      if (!channel) {
        return NextResponse.json(
          { error: "No channel configured. Please add your own API key." },
          { status: 400 }
        );
      }
      apiKey = channel.apiKey;
    } else {
      channel = {
        id: "user-key",
        type: "CUSTOM",
        baseUrl: "https://api.openai.com",
        models: [{ name: modelId || "gpt-4" }],
      } as any;
    }

    const selectedModel = modelId || (channel.models as any[])?.[0]?.name || "gpt-4";

    // 构建完整 prompt
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

    // 计费
    const cost = await calculateCost(selectedModel, channel.id, aiRes.inputTokens, aiRes.outputTokens);

    // 如果用户用自定义 key 则不计费
    if (user.apiKey !== null) {
      await recordUsage({
        userId: payload.userId,
        modelId: selectedModel,
        channelId: channel.id,
        inputTokens: aiRes.inputTokens,
        outputTokens: aiRes.outputTokens,
        cost: 0,
        novelId,
        chapterId,
      });
    } else {
      await deductBalance(payload.userId, cost);
      await recordUsage({
        userId: payload.userId,
        modelId: selectedModel,
        channelId: channel.id,
        inputTokens: aiRes.inputTokens,
        outputTokens: aiRes.outputTokens,
        cost,
        novelId,
        chapterId,
      });
    }

    return NextResponse.json({
      text: aiRes.text,
      inputTokens: aiRes.inputTokens,
      outputTokens: aiRes.outputTokens,
      cost: user.apiKey ? 0 : cost,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    if (err.message === "Insufficient balance") {
      return NextResponse.json({ error: "余额不足，请充值" }, { status: 402 });
    }
    return NextResponse.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
