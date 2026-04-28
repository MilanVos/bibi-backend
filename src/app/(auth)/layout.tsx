import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center p-4 relative transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/10" />
      </div>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">J</span>
          </div>
          <h1 className="text-2xl font-bold text-white dark:text-white text-slate-800">Jongerenraad</h1>
          <p className="text-slate-400 dark:text-slate-400 text-slate-500 text-sm mt-1">Leden portaal</p>
        </div>
        {children}
      </div>
    </div>
  )
}
