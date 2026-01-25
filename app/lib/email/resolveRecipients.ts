import type { FormDataValues } from "./htmlBuilder";

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function resolveRecipients(formData: FormDataValues, fallback: string[]): string[] {
  if (formData.requestType === "addShipTo") {
    return uniq(fallback);
  }

  return uniq(fallback);
}
