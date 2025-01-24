import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Database } from "@/integrations/supabase/types";

type UserType = Database["public"]["Enums"]["user_type"];

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  user_type: UserType;
  is_active: boolean;
}

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
}

export const UserList = ({ users, onEdit, onDelete }: UserListProps) => {
  const getUserTypeBadgeVariant = (userType: UserType) => {
    switch (userType) {
      case "admin":
        return "default";
      case "agent":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getUserTypeLabel = (userType: UserType) => {
    switch (userType) {
      case "admin":
        return "Administrador";
      case "agent":
        return "Agente";
      default:
        return "Usuário";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={getUserTypeBadgeVariant(user.user_type)}>
                  {getUserTypeLabel(user.user_type)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? "default" : "destructive"}>
                  {user.is_active ? "Ativo" : "Inativo"}
                </Badge>
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
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                Nenhum usuário encontrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};