import { Navigation } from "@/components/Navigation";
import { KanbanBoard } from "@/components/KanbanBoard";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DeliveryCard from "@/components/DeliveryCard";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [isCreateServiceOpen, setIsCreateServiceOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="min-h-screen bg-background">
      <Navigation onCreateService={() => setIsCreateServiceOpen(true)} />
      <main className="pt-16">
        <KanbanBoard />
      </main>

      <Dialog open={isCreateServiceOpen} onOpenChange={setIsCreateServiceOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Criar Novo Serviço</h2>
            <DeliveryCard onSuccess={() => {
              setIsCreateServiceOpen(false);
              toast({
                title: "Sucesso",
                description: "Serviço criado com sucesso!",
              });
            }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;