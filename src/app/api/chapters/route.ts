import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getBearerToken } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  novelId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().optional(),
});

function auth(req: Request) {
  const token = getBearerToken(req);
  return verifyToken(token || "");
}

export async function GET(req: Request) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const novelId = url.searchParams.get("novelId");
  if (!novelId) return NextResponse.json({ error: "Missing novelId" }, { status: 400 });

  const novel = await prisma.novel.findUnique({ where: { id: novelId } });
  if (!novel || novel.userId !== payload.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const chapters = await prisma.chapter.findMany({
    where: { novelId },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(chapters);
}

export async function POST(req: Request) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { novelId, title, content } = createSchema.parse(body);

    const novel = await prisma.novel.findUnique({ where: { id: novelId } });
    if (!novel || novel.userId !== payload.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const maxOrder = await prisma.chapter.aggregate({
      where: { novelId },
      _max: { order: true },
    });
    const order = (maxOrder._max?.order ?? 0) + 1;

    const chapter = await prisma.chapter.create({
      data: { novelId, title, content: content || "", order },
    });
    return NextResponse.json(chapter, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { novel: true },
  });
  if (!chapter || chapter.novel.userId !== payload.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = z.object({ title: z.string().optional(), content: z.string().optional() }).parse(body);
    const updated = await prisma.chapter.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
