import { NextRequest, NextResponse } from "next/server";

// 重定向到 /api/admin/channels
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const newUrl = new URL('/api/admin/channels', url.origin);
  
  // 复制查询参数
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const newUrl = new URL('/api/admin/channels', url.origin);
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const newUrl = new URL('/api/admin/channels', url.origin);
  
  // 复制查询参数
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const newUrl = new URL('/api/admin/channels', url.origin);
  
  // 复制查询参数
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function PATCH(req: NextRequest) {
  const url = new URL(req.url);
  const newUrl = new URL('/api/admin/channels', url.origin);
  
  // 复制查询参数
  url.searchParams.forEach((value, key) => {
    newUrl.searchParams.set(key, value);
  });
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}