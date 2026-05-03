import { prisma } from "./prisma";

export async function calculateCost(
  modelId: string,
  channelId: string,
  inputTokens: number,
  outputTokens: number
): Promise<number> {
  const pricing = await prisma.modelPricing.findUnique({
    where: { channelId_modelId: { channelId, modelId } },
  });

  if (!pricing) {
    throw new Error(`No pricing found for model ${modelId} on channel ${channelId}`);
  }

  const inputCost = (Number(pricing.inputPrice) / 1_000_000) * inputTokens;
  const outputCost = (Number(pricing.outputPrice) / 1_000_000) * outputTokens;
  return inputCost + outputCost;
}

export async function deductBalance(userId: string, amount: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (Number(user.balance) < amount) {
    throw new Error("Insufficient balance");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { balance: { decrement: amount } },
  });
}

export async function recordUsage(data: {
  userId: string;
  modelId: string;
  channelId: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  novelId?: string;
  chapterId?: string;
}) {
  return prisma.usageRecord.create({
    data: {
      userId: data.userId,
      modelId: data.modelId,
      channelId: data.channelId,
      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      cost: data.cost,
      novelId: data.novelId,
      chapterId: data.chapterId,
    },
  });
}
