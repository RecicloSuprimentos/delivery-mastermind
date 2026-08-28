import { useState } from "react";
import { MoreVertical, FileEdit, Undo, Trash2, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);

  const handleConfirmDuplicate = async () => {
    await duplicateService(serviceId);
    setShowDuplicateDialog(false);
  };

  return (
    <>
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
            onClick={() => setShowDuplicateDialog(true)}
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

      <AlertDialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Duplicação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja duplicar este serviço? Uma cópia será gerada na coluna "Não Atribuído" recebendo um sufixo (A, B, C...) no ID original.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDuplicating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Evita fechamento automático para visualizar o loading
                handleConfirmDuplicate();
              }}
              disabled={isDuplicating}
              className="bg-primary hover:bg-primary/90"
            >
              {isDuplicating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Duplicando...
                </>
              ) : (
                'Duplicar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
