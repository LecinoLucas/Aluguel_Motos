export function clearFieldError<TField extends string>(
  errors: Partial<Record<TField, string>>,
  field: TField,
) {
  if (!errors[field]) {
    return errors;
  }

  const nextErrors = { ...errors };
  delete nextErrors[field];
  return nextErrors;
}

export function getFirstInlineError<TField extends string>(errors: Partial<Record<TField, string>>) {
  return Object.values(errors).find((value): value is string => Boolean(value));
}

export function mapFieldErrors<TField extends string>(fieldErrors: Record<string, string>) {
  const nextErrors: Partial<Record<TField, string>> = {};

  for (const [field, message] of Object.entries(fieldErrors)) {
    nextErrors[field as TField] = message;
  }

  return nextErrors;
}