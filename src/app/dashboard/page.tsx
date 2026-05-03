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
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/auth/login");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
  }, [router]);

  async function handleBecomeAdmin() {
    if (!user) return;
    setLoading(true);
    setAdminMsg("");
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
    setLoading(false);
    if (res.ok) {
      setAdminMsg("已成为管理员！");
      const updated = { ...user, role: "ADMIN" as const };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    } else {
      setAdminMsg(data.error || "授权失败");
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center bg-gray-50">加载中...</div>;

  const balance = Number(user.balance).toFixed(4);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                小说编写平台
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 用户信息卡片 */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white mb-8">
          <h2 className="text-2xl font-bold mb-4">👤 用户信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-blue-100 text-sm mb-1">邮箱</p>
              <p className="text-lg font-semibold">{user.email}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">角色</p>
              <p className="text-lg font-semibold">
                {user.role === "ADMIN" ? "管理员" : "普通用户"}
              </p>
            </div>
            <div>
              <p className="text-blue-100 text-sm mb-1">账户余额</p>
              <p className="text-3xl font-bold">¥{balance}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 成为管理员 */}
          {user.role !== "ADMIN" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🔑 成为管理员</h2>
              <p className="text-gray-600 mb-4">输入管理员授权码以获得管理权限</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="输入管理员授权码"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleBecomeAdmin}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                >
                  {loading ? "授权中..." : "授权"}
                </button>
              </div>
              {adminMsg && (
                <p className={`mt-3 text-sm ${adminMsg.includes("成功") ? "text-green-600" : "text-red-600"}`}>
                  {adminMsg}
                </p>
              )}
            </div>
          )}

          {/* 管理后台 */}
          {user.role === "ADMIN" && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">🛠️ 管理后台</h2>
              <p className="text-gray-600 mb-4">管理系统 API 渠道和定价</p>
              <div className="flex flex-col space-y-3">
                <Link
                  href="/dashboard/channels"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all text-center"
                >
                  渠道管理
                </Link>
                <Link
                  href="/dashboard/pricing"
                  className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 transition-all text-center"
                >
                  定价管理
                </Link>
              </div>
            </div>
          )}

          {/* 我的小说 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📚 我的小说</h2>
            <p className="text-gray-600 mb-4">查看和管理你的小说作品</p>
            <Link
              href="/novels"
              className="block px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all text-center"
            >
              查看 / 创建小说
            </Link>
          </div>

          {/* 快速操作 */}
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">✨ 快速开始</h2>
            <div className="space-y-3">
              <Link
                href="/novels"
                className="block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors text-center font-semibold"
              >
                📝 新建小说
              </Link>
              <Link
                href="/dashboard"
                className="block px-6 py-3 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors text-center font-semibold"
              >
                💰 查看余额
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
