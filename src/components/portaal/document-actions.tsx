"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Loader2 } from "lucide-react"

interface DocumentActionsProps {
  uploadId: string
  filename: string
  isOwner: boolean
  isAdmin: boolean
}

export function DocumentActions({ uploadId, filename, isOwner, isAdmin }: DocumentActionsProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const canDelete = isOwner || isAdmin

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    setDeleting(true)
    const res = await fetch(`/api/uploads/${uploadId}`, { method: "DELETE" })
    if (res.ok) {
      router.refresh()
    }
    setDeleting(false)
    setConfirmDelete(false)
  }

  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      <a
        href={`/api/uploads/${uploadId}`}
        download={filename}
        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        title="Downloaden"
      >
        <Download className="w-4 h-4 text-slate-500" />
      </a>
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className={confirmDelete ? "text-red-600 hover:text-red-700 hover:bg-red-50" : "text-slate-400 hover:text-red-500"}
          title={confirmDelete ? "Nogmaals klikken om te bevestigen" : "Verwijderen"}
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      )}
    </div>
  )
}
