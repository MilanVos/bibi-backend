import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ModuleToggle } from "@/components/admin/module-toggle"

export default async function ModulesPage() {
  const modules = await db.module.findMany({ orderBy: { sortOrder: "asc" } })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Modules</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Beheer de functionaliteitsmodules van het portaal</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <Card key={mod.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{mod.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">Route: /portaal{mod.route}</p>
                  <p className="text-xs text-slate-400">Type: {mod.type}</p>
                  <div className="mt-2">
                    <Badge variant={mod.enabled ? "success" : "secondary"}>
                      {mod.enabled ? "Actief" : "Uitgeschakeld"}
                    </Badge>
                  </div>
                </div>
                <ModuleToggle moduleId={mod.id} enabled={mod.enabled} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
