export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">J</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Jongerenraad</h1>
          <p className="text-slate-400 text-sm mt-1">Leden portaal</p>
        </div>
        {children}
      </div>
    </div>
  )
}
