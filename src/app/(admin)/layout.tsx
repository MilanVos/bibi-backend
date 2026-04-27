import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/login")

  const user = await db.user.findUnique({ where: { id: session.user.id } })

  if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
    redirect("/portaal")
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar />
      <div className="flex-1 min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
          <h1 className="font-semibold text-slate-800">Beheer Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <span className="text-sm text-slate-600 hidden sm:block">{user.name}</span>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
