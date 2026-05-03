"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Novel {
  id: string;
  title: string;
  genre: string;
  createdAt: string;
}

export default function NovelsPage() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("BG");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const loadNovels = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/auth/login");
      return;
    }
    const res = await fetch("/api/novels", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setNovels(data);
    }
  }, [router]);

  useEffect(() => {
    loadNovels();
  }, [loadNovels, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/novels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, genre }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }
    setTitle("");
    loadNovels();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                小说编写平台
              </Link>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回仪表盘
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">📚 我的小说</h1>

        {/* 创建表单 */}
        <form onSubmit={handleCreate} className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">创建新小说</h2>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                小说标题
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入小说标题"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div className="md:w-48">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                类型
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BG">男女文</option>
                <option value="BL">攻受文</option>
                <option value="OTHER">其他</option>
              </select>
            </div>
            <div className="md:w-32 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
              >
                {loading ? "创建中..." : "创建"}
              </button>
            </div>
          </div>
        </form>

        {/* 小说列表 */}
        {novels.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📖</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">还没有小说</h3>
            <p className="text-gray-500">点击上方创建你的第一部小说吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {novels.map((n) => (
              <Link
                key={n.id}
                href={`/novels/${n.id}`}
                className="group bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {n.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {n.genre === "BL" ? "💙 攻受文" : n.genre === "BG" ? "💚 男女文" : n.genre}
                    </p>
                  </div>
                  <div className="text-3xl">📚</div>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(n.createdAt).toLocaleDateString("zh-CN")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
