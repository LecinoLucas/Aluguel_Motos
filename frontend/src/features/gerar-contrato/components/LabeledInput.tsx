import { Input } from "@/components/ui/input";

interface LabeledInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}

export function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  className = "",
}: LabeledInputProps) {
  return (
    <div className={`contract-field ${className}`.trim()}>
      <label className="contract-field__label">{label}</label>
      <Input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="contract-field__input"
      />
    </div>
  );
}
