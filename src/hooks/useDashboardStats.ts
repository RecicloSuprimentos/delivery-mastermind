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

      // 1. Serviços (Cards de status)
      const { data: services, error: servicesErr } = await supabase
        .from('services')
        .select('status, created_at')
        .gte('created_at', startDateStr);
        
      if (servicesErr) throw servicesErr;

      // 2. Gráfico de volume (últimos 7 dias, fixo)
      const sevenDaysAgo = subDays(startOfDay(now), 6).toISOString();
      const { data: last7DaysServices, error: chartErr } = await supabase
        .from('services')
        .select('created_at')
        .gte('created_at', sevenDaysAgo);

      if (chartErr) throw chartErr;

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

      // 3. Custos Lalamove
      const { data: lalaOrders, error: lalaErr } = await supabase
        .from('lalamove_orders')
        .select('total_price')
        .gte('created_at', startDateStr);

      if (lalaErr) throw lalaErr;

      const totalLalamoveCost = (lalaOrders || []).reduce((acc, order) => {
        return acc + (order.total_price ? Number(order.total_price) : 0);
      }, 0);

      // 4. Desempenho por agente
      // Usaremos os serviços completados neste período, que têm o completed_at e completion_details
      const { data: completedServices, error: agentErr } = await supabase
        .from('services')
        .select('completion_details')
        .eq('status', 'completed')
        .gte('completed_at', startDateStr)
        .not('completion_details', 'is', null);

      if (agentErr) throw agentErr;

      const agentCounts: Record<string, number> = {};
      completedServices?.forEach(s => {
        const details = s.completion_details as { responsibleName?: string };
        if (details && details.responsibleName) {
          const name = details.responsibleName;
          agentCounts[name] = (agentCounts[name] || 0) + 1;
        }
      });

      const topAgents = Object.entries(agentCounts)
        .map(([name, deliveries]) => ({ name, deliveries }))
        .sort((a, b) => b.deliveries - a.deliveries)
        .slice(0, 5);

      // Consolidar resultados
      return {
        cards: {
          total: services?.length || 0,
          completed: services?.filter(s => s.status === 'completed').length || 0,
          inTransit: services?.filter(s => ['assigned', 'accepted', 'in-transit', 'arrived'].includes(s.status || '')).length || 0,
          pending: services?.filter(s => s.status === 'not-assigned').length || 0,
          cancelled: services?.filter(s => s.status === 'cancelled').length || 0,
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
