import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LayoutGrid, List, Route, MapPin, Truck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Route {
  id: string;
  name: string;
  agent_id: string;
  start_time: string;
  status: string;
  total_distance?: number;
  total_duration?: number;
  agent?: {
    name: string;
  };
}

const Index = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        agent:system_users(name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching routes:", error);
      return;
    }

    if (data) {
      setRoutes(data);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'assigned': return 'bg-blue-100 text-blue-700';
      case 'in-progress': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
        {/* Header with actions */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Rotas</h1>
            <Button onClick={() => navigate('/routes/new')} className="bg-primary">
              Nova Rota
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Buscar rotas..."
              className="max-w-xs"
            />
            <div className="flex items-center space-x-2">
              <Button 
                variant={view === 'grid' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={view === 'list' ? 'default' : 'outline'} 
                size="icon"
                onClick={() => setView('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Routes Grid/List */}
        <div className={`p-6 ${view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}`}>
          {routes.map((route) => (
            <Card 
              key={route.id} 
              className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/routes/${route.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <Route className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">{route.name}</h3>
                  </div>
                  <div className="mt-2 space-y-1 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>{route.agent?.name || 'Sem agente'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {route.total_distance 
                          ? `${(route.total_distance / 1000).toFixed(1)} km`
                          : 'Distância não calculada'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${getStatusColor(route.status)}`}>
                  {route.status}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;