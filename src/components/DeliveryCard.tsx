import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import AddressSearch from "./AddressSearch";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Location {
  lat: number;
  lng: number;
}

interface DeliveryCardProps {
  code?: string;
  customer?: string;
  address?: string;
  phone?: string;
  status?: "not-assigned" | "assigned" | "accepted" | "in-transit" | "arrived" | "completed";
  onSuccess?: () => void;
}

const DeliveryCard = ({ code, customer, address, phone, status, onSuccess }: DeliveryCardProps) => {
  const [addressValue, setAddress] = useState("");
  const [location, setLocation] = useState<Location | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [phoneValue, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [complement, setComplement] = useState("");
  const [timeWindow, setTimeWindow] = useState("");
  const [observations, setObservations] = useState("");
  const [type, setType] = useState<"coleta" | "entrega">("entrega");

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      console.error("Por favor, selecione um endereço válido");
      return;
    }

    try {
      const serviceId = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const { error } = await supabase.from("services").insert({
        type,
        service_id: serviceId,
        customer_name: customerName,
        phone: phoneValue,
        email,
        address: addressValue,
        complement,
        time_window: timeWindow,
        observations,
        latitude: location.lat,
        longitude: location.lng,
        status: "not-assigned"
      });

      if (error) throw error;

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating service:", error);
    }
  };

  // Se for um card de visualização, retorna o layout de card
  if (code) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <h3 className="font-semibold">{customer}</h3>
          <p className="text-sm text-gray-600">{address}</p>
          <p className="text-sm text-gray-600">{phone}</p>
        </CardContent>
      </Card>
    );
  }

  // Se não tiver código, é o formulário de criação
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <Button
          type="button"
          variant={type === "coleta" ? "default" : "outline"}
          onClick={() => setType("coleta")}
          className="w-full"
        >
          Coleta
        </Button>
        <Button
          type="button"
          variant={type === "entrega" ? "default" : "outline"}
          onClick={() => setType("entrega")}
          className="w-full"
        >
          Entrega
        </Button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Nome do Cliente</label>
        <Input
          required
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nome completo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Telefone</label>
          <Input
            required
            value={phoneValue}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Endereço</label>
        <AddressSearch
          value={addressValue}
          onChange={setAddress}
          onLocationSelect={handleLocationSelect}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Complemento</label>
        <Input
          value={complement}
          onChange={(e) => setComplement(e.target.value)}
          placeholder="Apartamento, sala, etc."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Janela de Horário</label>
        <Input
          value={timeWindow}
          onChange={(e) => setTimeWindow(e.target.value)}
          placeholder="Ex: 14h às 18h"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Observações</label>
        <Textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Informações adicionais"
        />
      </div>

      <Button type="submit" className="w-full">
        Criar Serviço
      </Button>
    </form>
  );
};

export default DeliveryCard;