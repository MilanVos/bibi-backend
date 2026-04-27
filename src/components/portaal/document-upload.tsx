"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Upload, X, Loader2, CheckCircle } from "lucide-react"

export function DocumentUpload() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/uploads", { method: "POST", body: formData })

    if (res.ok) {
      setSuccess(true)
      setTimeout(() => {
        setOpen(false)
        setFile(null)
        setSuccess(false)
        router.refresh()
      }, 1500)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Upload mislukt")
    }

    setLoading(false)
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Bestand uploaden
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-slate-800">Bestand uploaden</h2>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleUpload} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-slate-700">Upload geslaagd!</p>
            </div>
          ) : (
            <>
              <div
                className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center cursor-pointer hover:border-blue-300 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                {file ? (
                  <div>
                    <p className="font-medium text-slate-700 text-sm">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-slate-600 text-sm">Klik om een bestand te kiezen</p>
                    <p className="text-xs text-slate-400 mt-1">PDF, Word, afbeeldingen, max 10MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuleren
                </Button>
                <Button type="submit" disabled={!file || loading}>
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Uploaden
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
