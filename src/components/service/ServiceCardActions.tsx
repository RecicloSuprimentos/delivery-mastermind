import { MoreVertical, FileEdit, Undo, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useDuplicateService } from "@/hooks/services/useDuplicateService";

interface ServiceCardActionsProps {
  serviceId: string;
  status: string;
  onDelete: () => void;
  onUnassign: () => void;
}

export const ServiceCardActions = ({
  serviceId,
  status,
  onDelete,
  onUnassign,
}: ServiceCardActionsProps) => {
  const navigate = useNavigate();
  const { duplicateService, isDuplicating } = useDuplicateService();

  return (
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
          onClick={() => navigate(`/new-service/${serviceId}`)}
          className="hover:bg-gray-100 cursor-pointer"
        >
          <FileEdit className="h-4 w-4 mr-2" />
          Editar
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => duplicateService(serviceId)}
          disabled={isDuplicating}
          className="hover:bg-gray-100 cursor-pointer"
        >
          <Copy className="h-4 w-4 mr-2" />
          Duplicar
        </DropdownMenuItem>

        {status === "assigned" && (
          <DropdownMenuItem 
            onClick={onUnassign}
            className="hover:bg-gray-100 cursor-pointer"
          >
            <Undo className="h-4 w-4 mr-2" />
            Desatribuir
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={onDelete}
          className="text-destructive hover:bg-gray-100 cursor-pointer"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};