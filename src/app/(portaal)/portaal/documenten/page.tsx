import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { FileText, Download } from "lucide-react"
import { DocumentUpload } from "@/components/portaal/document-upload"

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

  const uploads = await db.upload.findMany({
    where: { public: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Documenten</h1>
          <p className="text-slate-500 text-sm mt-1">{uploads.length} gedeelde bestanden</p>
        </div>
        <DocumentUpload />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uploads.length === 0 ? (
          <div className="col-span-full">
            <Card className="bg-white">
              <CardContent className="pt-8 pb-8 text-center text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nog geen documenten gedeeld</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          uploads.map((upload) => (
            <Card key={upload.id} className="bg-white hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{upload.filename}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {MIME_LABELS[upload.mimetype] ?? upload.mimetype.split("/")[1].toUpperCase()}
                      </Badge>
                      <span className="text-xs text-slate-400">{formatSize(upload.size)}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {upload.user.name} · {formatDate(upload.createdAt)}
                    </p>
                  </div>
                  <a
                    href={upload.path}
                    download={upload.filename}
                    className="flex-shrink-0 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
