import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InstellingenForm } from "@/components/admin/instellingen-form"

export default async function InstellingenPage() {
  const settings = await db.siteSetting.findMany()
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Site instellingen</h1>
        <p className="text-slate-500 text-sm mt-1">Algemene configuratie van het portaal</p>
      </div>

      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">Algemeen</CardTitle>
        </CardHeader>
        <CardContent>
          <InstellingenForm settings={settingsMap} />
        </CardContent>
      </Card>
    </div>
  )
}
