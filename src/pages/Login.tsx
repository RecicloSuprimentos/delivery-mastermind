import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/");
      }
      if (event === "USER_UPDATED") {
        const { error } = await supabase.auth.getSession();
        if (error) {
          setErrorMessage(getErrorMessage(error));
        }
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.code) {
        case "invalid_credentials":
          return "Email ou senha inválidos. Por favor, verifique suas credenciais.";
        case "email_not_confirmed":
          return "Por favor, verifique seu email antes de fazer login.";
        case "user_not_found":
          return "Usuário não encontrado com essas credenciais.";
        case "invalid_grant":
          return "Credenciais de login inválidas.";
        default:
          return error.message;
      }
    }
    return error.message;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white py-8 px-4 shadow-md rounded-lg sm:px-10">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary">ROTERIZADOR</h1>
            <p className="mt-2 text-gray-600">Faça login para continuar</p>
          </div>
          
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'rgb(var(--primary))',
                    brandAccent: 'rgb(var(--primary))',
                  },
                },
              },
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: "Email",
                  password_label: "Senha",
                  button_label: "Entrar",
                  loading_button_label: "Entrando...",
                  social_provider_text: "Entrar com {{provider}}",
                  link_text: "Já tem uma conta? Entre",
                },
                sign_up: {
                  email_label: "Email",
                  password_label: "Senha",
                  button_label: "Criar conta",
                  loading_button_label: "Criando conta...",
                  social_provider_text: "Criar conta com {{provider}}",
                  link_text: "Não tem uma conta? Cadastre-se",
                },
                forgotten_password: {
                  email_label: "Email",
                  password_label: "Senha",
                  button_label: "Enviar instruções",
                  loading_button_label: "Enviando instruções...",
                  link_text: "Esqueceu sua senha?",
                },
                update_password: {
                  password_label: "Nova senha",
                  button_label: "Atualizar senha",
                  loading_button_label: "Atualizando senha...",
                },
              },
            }}
            theme="light"
            providers={[]}
            view="sign_in"
            showLinks={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;