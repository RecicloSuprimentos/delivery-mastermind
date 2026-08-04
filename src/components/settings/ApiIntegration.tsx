
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processService, ServiceData } from "@/utils/serviceProcessor";

export const ApiIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /**
   * [LLM CONTEXT]
   * A URL base agora é obtida dinamicamente do ambiente (VITE_SUPABASE_URL).
   * Isso evita "Hardcoded URLs", garantindo que, independentemente de estarmos rodando
   * com proxy reverso (Nginx) ou desenvolvimento local, a exibição na interface
   * seja consistente com a rota de API utilizada pelo cliente Supabase.
   */
  const baseUrl = import.meta.env.VITE_SUPABASE_URL || "https://supabase.mgbase.com.br";
  const apiUrl = `${baseUrl}/rest/v1/services`;

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
      const servicesData: ServiceData[] = Array.isArray(parsedData) ? parsedData : [parsedData];
      
      /**
       * [LLM CONTEXT]
       * Etapa 1: Salvar o raw_data para auditoria (tabela integration_data_analysis).
       * Isso é essencial para debug caso o JSON recebido de terceiros possua anomalias.
       */
      const { error: integrationError } = await supabase
        .from('integration_data_analysis')
        .insert({ raw_data: parsedData });
        
      if (integrationError) throw integrationError;

      /**
       * [LLM CONTEXT]
       * Etapa 2: Processamento e inserção usando Promise.allSettled.
       * Decisão de Arquitetura: Em operações em lote via integração (JSON import), 
       * um serviço quebrado (ex: sem telefone) NÃO deve travar a inserção dos serviços válidos.
       * O Promise.allSettled garante que avaliaremos o resultado (fulfilled/rejected) individualmente.
       */
      const results = await Promise.allSettled(
        servicesData.map(async (service) => {
          // Processa localmente (formatação, etc) usando a função que encapsula a regra de negócios
          const processedService = await processService(service, supabase);
          
          // Insere individualmente
          const { data, error } = await supabase
            .from('services')
            .insert(processedService)
            .select()
            .single();
            
          if (error) throw error;
          return data;
        })
      );

      // Agrupamento de sucessos e falhas para feedback visual
      const successful = results.filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled');
      const failed = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected');

      if (failed.length > 0) {
        console.error('Alguns serviços falharam na importação:', failed.map(f => f.reason));
        toast({
          title: successful.length > 0 ? "Processamento Parcial" : "Erro no Processamento",
          description: `${successful.length} salvos com sucesso. ${failed.length} falharam. Verifique os logs do console.`,
          variant: successful.length > 0 ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Sucesso Absoluto!",
          description: `Todos os ${successful.length} serviços foram criados e processados perfeitamente.`,
        });
      }

      // Limpar o campo caso pelo menos um tenha sido inserido com sucesso
      if (successful.length > 0) {
        setJsonData("");
        queryClient.invalidateQueries({ queryKey: ["services"] });
        queryClient.invalidateQueries({ queryKey: ["services-kanban"] });
      }
      
    } catch (error) {
      console.error('Erro catastrofico ao processar dados:', error);
      toast({
        title: "Erro de Estrutura",
        description: error instanceof Error ? error.message : "Erro ao ler o JSON",
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
                {isLoading ? "Processando..." : "Enviar dados para análise"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
