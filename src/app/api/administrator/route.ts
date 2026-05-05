import { NextResponse } from "next/server";

// 重定向到 /api/admin 路由
export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/administrator', '/api/admin');
  const newUrl = new URL(path, url.origin);
  
  // 转发请求到 /api/admin
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/administrator', '/api/admin');
  const newUrl = new URL(path, url.origin);
  
  // 转发请求到 /api/admin
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function PUT(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/administrator', '/api/admin');
  const newUrl = new URL(path, url.origin);
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/administrator', '/api/admin');
  const newUrl = new URL(path, url.origin);
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}

export async function PATCH(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/administrator', '/api/admin');
  const newUrl = new URL(path, url.origin);
  
  const response = await fetch(newUrl.toString(), {
    headers: req.headers,
    method: req.method,
    body: req.body,
  });
  
  return response;
}