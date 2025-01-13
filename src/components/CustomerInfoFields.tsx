import { Input } from "@/components/ui/input";
import InputMask from 'react-input-mask';
import { useState, useEffect } from 'react';

interface CustomerInfoFieldsProps {
  customerName: string;
  onCustomerNameChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
}

const CustomerInfoFields = ({
  customerName,
  onCustomerNameChange,
  phone,
  onPhoneChange,
  email,
  onEmailChange
}: CustomerInfoFieldsProps) => {
  const [mask, setMask] = useState("(99) 9999-9999");

  useEffect(() => {
    const digits = phone.replace(/\D/g, '');
    setMask(digits.length <= 10 ? "(99) 9999-9999" : "(99) 99999-9999");
  }, [phone]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onCustomerNameChange(e.target.value.toUpperCase());
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <label className="text-sm font-medium">Nome do Cliente</label>
        <Input
          required
          value={customerName}
          onChange={handleNameChange}
          placeholder="Nome completo"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label className="text-sm font-medium">Telefone</label>
          <InputMask
            mask={mask}
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
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
        <div className="space-y-1">
          <label className="text-sm font-medium">E-mail</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="email@exemplo.com"
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoFields;