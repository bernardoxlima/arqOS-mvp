export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          ArqOS
        </h1>
        <p className="text-slate-400 text-lg">
          Sistema unificado para arquitetura e design de interiores
        </p>
        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-green-400 font-mono text-sm">
            ✓ Next.js 15 + TypeScript + Tailwind CSS 4
          </p>
        </div>
      </div>
    </div>
  );
}
