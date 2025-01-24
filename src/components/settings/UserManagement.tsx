import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from "@supabase/supabase-js";

export const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      return users;
    },
  });

  const filteredUsers = users?.filter((user: User) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.user_metadata?.name?.toLowerCase().includes(searchLower) ||
      user.user_metadata?.user_type?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar usuários..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ScrollArea className="h-[500px] rounded-md border">
        <div className="p-4 space-y-4">
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            filteredUsers?.map((user: User) => (
              <div
                key={user.id}
                className="p-4 rounded-lg border hover:bg-accent"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {user.user_metadata?.name || "Sem nome"}
                    </h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm">
                      Tipo: {user.user_metadata?.user_type || "Não definido"}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Criado em: {new Date(user.created_at).toLocaleDateString()}</p>
                    <p>
                      Último acesso:{" "}
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Nunca"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};