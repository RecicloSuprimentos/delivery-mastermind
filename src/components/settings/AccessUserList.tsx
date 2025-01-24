import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata?: {
    name?: string;
    user_type?: "user" | "agent" | "admin";
  };
}

interface AccessUserListProps {
  users: AuthUser[];
  onEdit: (user: AuthUser) => void;
  onDelete: (userId: string) => void;
}

const getUserTypeLabel = (type?: string) => {
  switch (type) {
    case 'admin':
      return 'Administrador';
    case 'agent':
      return 'Agente';
    case 'user':
      return 'Usuário';
    default:
      return 'Usuário';
  }
};

const getUserTypeBadgeColor = (type?: string) => {
  switch (type) {
    case 'admin':
      return 'bg-red-500';
    case 'agent':
      return 'bg-blue-500';
    case 'user':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export const AccessUserList = ({ users, onEdit, onDelete }: AccessUserListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead>Último acesso</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users?.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.user_metadata?.name || 'N/A'}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge className={getUserTypeBadgeColor(user.user_metadata?.user_type)}>
                {getUserTypeLabel(user.user_metadata?.user_type)}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {user.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleDateString()
                : "Nunca"}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(user)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(user.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};