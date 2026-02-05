'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { revokeInvitation } from '@/app/actions/users';
import { X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface Invitation {
  id: string;
  email: string;
  role: string;
  createdAt: Date;
  expiresAt: Date;
}

interface Props {
  invitations: Invitation[];
}

export default function InvitationsTable({ invitations }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRevoke = async (id: string) => {
    setLoading(id);
    await revokeInvitation(id);
    setLoading(null);
    window.location.reload();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Enviada
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Expira
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invitations.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 font-medium text-gray-900">
                {inv.email}
              </td>
              <td className="px-6 py-4">
                <Badge variant="outline">{inv.role}</Badge>
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(inv.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {formatDistanceToNow(new Date(inv.expiresAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(inv.id)}
                  disabled={loading === inv.id}
                >
                  <X className="w-4 h-4 mr-1" />
                  Revocar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
