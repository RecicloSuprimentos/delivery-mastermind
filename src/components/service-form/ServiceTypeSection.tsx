import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";

interface ServiceTypeSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const ServiceTypeSection = ({ form }: ServiceTypeSectionProps) => {
  return (
    <div className="p-4 bg-soft-blue rounded-lg">
      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Tipo de Serviço</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="delivery">Entrega</SelectItem>
                <SelectItem value="pickup">Coleta</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};