import { RouteNameField } from "./RouteNameField";
import { AgentSelect } from "./AgentSelect";
import { DateTimePicker } from "./DateTimePicker";
import { LocationFields } from "./LocationFields";

interface Agent {
  id: string;
  name: string;
  email: string;
}

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
}

interface RouteBasicFieldsProps {
  routeName: string;
  setRouteName: (value: string) => void;
  selectedAgent?: string;
  setSelectedAgent: (value: string) => void;
  date?: Date;
  setDate: (value: Date) => void;
  startLocationType: "operational_base" | "service";
  setStartLocationType: (value: "operational_base" | "service") => void;
  endLocationType: "operational_base" | "service";
  setEndLocationType: (value: "operational_base" | "service") => void;
  selectedStartService?: string;
  setSelectedStartService: (value: string) => void;
  selectedEndService?: string;
  setSelectedEndService: (value: string) => void;
  agents?: Agent[];
  services?: Service[];
  disabled?: boolean;
}

export const RouteBasicFields = ({
  routeName,
  setRouteName,
  selectedAgent,
  setSelectedAgent,
  date,
  setDate,
  startLocationType,
  setStartLocationType,
  endLocationType,
  setEndLocationType,
  selectedStartService,
  setSelectedStartService,
  selectedEndService,
  setSelectedEndService,
  agents,
  services,
  disabled,
}: RouteBasicFieldsProps) => {
  return (
    <div className="space-y-4 pt-16"> {/* Added pt-16 to account for fixed header */}
      <div className="grid grid-cols-2 gap-4">
        <RouteNameField 
          value={routeName} 
          onChange={setRouteName}
          disabled={disabled}
        />
        <AgentSelect 
          agents={agents} 
          value={selectedAgent} 
          onChange={setSelectedAgent}
          disabled={disabled}
        />
      </div>
      <DateTimePicker 
        date={date} 
        onDateChange={setDate}
        disabled={disabled}
      />
      
      <div className="grid grid-cols-2 gap-4">
        <LocationFields
          label="Local de Início"
          locationType={startLocationType}
          onLocationTypeChange={setStartLocationType}
          selectedService={selectedStartService}
          onServiceChange={setSelectedStartService}
          services={services}
          disabled={disabled}
        />
        <LocationFields
          label="Local de Término"
          locationType={endLocationType}
          onLocationTypeChange={setEndLocationType}
          selectedService={selectedEndService}
          onServiceChange={setSelectedEndService}
          services={services}
          disabled={disabled}
        />
      </div>
    </div>
  );
};