import { MapPin, Settings, User, PlusCircle, LogOut, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleServiceClick = () => {
    navigate('/new-service');
  };

  const handleRouteClick = () => {
    navigate('/routes/new');
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary">ROTERIZADOR</span>
            <div className="ml-8 flex space-x-4">
              <Button variant="ghost">PLANEJAMENTO</Button>
              <Button variant="ghost">TEMPO REAL</Button>
              <Button variant="ghost">ANÁLISE</Button>
              <Button variant="ghost">COMUNICAÇÃO</Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Pesquisar..."
                className="pl-10 pr-4 py-2 w-64"
              />
            </div>
            <Button 
              variant="default" 
              className="gap-2 bg-black hover:bg-black/90"
              onClick={handleServiceClick}
            >
              <PlusCircle className="h-5 w-5" />
              SERVIÇO
            </Button>
            <Button 
              variant="default" 
              className="gap-2 bg-black hover:bg-black/90"
              onClick={handleRouteClick}
            >
              <Route className="h-5 w-5" />
              CRIAR ROTA
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MapPin className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white">
                <DropdownMenuItem onClick={handleSettingsClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};