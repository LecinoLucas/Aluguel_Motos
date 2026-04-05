import {
  IMPORT_FIELD_LABELS,
  IMPORT_FIELD_ORDER,
  type PendingImportReview,
} from "./types";

export function formatVehicleYear(ano?: number | string | null, anoModelo?: number | string | null) {
  const anoFabricacao = ano?.toString().trim() || "";
  const anoDoModelo = anoModelo?.toString().trim() || "";
  if (anoFabricacao && anoDoModelo) return `${anoFabricacao}/${anoDoModelo}`;
  return anoFabricacao || anoDoModelo;
}

export function mergeDefined<T extends object>(current: T, incoming: Partial<T>): T {
  const filteredEntries = Object.entries(incoming).filter(([, value]) => {
    return typeof value === "string" ? Boolean(value.trim()) : value !== undefined;
  });

  return {
    ...current,
    ...Object.fromEntries(filteredEntries),
  } as T;
}

export function getImportPreviewEntries(review: PendingImportReview | null) {
  if (!review) return [];
  return IMPORT_FIELD_ORDER[review.kind].map((field) => ({
    key: field,
    label: IMPORT_FIELD_LABELS[field],
    value: review.fields[field]?.trim() || "",
  }));
}
