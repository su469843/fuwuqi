import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getBearerToken } from "@/lib/auth";
import { z } from "zod";

function auth(req: Request) {
  const token = getBearerToken(req);
  return verifyToken(token || "");
}

async function requireAdmin(req: Request) {
  const payload = await auth(req);
  if (!payload || payload.role !== "ADMIN") return null;
  return payload;
}

const pricingSchema = z.object({
  channelId: z.string().min(1),
  modelId: z.string().min(1),
  inputPrice: z.number().min(0),
  outputPrice: z.number().min(0),
});

export async function GET() {
  const pricing = await prisma.modelPricing.findMany({
    include: { channel: true },
  });
  return NextResponse.json(pricing);
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const data = pricingSchema.parse(body);
    const pricing = await prisma.modelPricing.upsert({
      where: { channelId_modelId: { channelId: data.channelId, modelId: data.modelId } },
      create: data,
      update: data,
    });
    return NextResponse.json(pricing, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.modelPricing.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
