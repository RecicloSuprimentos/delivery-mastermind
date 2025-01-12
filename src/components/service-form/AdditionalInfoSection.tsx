import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ServiceFormValues } from "./types";
import { IMaskInput } from "react-imask";

interface AdditionalInfoSectionProps {
  form: UseFormReturn<ServiceFormValues>;
}

export const AdditionalInfoSection = ({ form }: AdditionalInfoSectionProps) => {
  return (
    <div className="grid grid-cols-2 gap-6 p-4 bg-soft-purple rounded-lg">
      <FormField
        control={form.control}
        name="timeWindow"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-medium">Intervalo de Horário</FormLabel>
            <FormControl>
              <IMaskInput
                mask="00:00 hs às 00:00 hs"
                unmask={false}
                value={field.value}
                onAccept={(value) => field.onChange(value)}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                placeholder="Ex: 08:00 hs às 12:00 hs"
              />
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
                placeholder="Digite uma observação (opcional)"
                className="bg-white h-10"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};