import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { NieuweCategorie } from "@/components/admin/nieuwe-categorie"
import { NieuwMenuItem } from "@/components/admin/nieuw-menu-item"
import { MenuItemBeheer } from "@/components/admin/menu-item-beheer"

export default async function NavigatiePage() {
  const [categories, modules, pages] = await Promise.all([
    db.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        menuItems: {
          orderBy: { sortOrder: "asc" },
          include: { module: true, page: true },
        },
      },
    }),
    db.module.findMany({ orderBy: { sortOrder: "asc" } }),
    db.page.findMany({ where: { published: true }, orderBy: { title: "asc" } }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Navigatie beheer</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Beheer het linkermenu van het portaal</p>
        </div>
        <NieuweCategorie />
      </div>

      <div className="space-y-4">
        {categories.length === 0 ? (
          <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardContent className="py-8 text-center text-slate-400">
              Nog geen categorieën aangemaakt
            </CardContent>
          </Card>
        ) : (
          categories.map((cat) => (
            <Card key={cat.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardHeader className="py-4">
                <CardTitle className="text-base text-slate-800 dark:text-slate-100 flex items-center justify-between">
                  <span>📁 {cat.name}</span>
                  <NieuwMenuItem categoryId={cat.id} modules={modules} pages={pages} />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <MenuItemBeheer items={cat.menuItems} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
