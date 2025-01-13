import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';

interface CustomerInfoFieldsProps {
  customerName: string;
  setCustomerName: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
}

const CustomerInfoFields = ({
  customerName,
  setCustomerName,
  phone,
  setPhone,
  email,
  setEmail,
}: CustomerInfoFieldsProps) => {
  return (
    <>
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
          <InputMask
            mask="(99) 9999-99999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                required
                placeholder="(00) 0000-0000"
              />
            )}
          </InputMask>
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
    </>
  );
};

export default CustomerInfoFields;