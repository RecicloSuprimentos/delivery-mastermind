import { Navigation } from "@/components/Navigation";
import { AgentLocationMap } from "@/components/monitoring/AgentLocationMap";
import { AgentsList } from "@/components/monitoring/AgentsList";

const RealTimeMonitoring = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <div className="container mx-auto p-4 pt-20">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2">
            <AgentLocationMap />
          </div>
          <div>
            <AgentsList />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;