import { useState } from "react";
import { MapPin, Phone, Clock, FileEdit, ChevronDown, ChevronUp, Trash2, Check, MoreVertical, Undo } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Service {
  id: string;
  type: "coleta" | "entrega";
  service_id: string;
  customer_name: string;
  address: string;
  phone: string;
  email?: string;
  complement?: string;
  time_window?: string;
  observations?: string;
  status: string;
}

interface ServiceCardProps {
  service: Service;
  onUpdate: () => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const ServiceCard = ({ service, onUpdate, isSelected, onSelect }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja excluir este serviço?")) {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", service.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir serviço",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Serviço excluído com sucesso",
      });
      onUpdate();
    }
  };

  const handleUnassign = async () => {
    if (window.confirm("Tem certeza que deseja desatribuir este serviço?")) {
      const { error } = await supabase
        .from("services")
        .update({ status: "not-assigned" })
        .eq("id", service.id);

      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao desatribuir serviço",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Serviço desatribuído com sucesso",
      });
      onUpdate();
    }
  };

  const handleEdit = () => {
    navigate(`/new-service/${service.id}`);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(service.id);
    }
  };

  return (
    <Card className={`mb-2 overflow-hidden ${isSelected ? 'border-primary border-2' : 'bg-white'}`}>
      <div className="p-3">
        <div className="flex justify-between items-start mb-1">
          {service.status === "not-assigned" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSelect}
              className={`${isSelected ? "text-primary" : "text-gray-500"} -ml-2`}
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <div className="flex-1 ml-2">
            <div className="font-medium text-base">
              {service.type === "coleta" ? "COLETA" : "ENTREGA"} {service.service_id}
            </div>
            <div className="font-medium text-base">{service.customer_name}</div>
          </div>
          {(service.status === "not-assigned" || service.status === "assigned") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-white shadow-lg border border-gray-200 rounded-md z-50"
              >
                <DropdownMenuItem 
                  onClick={handleEdit}
                  className="hover:bg-gray-100 cursor-pointer"
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                {service.status === "assigned" && (
                  <DropdownMenuItem 
                    onClick={handleUnassign}
                    className="hover:bg-gray-100 cursor-pointer"
                  >
                    <Undo className="h-4 w-4 mr-2" />
                    Desatribuir
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={handleDelete} 
                  className="text-destructive hover:bg-gray-100 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="text-sm">{service.address}</span>
        </div>

        <div className="flex items-center justify-between text-gray-600">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0" />
            <span className="text-sm">{service.phone}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 -mr-1"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-2 space-y-2 border-t pt-2">
            {service.time_window && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 shrink-0" />
                <span className="text-sm">{service.time_window}</span>
              </div>
            )}
            
            {service.observations && (
              <div className="flex items-start gap-2 text-gray-600">
                <FileEdit className="h-4 w-4 mt-1 shrink-0" />
                <span className="text-sm">{service.observations}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceCard;