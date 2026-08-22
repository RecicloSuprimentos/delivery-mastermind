import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useDashboardStats, Period } from "@/hooks/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Package, CheckCircle2, Truck, AlertCircle, XCircle, TrendingUp } from "lucide-react";

const DashboardPage = () => {
  const [period, setPeriod] = useState<Period>('today');
  const { data, isLoading } = useDashboardStats(period);

  return (
    <div className="min-h-screen bg-gray-50/30">
      <Navigation />
      
      <main className="pt-24 px-4 pb-8 max-w-7xl mx-auto space-y-6">
        {/* Header e Filtros */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Operacional</h1>
            <p className="text-muted-foreground mt-1">Visão geral da operação e desempenho</p>
          </div>
          
          <div className="w-48">
            <Select value={period} onValueChange={(val) => setPeriod(val as Period)}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Selecione o período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading || !data ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground animate-pulse">
            Carregando métricas...
          </div>
        ) : (
          <>
            {/* 1. Cards Principais */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Serviços</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.cards.total}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Entregues</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700">{data.cards.completed}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Em Rota</CardTitle>
                  <Truck className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{data.cards.inTransit}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pendentes</CardTitle>
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{data.cards.pending}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Cancelados</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{data.cards.cancelled}</div>
                </CardContent>
              </Card>
            </div>

            {/* 2. Gráfico e Tabelas Secundárias */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Gráfico de Volume (Ocupa 2 colunas) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-gray-500" />
                    Volume de Serviços (Últimos 7 dias)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f3f4f6' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar 
                          dataKey="count" 
                          name="Serviços" 
                          fill="#0f172a" 
                          radius={[4, 4, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Coluna da Direita (Top Entregadores + Lalamove) */}
              <div className="space-y-6">
                
                {/* Lalamove Cost */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Custo Lalamove ({period === 'today' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      R$ {data.lalamove.totalCost.toFixed(2).replace('.', ',')}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {data.lalamove.orderCount} corridas contratadas
                    </p>
                  </CardContent>
                </Card>

                {/* Top Entregadores */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Desempenho por Entregador</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.topAgents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">Nenhuma entrega concluída no período.</p>
                    ) : (
                      <div className="space-y-4 mt-2">
                        {data.topAgents.map((agent, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-sm">
                                {agent.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm text-gray-900">{agent.name}</span>
                            </div>
                            <span className="text-sm font-semibold bg-gray-100 px-2 py-1 rounded-md text-gray-700">
                              {agent.deliveries}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
