"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Save, 
  RefreshCw, 
  Download, 
  Sparkles, 
  Edit3, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Wand2,
  FileText,
  Type,
  Bold,
  Italic,
  List,
  Link,
  Image,
  Code,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Key,
  PlusCircle,
  Wallet,
  User,
  Shield,
  Zap
} from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface NovelInfo {
  title: string;
  genre: string;
  maleLeadName?: string;
  maleLeadTraits?: string;
  femaleLeadName?: string;
  femaleLeadTraits?: string;
}

export default function NovelEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [novelInfo, setNovelInfo] = useState<NovelInfo | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [content, setContent] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [writingMode, setWritingMode] = useState<"ai" | "manual">("manual");
  const [showFormatHelp, setShowFormatHelp] = useState(false);
  const [acceptedAiResult, setAcceptedAiResult] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const router = useRouter();
  const resolvedParams = React.use(params);
  const novelId = resolvedParams.id;

  const loadNovelInfo = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/novels/${novelId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setNovelInfo(data);
    }
  }, [novelId]);

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
    loadNovelInfo();
    loadChapters();
  }, [loadNovelInfo, loadChapters]);

  async function handleCreateChapter(e: React.FormEvent) {
    e.preventDefault();
    if (!chapterTitle.trim() || !content.trim()) return;
    setSaving(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/chapters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        novelId,
        title: chapterTitle,
        content,
        order: chapters.length + 1,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setChapterTitle("");
      setContent("");
      setAiResult("");
      setAcceptedAiResult(false);
      loadChapters();
    }
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    
    // 构建完整的提示词
    const fullPrompt = `请根据以下信息创作小说章节：

小说标题：${novelInfo?.title || "未命名小说"}
小说类型：${novelInfo?.genre === "BL" ? "攻受文" : novelInfo?.genre === "GL" ? "女女文" : "男女文"}
${novelInfo?.maleLeadName ? `${novelInfo?.genre === "BL" ? "攻方" : "男主角"}：${novelInfo.maleLeadName}（${novelInfo.maleLeadTraits || "未指定特征"}）` : ""}
${novelInfo?.femaleLeadName ? `${novelInfo?.genre === "BL" ? "受方" : "女主角"}：${novelInfo.femaleLeadName}（${novelInfo.femaleLeadTraits || "未指定特征"}）` : ""}

创作要求：${aiPrompt}

请按照以下格式创作：
1. 使用 # 标题 格式写章节标题
2. 内容使用Markdown格式
3. 对话使用引号
4. 场景描写要生动
5. 情感描写要细腻

请开始创作：`;

    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      setAiResult(data.result);
      setAcceptedAiResult(false);
    }
  }

  function acceptAiResult() {
    if (aiResult) {
      // 从AI结果中提取标题和内容
      const lines = aiResult.split('\n');
      let title = "";
      let content = "";
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
          title = lines[i].substring(2).trim();
          content = lines.slice(i + 1).join('\n').trim();
          break;
        }
      }
      
      if (!title) {
        title = "AI生成章节";
      }
      
      setChapterTitle(title);
      setContent(content);
      setAcceptedAiResult(true);
    }
  }

  function regenerateAiResult() {
    setRegenerateCount(prev => prev + 1);
    handleAiGenerate();
  }

  function insertMarkdown(type: string) {
    const textarea = document.getElementById("content-editor") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = "";

    switch (type) {
      case "h1":
        newText = `# ${selectedText || "标题"}\n`;
        break;
      case "h2":
        newText = `## ${selectedText || "二级标题"}\n`;
        break;
      case "bold":
        newText = `**${selectedText || "粗体文字"}**`;
        break;
      case "italic":
        newText = `*${selectedText || "斜体文字"}*`;
        break;
      case "list":
        newText = `- ${selectedText || "列表项"}\n`;
        break;
      case "link":
        newText = `[${selectedText || "链接文字"}](https://example.com)`;
        break;
      case "image":
        newText = `![${selectedText || "图片描述"}](https://example.com/image.jpg)`;
        break;
      case "code":
        newText = `\`\`\`\n${selectedText || "代码"}\n\`\`\``;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);
    
    // 聚焦并设置光标位置
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + newText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  function exportToPDF() {
    // 简单的PDF导出提示
    alert("PDF导出功能将在后续版本中实现。当前内容已保存，您可以复制内容到其他编辑器进行导出。");
  }

  const formatHelpText = `Markdown格式指南：
# 一级标题
## 二级标题
**粗体文字**
*斜体文字*
- 列表项
[链接文字](https://example.com)
![图片描述](https://example.com/image.jpg)
\`\`\`
代码块
\`\`\``;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/novels")}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>返回列表</span>
              </button>
              <div className="border-l border-gray-300 h-6"></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {novelInfo?.title || "小说编辑器"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>导出PDF</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧：章节列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
                  章节列表
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {chapters.length} 章
                </span>
              </div>
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      setSelectedChapterId(ch.id);
                      setChapterTitle(ch.title);
                      setContent(ch.content);
                      setWritingMode("manual");
                    }}
                    className={`w-full text-left p-4 rounded-xl transition-all ${
                      selectedChapterId === ch.id
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{ch.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {ch.content.length} 字
                        </p>
                      </div>
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        #{ch.order}
                      </span>
                    </div>
                  </button>
                ))}
                {chapters.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>还没有章节</p>
                    <p className="text-sm mt-1">开始创作你的第一个章节吧！</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 中间：编辑器 */}
          <div className="lg:col-span-3">
            {/* 创作模式选择 */}
            <div className="mb-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <Edit3 className="h-5 w-5 mr-2 text-purple-500" />
                  创作模式
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setWritingMode("manual")}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                      writingMode === "manual"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    <FileText className={`h-8 w-8 mb-3 ${writingMode === "manual" ? "text-blue-600" : "text-gray-400"}`} />
                    <span className={`font-semibold ${writingMode === "manual" ? "text-blue-700" : "text-gray-700"}`}>手动创作</span>
                    <p className="text-sm text-gray-500 mt-2 text-center">自由写作，支持Markdown格式</p>
                  </button>
                  <button
                    onClick={() => setWritingMode("ai")}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center justify-center ${
                      writingMode === "ai"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"
                    }`}
                  >
                    <Sparkles className={`h-8 w-8 mb-3 ${writingMode === "ai" ? "text-purple-600" : "text-gray-400"}`} />
                    <span className={`font-semibold ${writingMode === "ai" ? "text-purple-700" : "text-gray-700"}`}>AI生成</span>
                    <p className="text-sm text-gray-500 mt-2 text-center">AI智能创作，支持重写和接受</p>
                  </button>
                </div>
              </div>
            </div>

            {/* 编辑器区域 */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  {writingMode === "ai" ? (
                    <>
                      <Wand2 className="h-5 w-5 mr-2 text-purple-500" />
                      AI智能创作
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-5 w-5 mr-2 text-blue-500" />
                      手动创作
                    </>
                  )}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFormatHelp(!showFormatHelp)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    格式帮助
                  </button>
                </div>
              </div>

              {showFormatHelp && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h3 className="font-bold text-blue-800 mb-2">📝 Markdown格式指南</h3>
                  <pre className="text-sm text-blue-700 whitespace-pre-wrap bg-white/50 p-3 rounded-lg">
                    {formatHelpText}
                  </pre>
                </div>
              )}

              <form onSubmit={handleCreateChapter}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    章节标题
                  </label>
                  <input
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    placeholder="请输入章节标题（使用 # 开头表示标题）"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {writingMode === "manual" && (
                  <>
                    {/* Markdown工具栏 */}
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => insertMarkdown("h1")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="一级标题"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          H1
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("h2")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="二级标题"
                        >
                          <Type className="h-4 w-4 mr-2" />
                          H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("bold")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="粗体"
                        >
                          <Bold className="h-4 w-4 mr-2" />
                          粗体
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("italic")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="斜体"
                        >
                          <Italic className="h-4 w-4 mr-2" />
                          斜体
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("list")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="列表"
                        >
                          <List className="h-4 w-4 mr-2" />
                          列表
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("link")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="链接"
                        >
                          <Link className="h-4 w-4 mr-2" />
                          链接
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("image")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="图片"
                        >
                          <Image className="h-4 w-4 mr-2" />
                          图片
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("code")}
                          className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
                          title="代码块"
                        >
                          <Code className="h-4 w-4 mr-2" />
                          代码
                        </button>
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        内容（支持Markdown）
                      </label>
                      <textarea
                        id="content-editor"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="开始创作...（支持Markdown格式）"
                        className="w-full h-96 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                        required
                      />
                    </div>
                  </>
                )}

                {writingMode === "ai" && (
                  <div className="space-y-6">
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        AI提示词
                      </label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="例如：写一段浪漫的相遇场景，主角是霸道总裁和职场新人，要求对话生动，场景描写细腻..."
                        className="w-full h-32 px-4 py-3 border-2 border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        提示：AI将根据你的小说设定和提示词生成内容
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={handleAiGenerate}
                        disabled={loading}
                        className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            生成中...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            ✨ AI生成章节
                          </>
                        )}
                      </button>
                    </div>

                    {aiResult && (
                      <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
                            AI生成结果
                            {regenerateCount > 0 && (
                              <span className="ml-2 text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                第 {regenerateCount + 1} 次生成
                              </span>
                            )}
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={regenerateAiResult}
                              disabled={loading}
                              className="px-4 py-2 bg-white border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50 flex items-center"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              重新生成
                            </button>
                            <button
                              type="button"
                              onClick={acceptAiResult}
                              disabled={acceptedAiResult}
                              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                                acceptedAiResult
                                  ? "bg-green-100 text-green-700"
                                  : "bg-green-500 text-white hover:bg-green-600"
                              }`}
                            >
                              {acceptedAiResult ? (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  已接受
                                </>
                              ) : (
                                <>
                                  <Check className="h-4 w-4 mr-2" />
                                  接受并使用
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-purple-100">
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                            {aiResult}
                          </pre>
                        </div>
                        {acceptedAiResult && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-700">
                              <Check className="h-5 w-5 mr-2" />
                              <span>AI生成内容已应用到编辑器，你可以继续编辑或保存</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!aiResult && (
                      <div className="text-center py-12">
                        <Sparkles className="h-16 w-16 mx-auto text-purple-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">等待AI创作</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                          输入提示词，让AI为你创作精彩的章节内容。AI会考虑你的小说设定和角色信息。
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    {writingMode === "manual" 
                      ? "💡 提示：使用Markdown格式可以让内容更美观，导出PDF时格式更好看"
                      : "✨ AI会根据你的小说设定和提示词生成最适合的内容"}
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setChapterTitle("");
                        setContent("");
                        setAiResult("");
                        setAiPrompt("");
                        setSelectedChapterId(null);
                        setAcceptedAiResult(false);
                        setWritingMode("manual");
                      }}
                      className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      重置
                    </button>
                    <button
                      type="submit"
                      disabled={saving || (writingMode === "ai" && !acceptedAiResult && !content)}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          {selectedChapterId ? "更新章节" : "保存章节"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}