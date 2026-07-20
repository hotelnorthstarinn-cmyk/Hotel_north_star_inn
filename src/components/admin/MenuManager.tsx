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
import { addFoodItem, updateFoodItem, deleteFoodItem } from "@/lib/actions"
import { Pencil, Trash2, Plus, ImageIcon, X } from "lucide-react"
import { toast } from "sonner"
import type { FoodItem } from "@/types"

const CATEGORIES = [
  "Nepali Special",
  "Main Course",
  "Breakfast",
  "Snacks",
  "Desserts",
  "Beverages",
  "Sides",
]

function SubmitButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : label}
    </Button>
  )
}

export function MenuManager({ initialItems }: { initialItems: FoodItem[] }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [items, setItems] = useState(initialItems)
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [addState, addAction] = useActionState(addFoodItem, null)
  const [updateState, updateAction] = useActionState(updateFoodItem, null)

  useEffect(() => {
    if (addState?.success) {
      toast.success("Food item added!")
      setImagePreviews([])
      formRef.current?.reset()
      router.refresh()
    } else if (addState?.error) {
      toast.error(addState.error)
    }
  }, [addState, router])

  useEffect(() => {
    if (updateState?.success) {
      toast.success("Food item updated!")
      setEditingItem(null)
      setDialogOpen(false)
      setImagePreviews([])
      router.refresh()
    } else if (updateState?.error) {
      toast.error(updateState.error)
    }
  }, [updateState, router])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return
    const result = await deleteFoodItem(id)
    if (result.success) {
      toast.success("Item deleted")
      setItems((prev) => prev.filter((i) => i.id !== id))
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
    setEditingItem(null)
    setImagePreviews([])
    setDialogOpen(true)
  }

  function openEditDialog(item: FoodItem) {
    setEditingItem(item)
    setImagePreviews([])
    setDialogOpen(true)
  }

  function handleDialogClose(open: boolean) {
    if (!open) {
      setEditingItem(null)
      setImagePreviews([])
    }
    setDialogOpen(open)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Food Menu Management</h2>
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Food Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Food Item" : "Add New Food Item"}</DialogTitle>
            </DialogHeader>
            <form ref={formRef} action={editingItem ? updateAction : addAction} className="space-y-4">
              {editingItem && <input type="hidden" name="id" value={editingItem.id} />}

              <div className="space-y-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" name="name" defaultValue={editingItem?.name ?? ""} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" defaultValue={editingItem?.description ?? ""} />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rs.)</Label>
                  <Input id="price" name="price" type="number" step="0.01" defaultValue={editingItem?.price ?? ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    name="category"
                    defaultValue={editingItem?.category ?? "Main Course"}
                    className="flex h-9 w-full rounded-md border border-zinc-300 bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-deep-blue dark:border-zinc-700 dark:focus-visible:ring-deep-blue-light"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingItem && (
                <div className="flex items-center gap-2">
                  <Label htmlFor="is_available">Available</Label>
                  <select
                    id="is_available"
                    name="is_available"
                    defaultValue={editingItem.is_available ? "true" : "false"}
                    className="rounded-md border border-zinc-300 bg-background px-3 py-1 text-sm dark:border-zinc-700"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Images (select multiple)</Label>
                <Input type="file" name="images" accept="image/*" multiple onChange={handleImageSelect} />
                {editingItem && editingItem.gallery && editingItem.gallery.length > 0 && (
                  <input type="hidden" name="existing_gallery" value={JSON.stringify(editingItem.gallery)} />
                )}
                {(editingItem?.gallery?.length ?? 0) > 0 || imagePreviews.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingItem?.gallery?.map((url, i) => (
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

              <SubmitButton label={editingItem ? "Update Item" : "Add Item"} />
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            {item.image_url && (
              <div className="relative h-36 w-full overflow-hidden">
                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-base">{item.name}</CardTitle>
                <Badge variant={item.is_available ? "secondary" : "destructive"}>
                  {item.is_available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">{item.description}</p>
              <p className="mb-3 text-lg font-bold text-crimson">Rs.{item.price}</p>
              <Badge variant="outline">{item.category}</Badge>
              {item.gallery && item.gallery.length > 0 && (
                <p className="mt-1 text-xs text-zinc-400">{item.gallery.length} image(s)</p>
              )}
              <div className="mt-3 flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                  <Pencil className="mr-1 h-3 w-3" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
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
