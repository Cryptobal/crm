'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { changeUserRole, toggleUserStatus } from '@/app/actions/users';
import { MoreVertical, Shield, UserCheck, UserX } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface Props {
  users: User[];
  currentUserId: string;
}

export default function UsersTable({ users, currentUserId }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      owner: 'default',
      admin: 'secondary',
      editor: 'outline',
      viewer: 'outline',
    };
    return <Badge variant={variants[role] || 'outline'}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active') return <Badge variant="default">Activo</Badge>;
    if (status === 'disabled') return <Badge variant="destructive">Desactivado</Badge>;
    return <Badge variant="outline">{status}</Badge>;
  };

  const handleToggleStatus = async (userId: string) => {
    setLoading(userId);
    await toggleUserStatus(userId);
    setLoading(null);
    window.location.reload();
  };

  if (users.length === 0) {
    return (
      <div className="p-12 text-center text-gray-500">
        No hay usuarios registrados
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Último Login
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => {
            const isCurrentUser = user.id === currentUserId;
            return (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {user.lastLoginAt
                    ? formatDistanceToNow(new Date(user.lastLoginAt), {
                        addSuffix: true,
                        locale: es,
                      })
                    : 'Nunca'}
                </td>
                <td className="px-6 py-4 text-right">
                  {!isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={loading === user.id}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="w-4 h-4 mr-2" />
                              Desactivar
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {isCurrentUser && (
                    <span className="text-xs text-gray-400">(Tú)</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
