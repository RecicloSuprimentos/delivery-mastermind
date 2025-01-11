import { Bell, Map, MessageSquare, Search, Settings, User, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export const Navigation = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <PlusCircle className="h-5 w-5" />
                  SERVIÇO
                </Button>
              </DialogTrigger>
            </Dialog>
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