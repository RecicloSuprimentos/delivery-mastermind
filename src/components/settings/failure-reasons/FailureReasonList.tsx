import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { ServiceFailureReason } from "@/types/routes";

interface FailureReasonListProps {
  reasons: ServiceFailureReason[];
  onToggleActive: (id: string, currentStatus: boolean) => Promise<void>;
  onEdit: (reason: ServiceFailureReason) => void;
  onDelete: (id: string) => Promise<void>;
}

export function FailureReasonList({ 
  reasons, 
  onToggleActive, 
  onEdit,
  onDelete 
}: FailureReasonListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Motivo</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reasons?.map((reason) => (
          <TableRow key={reason.id}>
            <TableCell>{reason.reason}</TableCell>
            <TableCell>{reason.is_other ? "Outros" : "Predefinido"}</TableCell>
            <TableCell>
              <Switch
                checked={reason.is_active}
                onCheckedChange={() => onToggleActive(reason.id, reason.is_active)}
              />
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(reason)}
                disabled={reason.is_other}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(reason.id)}
                disabled={reason.is_other}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}