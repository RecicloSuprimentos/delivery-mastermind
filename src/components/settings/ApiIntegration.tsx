import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export const ApiIntegration = () => {
  const { toast } = useToast();
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/routes-api`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          API de Rotas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Endpoint da API</h3>
            <Alert>
              <AlertDescription className="flex items-center justify-between">
                <code className="text-sm">{apiUrl}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(apiUrl)}
                >
                  Copiar
                </Button>
              </AlertDescription>
            </Alert>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Parâmetros</h3>
            <div className="text-sm">
              <p><code>id</code> (opcional) - ID da rota específica</p>
              <p className="text-gray-500 mt-1">
                Se não for fornecido, retorna todas as rotas
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Exemplo de uso</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm font-mono">
                GET {apiUrl}?id=route_id
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Retorno</h3>
            <div className="text-sm space-y-1">
              <p>A API retorna um array com os seguintes dados para cada rota:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Informações da rota (nome, agente, horários)</li>
                <li>Lista de paradas ordenadas</li>
                <li>Detalhes dos serviços associados</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};