"use client";
import { useEffect, useState, useCallback } from "react";
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
  const [saving, setSaving] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const router = useRouter();
  const novelId = params.id;

  const loadChapters = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/chapters?novelId=${novelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setChapters(data);
    }
  }, [novelId]);

  useEffect(() => {
    loadChapters();
  }, [loadChapters]);

  async function handleCreateChapter(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const res = await fetch("/api/chapters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ novelId, prompt: aiPrompt }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setAiResult(`❌ 错误：${data.error}`);
      return;
    }
    setAiResult(data.text);
    setContent((prev) => prev + data.text);
  }

  async function handleSaveChapter() {
    if (!selectedChapterId) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    await fetch(`/api/chapters?id=${selectedChapterId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });
    setSaving(false);
  }

  function selectChapter(chapter: Chapter) {
    setSelectedChapterId(chapter.id);
    setContent(chapter.content);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push("/novels")}
                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                ← 小说列表
              </button>
            </div>
            {selectedChapterId && (
              <button
                onClick={handleSaveChapter}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50"
              >
                {saving ? "保存中..." : "💾 保存"}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧章节列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📑 章节</h2>

              {/* 创建章节表单 */}
              <form onSubmit={handleCreateChapter} className="mb-6">
                <input
                  value={chapterTitle}
                  onChange={(e) => setChapterTitle(e.target.value)}
                  placeholder="新章节标题"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  ➕ 新建章节
                </button>
              </form>

              {/* 章节列表 */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => selectChapter(ch)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedChapterId === ch.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{ch.order}. {ch.title}</span>
                      {selectedChapterId === ch.id && <span>✏️</span>}
                    </div>
                  </button>
                ))}
                {chapters.length === 0 && (
                  <p className="text-gray-400 text-center py-8">暂无章节</p>
                )}
              </div>
            </div>
          </div>

          {/* 右侧编辑区 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 编辑器 */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">📝 编辑</h2>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
                placeholder="开始编写你的小说..."
              />
            </div>

            {/* AI 辅助 */}
            <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4">🤖 AI 辅助编写</h2>
              <div className="space-y-4">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full h-24 px-4 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/60"
                  placeholder="告诉 AI 你想写什么..."
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={loading}
                  className="w-full py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all disabled:opacity-50"
                >
                  {loading ? "⏳ 生成中..." : "✨ AI 生成"}
                </button>
              </div>
              {aiResult && (
                <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                  <h3 className="font-bold mb-2">生成结果：</h3>
                  <p className="text-sm whitespace-pre-wrap">{aiResult}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
