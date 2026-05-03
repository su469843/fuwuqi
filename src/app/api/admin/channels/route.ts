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
  if (!payload || payload.role !== "ADMIN") {
    return null;
  }
  return payload;
}

const channelSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["OPENAI", "CLAUDE", "ZHIPU", "WENXIN", "TONGYI", "CUSTOM"]),
  baseUrl: z.string().url(),
  apiKey: z.string().min(1),
  models: z.array(z.object({ name: z.string() })).default([]),
  priority: z.number().default(0),
});

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const channels = await prisma.aPIChannel.findMany({
    include: { pricing: true },
    orderBy: { priority: "desc" },
  });
  return NextResponse.json(channels);
}

export async function POST(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const data = channelSchema.parse(body);
    const channel = await prisma.aPIChannel.create({ data });
    return NextResponse.json(channel, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const body = await req.json();
    const data = channelSchema.partial().parse(body);
    const channel = await prisma.aPIChannel.update({ where: { id }, data });
    return NextResponse.json(channel);
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

  await prisma.aPIChannel.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
