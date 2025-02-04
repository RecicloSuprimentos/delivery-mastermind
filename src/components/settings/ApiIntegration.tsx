
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export const ApiIntegration = () => {
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const apiUrl = "https://tmqgmbnbjklkgeiveanb.supabase.co/functions/v1/data-analysis";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "URL copiada para a área de transferência",
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Validar se é um JSON válido
      const parsedData = JSON.parse(jsonData);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
        body: JSON.stringify(parsedData),
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data = await response.json();

      toast({
        title: "Sucesso!",
        description: `Dados enviados para análise. ID: ${data.id}`,
      });

      // Limpar o campo após sucesso
      setJsonData("");
      
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Integração de Dados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
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

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Testar Integração</h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Cole aqui seu JSON de teste..."
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="min-h-[200px] font-mono"
              />
              <Button 
                onClick={handleSubmit} 
                disabled={!jsonData.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? "Enviando..." : "Enviar dados para análise"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
