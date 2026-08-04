
import { Navigation } from "@/components/Navigation";
import { KanbanBoard } from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LayoutGrid, List } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-white">
      <Navigation showSearch={true} searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <div className="pt-[73px] h-screen flex flex-col">
        <KanbanBoard searchTerm={searchTerm} />
      </div>
    </div>
  );
};

export default Index;
