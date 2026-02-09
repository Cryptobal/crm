/**
 * CpqSimpleCatalogConfig
 * 
 * Componente reutilizable para configurar catálogos simples (Puestos, Cargos, Roles).
 * CRUD completo con tabla inline.
 */
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Save, Trash2, Pencil, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type CatalogEntry = {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  createdAt: string;
};

interface CpqSimpleCatalogConfigProps {
  title: string;
  description: string;
  apiPath: string; // e.g. "/api/cpq/puestos"
  hasDescription?: boolean;
}

export function CpqSimpleCatalogConfig({
  title,
  description,
  apiPath,
  hasDescription = false,
}: CpqSimpleCatalogConfigProps) {
  const [items, setItems] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<CatalogEntry | null>(null);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "h-9 text-sm bg-card text-foreground border-border placeholder:text-muted-foreground";

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiPath}?active=true`, { cache: "no-store" });
      const data = await res.json();
      if (data.success) setItems(data.data || []);
    } catch (error) {
      console.error(`Error loading ${title}:`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiPath]);

  const addItem = async () => {
    if (!newName.trim()) {
      toast.error("Escribe un nombre");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          ...(hasDescription ? { description: newDesc.trim() || null } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => [...prev, data.data]);
        setNewName("");
        setNewDesc("");
        toast.success("Agregado correctamente");
      } else {
        toast.error(data.error || "Error al agregar");
      }
    } catch {
      toast.error("Error al agregar");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiPath}/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          ...(hasDescription ? { description: editDesc.trim() || null } : {}),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? data.data : item))
        );
        setEditingId(null);
        toast.success("Guardado correctamente");
      } else {
        toast.error(data.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item: CatalogEntry) => {
    setDeleteConfirm(null);
    setSaving(true);
    try {
      const res = await fetch(`${apiPath}/${item.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.success("Eliminado correctamente");
      } else {
        toast.error(data.error || "Error al eliminar");
      }
    } catch {
      toast.error("Error al eliminar");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: CatalogEntry) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditDesc(item.description || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditDesc("");
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 sm:p-4 border-border/40 bg-card/50">
        <div className="mb-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>

        {/* Add new item */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/30">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nombre"
            className={`${inputClass} flex-1`}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          {hasDescription && (
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Descripción (opcional)"
              className={`${inputClass} flex-1`}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
          )}
          <Button
            size="sm"
            onClick={addItem}
            disabled={saving || !newName.trim()}
            className="h-9 gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Agregar</span>
          </Button>
        </div>

        {/* Items list */}
        {loading ? (
          <div className="text-xs text-muted-foreground py-4 text-center">
            Cargando...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-md border border-dashed border-border/60 p-6 text-center text-sm text-muted-foreground">
            No hay elementos. Agrega el primero arriba.
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-md border border-border/40 px-3 py-2 hover:bg-accent/30 transition-colors group"
              >
                {editingId === item.id ? (
                  <>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={`${inputClass} flex-1`}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                    />
                    {hasDescription && (
                      <Input
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        placeholder="Descripción"
                        className={`${inputClass} flex-1`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-emerald-500"
                      onClick={saveEdit}
                      disabled={saving}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={cancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      {hasDescription && item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() => startEdit(item)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => setDeleteConfirm(item)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar{" "}
              <strong>&quot;{deleteConfirm?.name}&quot;</strong>? Los registros
              existentes que usan este elemento no se verán afectados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && deleteItem(deleteConfirm)}
              disabled={saving}
            >
              {saving ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
