import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from "date-fns";

export type Period = 'today' | 'week' | 'month';

export const useDashboardStats = (period: Period) => {
  return useQuery({
    queryKey: ["dashboard-stats", period],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'today':
          startDate = startOfDay(now);
          break;
        case 'week':
          startDate = startOfWeek(now, { weekStartsOn: 1 }); // Começa na segunda
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
      }

      const startDateStr = startDate.toISOString();

      // 1. Serviços criados no período (usado para métricas de criação)
      const { data: createdServices, error: servicesErr } = await supabase
        .from('services')
        .select('status, created_at')
        .gte('created_at', startDateStr);
        
      if (servicesErr) {
        console.warn('[Dashboard] Erro ao buscar serviços criados:', servicesErr.message);
      }

      // 2. Serviços concluídos no período e seus agentes (usado para Entregues e Top Entregadores)
      const { data: completedServices, error: agentErr } = await supabase
        .from('services')
        .select(`
          id,
          agent_id,
          agent:system_users(id, name)
        `)
        .eq('status', 'completed')
        .gte('completed_at', startDateStr);

      if (agentErr) {
        console.warn('[Dashboard] Erro ao buscar serviços concluídos/agentes:', agentErr.message);
      }

      // 3. Gráfico de volume (últimos 7 dias, fixo) - Contabiliza criações
      const sevenDaysAgo = subDays(startOfDay(now), 6).toISOString();
      const { data: last7DaysServices, error: chartErr } = await supabase
        .from('services')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      if (chartErr) {
        console.warn('[Dashboard] Erro ao buscar dados do gráfico:', chartErr.message);
      }

      // Agrupar para o gráfico
      const volumeData = Array.from({ length: 7 }).map((_, i) => {
        const d = subDays(startOfDay(now), 6 - i);
        return {
          date: format(d, 'dd/MM'),
          dateStr: d.toISOString().split('T')[0],
          count: 0
        };
      });

      last7DaysServices?.forEach(s => {
        if (!s.created_at) return;
        const dateStr = s.created_at.split('T')[0];
        const dayItem = volumeData.find(d => d.dateStr === dateStr);
        if (dayItem) dayItem.count++;
      });

      // 4. Custos Lalamove - bypass de tipagem com (supabase as any)
      const { data: lalaOrders, error: lalaErr } = await (supabase as any)
        .from('lalamove_orders')
        .select('total_price')
        .gte('created_at', startDateStr);

      if (lalaErr) {
        console.warn('[Dashboard] lalamove_orders indisponível ou erro:', lalaErr.message);
      }

      const totalLalamoveCost = (lalaOrders || []).reduce((acc: number, order: any) => {
        return acc + (order.total_price ? Number(order.total_price) : 0);
      }, 0);

      // 5. Desempenho por agente - Baseado nos concluídos no período
      const agentCounts: Record<string, number> = {};
      completedServices?.forEach((s: any) => {
        // O supabase client com alias retorna o objeto dentro da propriedade do alias
        const agentName = s.agent?.name || 'Não Atribuído';
        agentCounts[agentName] = (agentCounts[agentName] || 0) + 1;
      });

      const topAgents = Object.entries(agentCounts)
        .map(([name, deliveries]) => ({ name, deliveries }))
        .sort((a, b) => b.deliveries - a.deliveries)
        .slice(0, 5);


      // Consolidar resultados
      return {
        cards: {
          total: createdServices?.length || 0,
          completed: completedServices?.length || 0, // Agora conta os finalizados no período de fato
          inTransit: createdServices?.filter(s => ['assigned', 'accepted', 'in-transit', 'arrived'].includes(s.status || '')).length || 0,
          pending: createdServices?.filter(s => s.status === 'not-assigned').length || 0,
          cancelled: createdServices?.filter(s => s.status === 'cancelled').length || 0,
        },
        chartData: volumeData,
        lalamove: {
          totalCost: totalLalamoveCost,
          orderCount: lalaOrders?.length || 0
        },
        topAgents
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos cache
  });
};
