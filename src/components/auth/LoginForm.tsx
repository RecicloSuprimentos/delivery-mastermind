import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthResponse {
  id: string;
  email: string;
  name: string;
  user_type: "admin" | "user" | "agent";
}

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Primeiro, autenticar o usuário usando a função RPC
      const { data, error: rpcError } = await supabase.rpc('authenticate_user', {
        email_input: email,
        password_input: password
      });

      if (rpcError) {
        console.error("Erro RPC:", rpcError);
        throw new Error("Falha na autenticação");
      }
      
      if (!data) {
        toast({
          variant: "destructive",
          title: "Erro ao fazer login",
          description: "Email ou senha inválidos",
        });
        setIsLoading(false);
        return;
      }

      // Validar o formato da resposta
      const isValidAuthResponse = (data: unknown): data is AuthResponse => {
        const d = data as any;
        return typeof d === 'object' 
          && d !== null
          && typeof d.id === 'string'
          && typeof d.email === 'string'
          && typeof d.name === 'string'
          && (d.user_type === 'admin' || d.user_type === 'user' || d.user_type === 'agent');
      };

      if (!isValidAuthResponse(data)) {
        console.error("Formato de resposta inválido:", data);
        throw new Error('Formato de resposta inválido do servidor');
      }

      // Verificar se a sessão foi criada corretamente
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erro ao obter sessão:", sessionError);
        throw new Error('Erro ao criar sessão');
      }

      if (!sessionData.session) {
        console.error("Sessão não criada");
        throw new Error('Sessão não criada');
      }

      // Se a sessão foi criada com sucesso, mostrar mensagem e redirecionar
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo(a), ${data.name}!`,
      });

      // Aguardar um pequeno intervalo para garantir que o toast seja exibido
      setTimeout(() => {
        navigate("/");
      }, 500);

    } catch (error) {
      console.error("Erro detalhado ao fazer login:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer login",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao tentar fazer login. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Sua senha"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};