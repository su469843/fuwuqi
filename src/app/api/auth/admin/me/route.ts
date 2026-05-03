import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getBearerToken } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  adminCode: z.string().min(1),
});

export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const body = await req.json();
    const { adminCode } = schema.parse(body);

    const expectedCode = process.env.ADMIN_CODE;
    if (adminCode !== expectedCode) {
      return NextResponse.json({ error: "Invalid admin code" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: payload.userId },
      data: { role: "ADMIN" },
    });

    return NextResponse.json({ message: "Now admin" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
