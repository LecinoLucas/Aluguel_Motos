export function formatCpfInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

export function formatCpfDisplay(value?: string | null) {
  if (!value) return "-";
  return formatCpfInput(value);
}

export function formatCepInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function formatCepDisplay(value?: string | null) {
  if (!value) return "-";
  return formatCepInput(value);
}

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function formatPhoneDisplay(value?: string | null) {
  if (!value) return "-";
  return formatPhoneInput(value);
}

export function formatPlateInput(value: string) {
  const cleaned = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);

  if (cleaned.length <= 3) return cleaned;

  const prefix = cleaned.slice(0, 3);
  const suffix = cleaned.slice(3);

  if (/^\d{0,4}$/.test(suffix)) {
    return `${prefix}-${suffix}`;
  }

  return `${prefix}${suffix}`;
}

export function formatPlateDisplay(value?: string | null) {
  if (!value) return "-";
  return formatPlateInput(value);
}

export function formatCnhInput(value: string) {
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatCnhDisplay(value?: string | null) {
  if (!value) return "-";
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatRgInput(value: string) {
  const cleaned = value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 9);

  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 5) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
  if (cleaned.length <= 8) return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;

  return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}-${cleaned.slice(8)}`;
}

export function formatRgDisplay(value?: string | null) {
  if (!value) return "-";
  return formatRgInput(value);
}

export function formatRenavamDisplay(value?: string | null) {
  if (!value) return "-";
  return value.replace(/\D/g, "").slice(0, 11);
}

export function formatChassiDisplay(value?: string | null) {
  if (!value) return "-";
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 17);
}
