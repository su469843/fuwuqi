import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, getBearerToken } from "@/lib/auth";
import { z } from "zod";

const apiKeySchema = z.object({
  apiKey: z.string().min(1, "API密钥不能为空"),
});

// 获取用户的API密钥
export async function GET(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "无效令牌" }, { status: 401 });

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { apiKey: true, email: true }
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ 
      apiKey: user.apiKey,
      maskedApiKey: user.apiKey ? `${user.apiKey.substring(0, 8)}...${user.apiKey.substring(user.apiKey.length - 4)}` : null
    });
  } catch (error) {
    console.error("获取API密钥错误:", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}

// 设置或更新用户的API密钥
export async function POST(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "无效令牌" }, { status: 401 });

  try {
    const body = await req.json();
    const { apiKey } = apiKeySchema.parse(body);

    // 更新用户的API密钥
    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: { apiKey },
      select: { apiKey: true, email: true }
    });

    return NextResponse.json({ 
      message: "API密钥已更新",
      maskedApiKey: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "无效的请求数据" }, { status: 400 });
    }
    console.error("更新API密钥错误:", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}

// 删除用户的API密钥
export async function DELETE(req: Request) {
  const token = getBearerToken(req);
  if (!token) return NextResponse.json({ error: "未授权" }, { status: 401 });

  const payload = await verifyToken(token);
  if (!payload) return NextResponse.json({ error: "无效令牌" }, { status: 401 });

  try {
    await prisma.user.update({
      where: { id: payload.userId },
      data: { apiKey: null }
    });

    return NextResponse.json({ message: "API密钥已删除" });
  } catch (error) {
    console.error("删除API密钥错误:", error);
    return NextResponse.json({ error: "内部错误" }, { status: 500 });
  }
}