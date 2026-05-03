"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  role: string;
  balance: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [adminCode, setAdminCode] = useState("");
  const [adminMsg, setAdminMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.push("/auth/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, []);

  async function handleBecomeAdmin() {
    if (!user) return;
    const token = localStorage.getItem("token");
    const res = await fetch("/api/auth/admin/me", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ adminCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setAdminMsg("已成为管理员！");
      const updated = { ...user, role: "ADMIN" };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    } else {
      setAdminMsg(data.error || "失败");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) return <div className="p-8">加载中...</div>;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">仪表盘</h1>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">用户信息</h2>
        <p>邮箱：{user.email}</p>
        <p>角色：{user.role === "ADMIN" ? "管理员" : "普通用户"}</p>
        <p>余额：¥{Number(user.balance).toFixed(4)}</p>
        <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          退出登录
        </button>
      </div>

      {user.role !== "ADMIN" && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">成为管理员</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="输入管理员授权码"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button onClick={handleBecomeAdmin} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              授权
            </button>
          </div>
          {adminMsg && <p className="mt-2 text-sm text-gray-600">{adminMsg}</p>}
        </div>
      )}

      {user.role === "ADMIN" && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">管理后台</h2>
          <div className="flex gap-4">
            <Link href="/dashboard/channels" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              渠道管理
            </Link>
            <Link href="/dashboard/pricing" className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">
              定价管理
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-2">我的小说</h2>
        <Link href="/novels" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          查看 / 创建小说
        </Link>
      </div>
    </div>
  );
}
