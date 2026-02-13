'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { inviteUser } from '@/app/(app)/opai/actions/users';
import { Plus } from 'lucide-react';

interface RoleTemplate {
  id: string;
  name: string;
  slug: string;
}

interface Props {
  roleTemplates: RoleTemplate[];
}

export default function InviteUserButton({ roleTemplates }: Props) {
  const defaultSlug = roleTemplates.find((t) => t.slug === 'viewer')?.slug ?? roleTemplates[0]?.slug ?? 'viewer';
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [roleSlug, setRoleSlug] = useState(defaultSlug);

  useEffect(() => {
    if (open && roleTemplates.length > 0) {
      const valid = roleTemplates.some((t) => t.slug === roleSlug);
      if (!valid) setRoleSlug(roleTemplates.find((t) => t.slug === 'viewer')?.slug ?? roleTemplates[0].slug);
    }
  }, [open, roleTemplates, roleSlug]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await inviteUser(email, roleSlug);

    setLoading(false);

    if (result.success) {
      setEmail('');
      setRoleSlug(defaultSlug);
      setOpen(false);
      window.location.reload();
    } else {
      setError(result.error || 'Error al enviar invitación');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Invitar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="role">Rol</Label>
            <Select value={roleSlug} onValueChange={setRoleSlug}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {roleTemplates.map((t) => (
                  <SelectItem key={t.id} value={t.slug}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar Invitación'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
