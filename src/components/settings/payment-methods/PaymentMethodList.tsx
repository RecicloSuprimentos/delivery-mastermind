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

interface PaymentMethod {
  id: string;
  name: string;
  is_active: boolean;
}

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  onToggleActive: (id: string, currentStatus: boolean) => Promise<void>;
  onEdit: (paymentMethod: PaymentMethod) => void;
  onDelete: (id: string) => Promise<void>;
}

export function PaymentMethodList({ 
  paymentMethods, 
  onToggleActive, 
  onEdit,
  onDelete 
}: PaymentMethodListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Ativo</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {paymentMethods?.map((method) => (
          <TableRow key={method.id}>
            <TableCell>{method.name}</TableCell>
            <TableCell>
              <Switch
                checked={method.is_active}
                onCheckedChange={() => onToggleActive(method.id, method.is_active)}
              />
            </TableCell>
            <TableCell className="space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(method)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(method.id)}
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