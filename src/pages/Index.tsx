import { Navigation } from "@/components/Navigation";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-16">
        {/* Filters */}
        <div className="border-b border-gray-200 bg-white p-4">
          <div className="flex items-center space-x-4">
            <Input
              type="text"
              placeholder="Digite para filtrar ..."
              className="max-w-xs"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary">Tamanho</span>
              <Button variant="outline" size="icon">
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <List className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary">Ordenar por</span>
              <Button variant="outline" className="text-sm">
                Data de criação
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary">Agrupar por</span>
              <Button variant="outline" className="text-sm">
                Selecione
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary">Colunas</span>
              <Button variant="outline" className="text-sm">
                Todas
              </Button>
            </div>
            <Button variant="outline" className="text-sm">
              Cards
            </Button>
          </div>
        </div>
        
        {/* Kanban Board */}
        <KanbanBoard />
      </div>
    </div>
  );
};

export default Index;