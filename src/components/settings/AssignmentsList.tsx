import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  name: string;
  email: string;
  user_type: string;
}

interface AssignmentsListProps {
  users: User[];
}

export const AssignmentsList = ({ users }: AssignmentsListProps) => {
  const getUserTypeBadgeVariant = (userType: string) => {
    switch (userType) {
      case "admin":
        return "default";
      case "agent":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getUserTypeLabel = (userType: string) => {
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
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-4 text-gray-500">
                Nenhuma atribuição encontrada
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};