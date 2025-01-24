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

      // Verificar o tipo de usuário no user_metadata
      const userType = session.user.user_metadata?.user_type;
      
      setIsAuthenticated(true);
      setIsAgent(userType === "agent");

      if (userType !== "agent") {
        toast({
          variant: "destructive",
          title: "Acesso negado",
          description: "Apenas agentes podem acessar esta área",
        });
      }
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

  if (!isAuthenticated || !isAgent) {
    return <Navigate to="/agent-login" />;
  }

  return <>{children}</>;
};