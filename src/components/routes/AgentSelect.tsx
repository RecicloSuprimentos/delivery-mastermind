import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Agent {
  id: string;
  name: string;
  email: string;
}

interface AgentSelectProps {
  agents?: Agent[];
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const AgentSelect = ({ agents, value, onChange, disabled }: AgentSelectProps) => {
  return (
    <div>
      <Label>Agente Responsável</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="bg-white">
          <SelectValue placeholder="Selecione um agente" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          {agents?.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              {agent.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};