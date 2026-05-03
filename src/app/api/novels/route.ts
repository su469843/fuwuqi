import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getBearerToken } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  genre: z.enum(["BL", "BG", "OTHER"]).default("BG"),
  maleLeadName: z.string().optional(),
  maleLeadTraits: z.string().optional(),
  femaleLeadName: z.string().optional(),
  femaleLeadTraits: z.string().optional(),
});

function auth(req: Request) {
  const token = getBearerToken(req);
  return verifyToken(token || "");
}

export async function GET(req: Request) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const novels = await prisma.novel.findMany({
    where: { userId: payload.userId },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(novels);
}

export async function POST(req: Request) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { title, genre, maleLeadName, maleLeadTraits, femaleLeadName, femaleLeadTraits } =
      createSchema.parse(body);

    const novel = await prisma.novel.create({
      data: {
        title,
        genre,
        userId: payload.userId,
        maleLeadName,
        maleLeadTraits,
        femaleLeadName,
        femaleLeadTraits,
      },
    });
    return NextResponse.json(novel, { status: 201 });
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

  const novel = await prisma.novel.findUnique({ where: { id } });
  if (!novel || novel.userId !== payload.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = createSchema.partial().parse(body);
    const updated = await prisma.novel.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const payload = await auth(req);
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const novel = await prisma.novel.findUnique({ where: { id } });
  if (!novel || novel.userId !== payload.userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.novel.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
