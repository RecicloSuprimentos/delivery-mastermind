import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

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

export const UserAuthManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users } = useQuery({
    queryKey: ["authUsers"],
    queryFn: async () => {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      return users as AuthUser[];
    },
  });

  const getUserTypeBadgeColor = (type?: string) => {
    switch (type) {
      case "admin":
        return "bg-red-500";
      case "agent":
        return "bg-blue-500";
      case "user":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getUserTypeLabel = (type?: string) => {
    switch (type) {
      case "admin":
        return "Administrador";
      case "agent":
        return "Agente";
      case "user":
        return "Usuário";
      default:
        return "Usuário";
    }
  };

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_metadata?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Buscar usuários..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Último acesso</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.user_metadata?.name || "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  className={getUserTypeBadgeColor(user.user_metadata?.user_type)}
                >
                  {getUserTypeLabel(user.user_metadata?.user_type)}
                </Badge>
              </TableCell>
              <TableCell>
                {format(new Date(user.created_at), "dd/MM/yyyy HH:mm")}
              </TableCell>
              <TableCell>
                {user.last_sign_in_at
                  ? format(new Date(user.last_sign_in_at), "dd/MM/yyyy HH:mm")
                  : "Nunca"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};