import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { FileText } from "lucide-react"
import { DocumentUpload } from "@/components/portaal/document-upload"
import { DocumentActions } from "@/components/portaal/document-actions"

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const MIME_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "text/plain": "TXT",
}

export default async function DocumentenPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const currentUser = await db.user.findUnique({ where: { id: session!.user.id } })

  const uploads = await db.upload.findMany({
    where: { public: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
    omit: { data: true },
  })

  const isAdmin = currentUser?.role === "ADMIN" || currentUser?.role === "SUPERADMIN"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Documenten</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{uploads.length} gedeelde bestanden</p>
        </div>
        <DocumentUpload />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploads.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="pt-8 pb-8 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nog geen documenten gedeeld</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          uploads.map((upload) => (
            <Card key={upload.id} className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate">{upload.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {MIME_LABELS[upload.mimetype] ?? upload.mimetype.split("/")[1]?.toUpperCase() ?? "FILE"}
                      </Badge>
                      <span className="text-xs text-slate-400">{formatSize(upload.size)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {upload.user.name} · {formatDate(upload.createdAt)}
                    </p>
                  </div>
                  <DocumentActions
                    uploadId={upload.id}
                    filename={upload.filename}
                    isOwner={upload.userId === session!.user.id}
                    isAdmin={isAdmin}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
