interface MapControlsProps {
  showAgents: boolean;
  setShowAgents: (show: boolean) => void;
  showBases: boolean;
  setShowBases: (show: boolean) => void;
  showServices: boolean;
  setShowServices: (show: boolean) => void;
  showUnassignedServices: boolean;
  setShowUnassignedServices: (show: boolean) => void;
}

export function MapControls({
  showAgents,
  setShowAgents,
  showBases,
  setShowBases,
  showServices,
  setShowServices,
  showUnassignedServices,
  setShowUnassignedServices,
}: MapControlsProps) {
  return (
    <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
      <div className="space-y-2 text-sm">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAgents}
            onChange={(e) => setShowAgents(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Agentes</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showBases}
            onChange={(e) => setShowBases(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Bases Operacionais</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showServices}
            onChange={(e) => setShowServices(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Serviços</span>
        </label>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnassignedServices}
            onChange={(e) => setShowUnassignedServices(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Serviços não atribuídos</span>
        </label>
      </div>
    </div>
  );
}