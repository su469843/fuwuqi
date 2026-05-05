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
  const [maleLeadName, setMaleLeadName] = useState("");
  const [maleLeadTraits, setMaleLeadTraits] = useState("");
  const [femaleLeadName, setFemaleLeadName] = useState("");
  const [femaleLeadTraits, setFemaleLeadTraits] = useState("");
  const [relationship, setRelationship] = useState("恋人");
  const [roleType, setRoleType] = useState("正派");
  const [numCharacters, setNumCharacters] = useState(2);
  const [additionalCharacters, setAdditionalCharacters] = useState<Array<{name: string, gender: string, role: string, traits: string}>>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
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
    const novelData = {
      title,
      genre,
      maleLeadName: maleLeadName || null,
      maleLeadTraits: maleLeadTraits || null,
      femaleLeadName: femaleLeadName || null,
      femaleLeadTraits: femaleLeadTraits || null,
      additionalCharacters: additionalCharacters.length > 0 ? JSON.stringify(additionalCharacters) : null,
      metadata: JSON.stringify({
        relationship,
        roleType,
        numCharacters,
        createdAt: new Date().toISOString()
      })
    };
    
    const res = await fetch("/api/novels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(novelData),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }
    setTitle("");
    setMaleLeadName("");
    setMaleLeadTraits("");
    setFemaleLeadName("");
    setFemaleLeadTraits("");
    setAdditionalCharacters([]);
    loadNovels();
  }

  function addCharacter() {
    setAdditionalCharacters([...additionalCharacters, {name: "", gender: "男", role: "配角", traits: ""}]);
  }

  function removeCharacter(index: number) {
    const newChars = [...additionalCharacters];
    newChars.splice(index, 1);
    setAdditionalCharacters(newChars);
  }

  function updateCharacter(index: number, field: string, value: string) {
    const newChars = [...additionalCharacters];
    newChars[index] = {...newChars[index], [field]: value};
    setAdditionalCharacters(newChars);
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
        <form onSubmit={handleCreate} className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow-xl p-8 mb-8 border border-blue-100/50">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">✨ 创建新小说</h2>
              <p className="text-gray-600 mt-2">填写详细信息，开始你的创作之旅</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                {showAdvanced ? "收起高级选项" : "展开高级选项"}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showAdvanced ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                </svg>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-8">
            {/* 基础信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📖 小说标题
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="请输入小说标题"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏷️ 小说类型
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="BG">💚 男女文 (BG)</option>
                  <option value="BL">💙 攻受文 (BL)</option>
                  <option value="GL">💗 女女文 (GL)</option>
                  <option value="OTHER">🎭 其他类型</option>
                </select>
              </div>
            </div>

            {/* 主角设置 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="p-2 bg-blue-100 rounded-lg mr-3">👥</span>
                主角设置
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {genre === "BL" ? "👑 攻方姓名" : "👨 男主角姓名"}
                    </label>
                    <input
                      value={maleLeadName}
                      onChange={(e) => setMaleLeadName(e.target.value)}
                      placeholder={genre === "BL" ? "请输入攻方姓名" : "请输入男主角姓名"}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {genre === "BL" ? "攻方性格特征" : "男主角性格特征"}
                    </label>
                    <textarea
                      value={maleLeadTraits}
                      onChange={(e) => setMaleLeadTraits(e.target.value)}
                      placeholder="例如：高冷霸道、温柔体贴、腹黑..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24"
                      rows={3}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {genre === "BL" ? "🛡️ 受方姓名" : genre === "GL" ? "👩 女主角姓名" : "👩 女主角姓名"}
                    </label>
                    <input
                      value={femaleLeadName}
                      onChange={(e) => setFemaleLeadName(e.target.value)}
                      placeholder={genre === "BL" ? "请输入受方姓名" : "请输入女主角姓名"}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {genre === "BL" ? "受方性格特征" : "女主角性格特征"}
                    </label>
                    <textarea
                      value={femaleLeadTraits}
                      onChange={(e) => setFemaleLeadTraits(e.target.value)}
                      placeholder="例如：傲娇可爱、独立坚强、温柔贤惠..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all h-24"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 高级选项 */}
            {showAdvanced && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="p-2 bg-purple-100 rounded-lg mr-3">⚙️</span>
                  高级设置
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💞 关系设定
                    </label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="恋人">恋人关系</option>
                      <option value="夫妻">夫妻关系</option>
                      <option value="师生">师生关系</option>
                      <option value="上下级">上下级关系</option>
                      <option value="对手">竞争对手</option>
                      <option value="朋友">朋友关系</option>
                      <option value="仇敌">仇敌关系</option>
                      <option value="契约">契约关系</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      🎭 角色类型
                    </label>
                    <select
                      value={roleType}
                      onChange={(e) => setRoleType(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="正派">正派主角</option>
                      <option value="反派">反派主角</option>
                      <option value="中立">中立角色</option>
                      <option value="双面">双面角色</option>
                      <option value="成长型">成长型角色</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      👥 角色数量
                    </label>
                    <div className="flex items-center space-x-4">
                      <button
                        type="button"
                        onClick={() => setNumCharacters(Math.max(2, numCharacters - 1))}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-lg font-bold">{numCharacters} 个角色</span>
                      <button
                        type="button"
                        onClick={() => setNumCharacters(Math.min(10, numCharacters + 1))}
                        className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">包括主角在内的总角色数</p>
                  </div>
                </div>

                {/* 附加角色 */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">🎭 附加角色</h4>
                    <button
                      type="button"
                      onClick={addCharacter}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      添加角色
                    </button>
                  </div>
                  
                  {additionalCharacters.map((char, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="font-medium text-gray-800">角色 #{index + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeCharacter(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          删除
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">姓名</label>
                          <input
                            value={char.name}
                            onChange={(e) => updateCharacter(index, "name", e.target.value)}
                            placeholder="角色姓名"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">性别</label>
                          <select
                            value={char.gender}
                            onChange={(e) => updateCharacter(index, "gender", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="男">男</option>
                            <option value="女">女</option>
                            <option value="其他">其他</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">角色</label>
                          <select
                            value={char.role}
                            onChange={(e) => updateCharacter(index, "role", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="配角">配角</option>
                            <option value="反派">反派</option>
                            <option value="好友">好友</option>
                            <option value="家人">家人</option>
                            <option value="导师">导师</option>
                            <option value="对手">对手</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">特征</label>
                          <input
                            value={char.traits}
                            onChange={(e) => updateCharacter(index, "traits", e.target.value)}
                            placeholder="性格特征"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 提交按钮 */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-500">
                填写完成后，你可以选择 AI 生成或手动创作
              </div>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => router.push("/novels")}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      创建中...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      创建小说
                    </>
                  )}
                </button>
              </div>
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
