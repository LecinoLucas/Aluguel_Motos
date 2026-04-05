export function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export function normalizeCpf(value: string) {
  return onlyDigits(value).slice(0, 11);
}

export function normalizeCnh(value: string) {
  return onlyDigits(value).slice(0, 11);
}

export function normalizeCep(value: string) {
  return onlyDigits(value).slice(0, 8);
}

export function normalizeTelefone(value: string) {
  return onlyDigits(value).slice(0, 11);
}

export function normalizeRg(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 16);
}

export function normalizePlaca(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 7);
}

export function normalizeChassi(value: string) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 17);
}

export function normalizeRenavam(value: string) {
  return onlyDigits(value).slice(0, 11);
}
