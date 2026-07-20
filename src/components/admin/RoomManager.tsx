"use client"

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useActionState, useRef } from "react"
import { useFormStatus } from "react-dom"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { addRoom, updateRoom, deleteRoom } from "@/lib/actions"
import { createClient } from "@/lib/supabase"
import { Pencil, Trash2, Plus, ImageIcon, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Room } from "@/types"
import { ROOM_FEATURES, ROOM_STATUSES } from "@/types"

function SubmitButton({ label = "Save", uploading = false }: { label?: string; uploading?: boolean }) {
  const { pending } = useFormStatus()
  const disabled = pending || uploading
  return (
    <Button type="submit" disabled={disabled}>
      {uploading ? (
        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading images...</>
      ) : pending ? (
        "Saving..."
      ) : (
        label
      )}
    </Button>
  )
}

const statusColor: Record<string, "success" | "destructive" | "secondary"> = {
  available: "success",
  booked: "destructive",
  maintenance: "secondary",
}

const statusLabel: Record<string, string> = {
  available: "Available",
  booked: "Booked",
  maintenance: "Maintenance",
}

export function RoomManager({ initialRooms }: { initialRooms: Room[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [rooms, setRooms] = useState(initialRooms)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const [addState, addAction] = useActionState(addRoom, null)
  const [updateState, updateAction] = useActionState(updateRoom, null)

  async function uploadFile(file: File, folder: string) {
    const supabase = createClient()
    const ext = file.name.split(".").pop()
    const fileName = `${folder}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("hotel_images")
      .upload(`${folder}/${fileName}`, file)
    if (uploadError) { console.error("Upload error:", uploadError); return null }
    if (!uploadData) return null
    const { data: urlData } = supabase.storage.from("hotel_images").getPublicUrl(uploadData.path)
    return urlData?.publicUrl ?? null
  }

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const imageFiles = Array.from(formData.getAll("images"))
      .filter((v): v is File => v instanceof File && v.size > 0)

    if (imageFiles.length > 0) {
      setUploading(true)
      const uploadedUrls: string[] = []
      for (const file of imageFiles) {
        const url = await uploadFile(file, "rooms")
        if (url) uploadedUrls.push(url)
      }
      setUploading(false)
      formData.delete("images")
      for (const url of uploadedUrls) {
        formData.append("images", url)
      }
    }

    if (editingRoom) updateAction(formData)
    else addAction(formData)
  }

  useEffect(() => {
    if (addState?.success) {
      toast.success("Room added!")
      setImagePreviews([])
      formRef.current?.reset()
      router.refresh()
    } else if (addState?.error) {
      toast.error(addState.error)
    }
  }, [addState, router])

  useEffect(() => {
    if (updateState?.success) {
      toast.success("Room updated!")
      setEditingRoom(null)
      setDialogOpen(false)
      setImagePreviews([])
      router.refresh()
    } else if (updateState?.error) {
      toast.error(updateState.error)
    }
  }, [updateState, router])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this room?")) return
    const result = await deleteRoom(id)
    if (result.success) {
      toast.success("Room deleted")
      setRooms((prev) => prev.filter((r) => r.id !== id))
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const previews: string[] = []
    for (let i = 0; i < files.length; i++) {
      previews.push(URL.createObjectURL(files[i]))
    }
    setImagePreviews((prev) => [...prev, ...previews])
  }

  function removePreview(index: number) {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function openAddDialog() {
    setEditingRoom(null)
    setImagePreviews([])
    setDialogOpen(true)
  }

  function openEditDialog(room: Room) {
    setEditingRoom(room)
    setImagePreviews([])
    setDialogOpen(true)
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingRoom(null)
      setImagePreviews([])
    }
    setDialogOpen(open)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Room Management</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingRoom ? "Edit Room" : "Add New Room"}</DialogTitle>
            </DialogHeader>
            <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-5">
              {editingRoom && <input type="hidden" name="id" value={editingRoom.id} />}

              <div className="space-y-2">
                <Label htmlFor="name">Room Name</Label>
                <Input id="name" name="name" defaultValue={editingRoom?.name ?? ""} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" defaultValue={editingRoom?.description ?? ""} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rs.)</Label>
                  <Input id="price" name="price" type="number" defaultValue={editingRoom?.price ?? ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input id="capacity" name="capacity" type="number" defaultValue={editingRoom?.capacity ?? 1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="room_code">Room Code</Label>
                  <Input id="room_code" name="room_code" defaultValue={editingRoom?.room_code ?? ""} placeholder="e.g. A101" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  name="status"
                  defaultValue={editingRoom?.status ?? "available"}
                  className="flex h-9 w-full rounded-md border border-zinc-300 bg-background px-3 py-1 text-sm shadow-sm dark:border-zinc-700"
                >
                  {ROOM_STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel[s]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-md border border-zinc-200 p-3 dark:border-zinc-700">
                  {ROOM_FEATURES.map((feature) => {
                    const checked = editingRoom?.features?.includes(feature) ?? false
                    return (
                      <label key={feature} className="flex items-center gap-2 text-sm cursor-pointer hover:text-deep-blue dark:hover:text-deep-blue-light">
                        <input
                          type="checkbox"
                          name="features"
                          value={feature}
                          defaultChecked={checked}
                          className="h-4 w-4 rounded border-zinc-300 text-deep-blue focus:ring-deep-blue dark:border-zinc-600"
                        />
                        {feature}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Images (select multiple)</Label>
                <Input
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                />
                {editingRoom && editingRoom.gallery && editingRoom.gallery.length > 0 && (
                  <input type="hidden" name="existing_gallery" value={JSON.stringify(editingRoom.gallery)} />
                )}
                {(editingRoom?.gallery?.length ?? 0) > 0 || imagePreviews.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingRoom?.gallery?.map((url, i) => (
                      <div key={`existing-${i}`} className="relative h-16 w-16 overflow-hidden rounded-md border">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {imagePreviews.map((url, i) => (
                      <div key={`preview-${i}`} className="relative h-16 w-16 overflow-hidden rounded-md border">
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(i)}
                          className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black/50 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                    <ImageIcon className="h-4 w-4" /> No images yet
                  </div>
                )}
              </div>

              <SubmitButton label={editingRoom ? "Update Room" : "Add Room"} uploading={uploading} />
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Card key={room.id}>
            {room.image_url && (
              <div className="relative h-40 w-full overflow-hidden">
                <img src={room.image_url} alt={room.name} className="h-full w-full object-cover" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{room.name}</CardTitle>
                <Badge variant={statusColor[room.status] ?? "secondary"}>
                  {statusLabel[room.status] ?? room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{room.description}</p>
              <p className="mb-3 text-lg font-bold text-deep-blue dark:text-deep-blue-light">Rs.{room.price}</p>
              <p className="mb-2 text-xs text-zinc-500">
                Code: <span className="font-mono font-semibold text-deep-blue dark:text-deep-blue-light">{room.room_code}</span>
              </p>
              {room.features.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {room.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
              )}
              {room.gallery && room.gallery.length > 0 && (
                <p className="mb-2 text-xs text-zinc-400">{room.gallery.length} image(s)</p>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(room)}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(room.id)}>
                  <Trash2 className="mr-1 h-3 w-3" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
