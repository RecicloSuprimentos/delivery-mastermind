import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useDuplicateService = () => {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const duplicateService = async (originalId: string) => {
    setIsDuplicating(true);
    try {
      // 1. Obter serviço original completo
      const { data: originalService, error: fetchErr } = await supabase
        .from('services')
        .select('*')
        .eq('id', originalId)
        .single();

      if (fetchErr || !originalService) throw new Error('Serviço não encontrado');

      // 2. Extrair a base do ID
      const currentServiceId = originalService.service_id || '';
      const baseMatch = currentServiceId.match(/^(.*?)(?:\s+[A-Z])?$/);
      const baseId = baseMatch ? baseMatch[1] : currentServiceId;

      // 3. Buscar serviços com essa raiz para calcular a próxima letra
      const { data: familyServices, error: familyErr } = await supabase
        .from('services')
        .select('service_id')
        .ilike('service_id', `${baseId}%`);

      if (familyErr) throw familyErr;

      // 4. Calcular próximo sufixo
      let maxSuffixCode = 64; // A-1
      
      familyServices.forEach(s => {
        if (!s.service_id) return;
        // Escapar o baseId para usar no regex
        const escapedBase = baseId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const match = s.service_id.match(new RegExp(`^${escapedBase}\\s+([A-Z])$`, 'i'));
        
        if (match) {
          const code = match[1].toUpperCase().charCodeAt(0);
          maxSuffixCode = Math.max(maxSuffixCode, code);
        } else if (s.service_id === baseId) {
          // A raiz existe, então no mínimo começamos no 'B'
          maxSuffixCode = Math.max(maxSuffixCode, 65);
        }
      });

      // Se tiver só a raiz (max = 65), o próximo é 66 (B). 
      // Se tiver o B (max = 66), próximo é 67 (C).
      const nextSuffix = String.fromCharCode(maxSuffixCode >= 65 ? maxSuffixCode + 1 : 66);
      const newServiceId = `${baseId} ${nextSuffix}`;

      // 5. Montar novo objeto (sanitizado)
      const { 
        id, created_at, updated_at, 
        completed_at, completion_details, failure_details, 
        assigned_to, status, 
        ...restData 
      } = originalService;

      const newService = {
        ...restData,
        service_id: newServiceId,
        status: 'not-assigned',
      };

      // 6. Inserir
      const { error: insertErr } = await supabase
        .from('services')
        .insert([newService]);

      if (insertErr) throw insertErr;

      // 7. Atualizar UI
      await queryClient.invalidateQueries({ queryKey: ["services"] });
      await queryClient.invalidateQueries({ queryKey: ["services-kanban"] });

      toast({
        title: "Sucesso!",
        description: `Serviço duplicado para ${newServiceId}`,
      });

    } catch (err: any) {
      console.error("Erro ao duplicar:", err);
      toast({
        title: "Erro ao duplicar",
        description: err.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  };

  return { duplicateService, isDuplicating };
};
