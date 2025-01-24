import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const AgentProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAgent, setIsAgent] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsAuthenticated(false);
        return;
      }

      const { data: userData, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching user type:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao verificar permissões do usuário",
        });
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      setIsAgent(userData?.user_type === "agent");
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (isAuthenticated === null || isAgent === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAgent) {
    toast({
      variant: "destructive",
      title: "Acesso negado",
      description: "Apenas agentes podem acessar esta área",
    });
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};