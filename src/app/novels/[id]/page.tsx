"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

export default function NovelEditorPage({ params }: { params: { id: string } }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const novelId = params.id;

  useEffect(() => {
    loadChapters();
  }, []);

  async function loadChapters() {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/chapters?novelId=${novelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setChapters(await res.json());
  }

  async function handleCreateChapter(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ novelId, title: chapterTitle }),
    });
    if (res.ok) {
      setChapterTitle("");
      loadChapters();
    }
  }

  async function handleAIGenerate() {
    setLoading(true);
    setAiResult("");
    const token = localStorage.getItem("token");
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ novelId, prompt: aiPrompt }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setAiResult(`错误：${data.error}`);
      return;
    }
    setAiResult(data.text);
    setContent((prev) => prev + data.text);
  }

  async function handleSaveChapter(chapterId: string) {
    const token = localStorage.getItem("token");
    await fetch(`/api/chapters?id=${chapterId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
  }

  return (
    <div className="max-w-6xl mx-auto p-8">
      <button onClick={() => router.push("/novels")} className="mb-4 text-blue-600 hover:underline">
        ← 返回小说列表
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧章节列表 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">章节</h2>
          <form onSubmit={handleCreateChapter} className="mb-4">
            <input
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              placeholder="新章节标题"
              className="w-full px-3 py-2 border rounded-lg mb-2"
              required
            />
            <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              新建章节
            </button>
          </form>
          <div className="space-y-2">
            {chapters.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setContent(ch.content)}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100"
              >
                {ch.order}. {ch.title}
              </button>
            ))}
          </div>
        </div>

        {/* 中间编辑区 */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">编辑</h2>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-96 px-3 py-2 border rounded-lg font-mono text-sm"
              placeholder="开始编写你的小说..."
            />
            <button
              onClick={() => chapters[0] && handleSaveChapter(chapters[0].id)}
              className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              保存
            </button>
          </div>

          {/* AI 辅助 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-semibold mb-4">AI 辅助编写</h2>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full h-24 px-3 py-2 border rounded-lg mb-2"
              placeholder="告诉 AI 你想写什么..."
            />
            <button
              onClick={handleAIGenerate}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? "生成中..." : "AI 生成"}
            </button>
            {aiResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiResult}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
