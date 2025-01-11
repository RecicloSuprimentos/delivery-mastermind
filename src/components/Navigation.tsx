import { Bell, Map, MessageSquare, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Navigation = () => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-50">
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src="/lovable-uploads/f898aedd-9ace-4deb-9dbd-9472ed5ad258.png" alt="Reciclo Logo" className="h-8" />
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
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Button variant="outline">SERVIÇO</Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Map className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};