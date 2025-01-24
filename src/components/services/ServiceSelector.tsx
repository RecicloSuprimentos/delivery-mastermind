import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Service } from "@/types/routes";

interface ServiceSelectorProps {
  selectedServices: Service[];
  onChange: (services: Service[]) => void;
}

export const ServiceSelector = ({ selectedServices, onChange }: ServiceSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: services } = useQuery({
    queryKey: ["available-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("status", "not-assigned");

      if (error) throw error;
      return data as Service[];
    },
  });

  const filteredServices = services?.filter(
    (service) =>
      service.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.service_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleService = (service: Service) => {
    const isSelected = selectedServices.some((s) => s.id === service.id);
    if (isSelected) {
      onChange(selectedServices.filter((s) => s.id !== service.id));
    } else {
      onChange([...selectedServices, service]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4">
        <div className="space-y-4">
          {filteredServices?.map((service) => {
            const isSelected = selectedServices.some((s) => s.id === service.id);
            return (
              <div
                key={service.id}
                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{service.customer_name}</span>
                    <Badge variant={service.type === "coleta" ? "default" : "secondary"}>
                      {service.type === "coleta" ? "Coleta" : "Entrega"}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>{service.address}</p>
                    <p>ID: {service.service_id}</p>
                  </div>
                </div>
                <Button
                  variant={isSelected ? "secondary" : "outline"}
                  onClick={() => toggleService(service)}
                >
                  {isSelected ? "Remover" : "Adicionar"}
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};