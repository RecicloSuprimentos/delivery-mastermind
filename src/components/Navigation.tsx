import { MapPin, Settings, User, PlusCircle, LogOut, Route, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

interface NavigationProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
}

export const Navigation = ({ searchTerm, onSearchChange, showSearch }: NavigationProps) => {
  const navigate = useNavigate();
  const [localSearch, setLocalSearch] = useState(searchTerm || "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincroniza de fora para dentro (quando o pai limpa o filtro)
  useEffect(() => {
    setLocalSearch(searchTerm || "");
  }, [searchTerm]);

  // Debounce de 500ms: só notifica o pai depois que o usuário parou de digitar
  const handleChange = (value: string) => {
    setLocalSearch(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(value);
      }
    }, 500);
  };

  const handleClear = () => {
    setLocalSearch("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (onSearchChange) onSearchChange("");
  };

  // Limpar timer ao desmontar
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

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
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-primary hover:opacity-90 transition-opacity mr-12">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-auto"
              />
              ROTERIZADOR
            </Link>
            <div className="flex space-x-4">
              <Button variant="ghost" onClick={() => navigate('/routes')}>
                ROTAS
              </Button>
              <Button variant="ghost" onClick={() => navigate('/realtime')}>
                TEMPO REAL
              </Button>
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                DASHBOARD
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {showSearch && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Digite para filtrar ..."
                  className="pl-9 pr-8 py-2 w-64 bg-gray-50 border-gray-200"
                  value={localSearch}
                  onChange={(e) => handleChange(e.target.value)}
                />
                {localSearch && (
                  <button
                    onClick={handleClear}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Limpar busca"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            
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
