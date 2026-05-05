import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">小说编写平台</h1>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        AI 辅助小说编写，支持攻受文、男女文等多种类型，智能角色设定，按 token 计费。
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          注册
        </Link>
      </div>
    </div>
  );
}
