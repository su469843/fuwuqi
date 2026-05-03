"use client";
import { useEffect, useState } from "react";
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
  const router = useRouter();

  useEffect(() => {
    loadNovels();
  }, []);

  async function loadNovels() {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/auth/login"); return; }
    const res = await fetch("/api/novels", { headers: { Authorization: `Bearer ${token}` } });
    if (res.ok) setNovels(await res.json());
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const token = localStorage.getItem("token");
    const res = await fetch("/api/novels", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, genre }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "创建失败"); return; }
    setTitle("");
    loadNovels();
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">我的小说</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">创建新小说</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex gap-4 mb-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="小说标题"
            className="flex-1 px-3 py-2 border rounded-lg"
            required
          />
          <select value={genre} onChange={(e) => setGenre(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="BG">男女文</option>
            <option value="BL">攻受文</option>
            <option value="OTHER">其他</option>
          </select>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            创建
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {novels.map((n) => (
          <Link
            key={n.id}
            href={`/novels/${n.id}`}
            className="block bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{n.title}</h3>
            <p className="text-sm text-gray-500">
              {n.genre === "BL" ? "攻受文" : n.genre === "BG" ? "男女文" : n.genre} · 创建于 {new Date(n.createdAt).toLocaleDateString()}
            </p>
          </Link>
        ))}
        {novels.length === 0 && <p className="text-gray-500 text-center py-8">还没有小说，点击上方创建</p>}
      </div>
    </div>
  );
}
