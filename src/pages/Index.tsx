import { Navigation } from "@/components/Navigation";
import { KanbanBoard } from "@/components/KanbanBoard";

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto p-4 pt-20">
        <KanbanBoard />
      </div>
    </div>
  );
};

export default Index;