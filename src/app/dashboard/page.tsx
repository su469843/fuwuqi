"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  User, 
  Shield, 
  BookOpen, 
  PlusCircle, 
  DollarSign, 
  LogOut,
  Settings,
  BarChart3,
  Zap,
  Sparkles,
  Wallet,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2
} from "lucide-react";

interface UserData {
  id: string;
  email: string;
  role: string;
  balance: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [maskedApiKey, setMaskedApiKey] = useState<string>("");
  const [newApiKey, setNewApiKey] = useState<string>("");
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [showNewApiKey, setShowNewApiKey] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      router.replace("/login");
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch (e) {
      console.error("Failed to parse user:", e);
    }
  }, [router]);



  // 获取API密钥
  const fetchApiKey = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/apikey", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.apiKey) {
          setApiKey(data.apiKey);
          setMaskedApiKey(data.maskedApiKey || "");
        }
      }
    } catch (error) {
      console.error("获取API密钥失败:", error);
    }
  };

  // 设置API密钥
  const handleSetApiKey = async () => {
    if (!newApiKey.trim()) {
      setMessage({ type: 'error', text: '请输入API密钥' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/apikey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey: newApiKey }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setApiKey(newApiKey);
        setMaskedApiKey(data.maskedApiKey);
        setNewApiKey("");
        setMessage({ type: 'success', text: data.message || 'API密钥设置成功' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || '设置失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setLoading(false);
    }
  };

  // 删除API密钥
  const handleDeleteApiKey = async () => {
    if (!confirm("确定要删除API密钥吗？")) return;

    setLoading(true);
    setMessage(null);
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/user/apikey", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      
      if (res.ok) {
        setApiKey("");
        setMaskedApiKey("");
        setMessage({ type: 'success', text: data.message || 'API密钥已删除' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || '删除失败' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '网络错误，请重试' });
    } finally {
      setLoading(false);
    }
  };

  // 复制API密钥
  const handleCopyApiKey = () => {
    if (!apiKey) return;
    
    navigator.clipboard.writeText(apiKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  // 初始化时获取API密钥
  useEffect(() => {
    if (user) {
      fetchApiKey();
    }
  }, [user]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-white/80 text-lg">加载用户信息中...</p>
      </div>
    </div>
  );

  const balance = Number(user.balance).toFixed(4);
  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* 现代化导航栏 */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                小说创作平台
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full">
                <User className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">{user.email}</span>
                {isAdmin && (
                  <span className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-semibold rounded-full">
                    管理员
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <LogOut className="h-4 w-4" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 欢迎卡片 */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            欢迎回来，{user.email.split('@')[0]}！👋
          </h1>
          <p className="text-gray-600">开始你的创作之旅，让AI助你一臂之力</p>
        </div>

        {/* 用户信息卡片 - 现代化设计 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <User className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                用户信息
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">账户详情</h3>
            <p className="text-blue-100 mb-1">{user.email}</p>
            <p className="text-sm opacity-80">{isAdmin ? "管理员账户" : "普通用户"}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Wallet className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                账户余额
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">可用额度</h3>
            <p className="text-3xl font-bold mb-2">¥{balance}</p>
            <p className="text-sm opacity-80">注册赠送 ¥2.00</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Zap className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                快速操作
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">开始创作</h3>
            <p className="text-sm opacity-80 mb-4">立即开始你的小说创作</p>
            <Link
              href="/novels"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>新建小说</span>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-500 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Key className="h-8 w-8" />
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                API密钥
              </span>
            </div>
            <h3 className="text-lg font-semibold mb-2">API密钥管理</h3>
            {apiKey ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/10 p-3 rounded-lg">
                  <code className="text-sm font-mono truncate">
                    {showApiKey ? apiKey : maskedApiKey}
                  </code>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 hover:bg-white/20 rounded"
                      title={showApiKey ? "隐藏密钥" : "显示密钥"}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={handleCopyApiKey}
                      className="p-1 hover:bg-white/20 rounded"
                      title="复制密钥"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-300" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleDeleteApiKey}
                  disabled={loading}
                  className="w-full py-2 bg-red-500/80 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{loading ? "处理中..." : "删除密钥"}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showNewApiKey ? "text" : "password"}
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="输入你的API密钥"
                    className="w-full px-4 py-2 pl-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Key className="h-4 w-4 text-white/60" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewApiKey(!showNewApiKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showNewApiKey ? (
                      <EyeOff className="h-4 w-4 text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/60" />
                    )}
                  </button>
                </div>
                <button
                  onClick={handleSetApiKey}
                  disabled={loading || !newApiKey.trim()}
                  className="w-full py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "设置中..." : "设置API密钥"}
                </button>
              </div>
            )}
            {message && (
              <div className={`mt-3 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                {message.text}
              </div>
            )}
          </div>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 管理控制台 */}
          {isAdmin ? (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-200/50">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl mr-4">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">⚙️ 管理控制台</h2>
                  <p className="text-gray-600">管理系统配置和监控</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/api/administrator/channels"
                  className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">API渠道管理</h3>
                      <p className="text-sm text-gray-600">查看和管理API渠道</p>
                    </div>
                  </div>
                </Link>
                
                <Link
                  href="/api/administrator/pricing"
                  className="block p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">定价管理</h3>
                      <p className="text-sm text-gray-600">配置模型定价策略</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 border border-blue-200/50">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl mr-4">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🔒 管理员功能</h2>
                  <p className="text-gray-600">管理员可通过API接口管理系统</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/80 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-2">API接口访问</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    管理员可以直接访问以下API接口进行系统管理：
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        GET /api/administrator/channels
                      </code>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <code className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                        GET /api/administrator/pricing
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl border border-blue-300">
                  <h3 className="font-semibold text-blue-900 mb-2">💡 提示</h3>
                  <p className="text-sm text-blue-800">
                    如需管理员权限，请联系系统管理员获取访问令牌。普通用户无法访问管理接口。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 创作中心 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200/50 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl mr-4">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">📖 创作中心</h2>
                <p className="text-gray-600">管理你的小说作品</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <Link
                href="/novels"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500 rounded-lg group-hover:bg-emerald-600 transition-colors">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">我的小说</h3>
                    <p className="text-sm text-gray-600">查看和管理所有作品</p>
                  </div>
                </div>
                <div className="text-emerald-600 group-hover:text-emerald-700 transition-colors">
                  →
                </div>
              </Link>
              
              <Link
                href="/novels?create=true"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:bg-blue-600 transition-colors">
                    <PlusCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">新建小说</h3>
                    <p className="text-sm text-gray-600">开始创作新的故事</p>
                  </div>
                </div>
                <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                  →
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* 特色功能卡片 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200/50">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-indigo-500 rounded-xl mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">AI辅助创作</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">智能生成角色设定、情节发展，让你的创作更轻松</p>
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
              已启用
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-amber-500 rounded-xl mr-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">实时保存</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">自动保存你的创作进度，无需担心数据丢失</p>
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
              已启用
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200/50">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-rose-500 rounded-xl mr-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900">数据统计</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">查看创作字数统计、AI使用情况等详细数据</p>
            <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
              即将推出
            </span>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="mt-12 border-t border-gray-200/50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  小说创作平台
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-2">AI驱动的智能小说创作工具</p>
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 小说创作平台. 保留所有权利.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
