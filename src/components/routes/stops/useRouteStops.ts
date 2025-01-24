import { useState } from "react";
import type { Service } from "@/types/routes";

interface UseRouteStopsProps {
  services: Service[];
  selectedStops: Service[];
  onStopsChange: (stops: Service[]) => void;
  disabled?: boolean;
}

export const useRouteStops = ({
  services,
  selectedStops,
  onStopsChange,
  disabled,
}: UseRouteStopsProps) => {
  const handleAddStop = (service: Service) => {
    if (!selectedStops.find(s => s.id === service.id) && !disabled) {
      onStopsChange([...selectedStops, service]);
    }
  };

  const handleAddAllStops = () => {
    if (disabled) return;
    
    const availableServices = services.filter(
      service => !selectedStops.find(s => s.id === service.id)
    );
    
    onStopsChange([...selectedStops, ...availableServices]);
  };

  const handleRemoveStop = (serviceId: string) => {
    if (!disabled) {
      onStopsChange(selectedStops.filter(s => s.id !== serviceId));
    }
  };

  const handleInvertStops = () => {
    if (!disabled) {
      onStopsChange([...selectedStops].reverse());
    }
  };

  const getAvailableServices = () => {
    return services.filter(service => !selectedStops.find(s => s.id === service.id));
  };

  return {
    handleAddStop,
    handleAddAllStops,
    handleRemoveStop,
    handleInvertStops,
    getAvailableServices,
  };
};