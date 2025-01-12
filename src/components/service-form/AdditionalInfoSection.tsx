import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";

interface AdditionalInfoSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const AdditionalInfoSection = ({ form }: AdditionalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="timeWindow"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Intervalo de Horário</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ex: 09:00 - 12:00" className="bg-white" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Observações</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Digite observações adicionais"
                className="min-h-[100px] bg-white resize-none"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};