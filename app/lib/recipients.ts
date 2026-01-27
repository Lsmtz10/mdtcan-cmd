import {
  EMAIL_TARGETS,
  LOW_ANNUAL_PURCHASE_VALUES,
  RESEND_BCC,
} from "@/app/lib/emailTargets";

export type RecipientResult = { to: string[]; cc?: string[]; bcc?: string[] };

type FormDataValues = Record<string, string>;

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function isAddShipToRequest(value: string): boolean {
  const normalized = normalize(value).replace(/\s+/g, " ");
  return (
    normalized === "addshipto" ||
    normalized === "add a ship-to to an existing account"
  );
}

function isNet30(value: string): boolean {
  const normalized = normalize(value).replace(/\s+/g, "");
  return normalized === "net30";
}

function isYes(value: string): boolean {
  return normalize(value) === "yes";
}

function isNo(value: string): boolean {
  return normalize(value) === "no";
}

function isLowAnnualPurchase(value: string): boolean {
  if (!value) return false;
  if (LOW_ANNUAL_PURCHASE_VALUES.has(value)) return true;
  const normalized = value.toLowerCase().replace(/\s+/g, "");
  if (normalized.startsWith(">")) return false;
  if (normalized.startsWith("<=")) return true;
  return false;
}

function dedupe(values: string[]): string[] {
  return Array.from(new Set(values));
}

function finalizeRecipients(to: string[], cc: string[]): RecipientResult {
  const uniqueTo = dedupe(to);
  const toSet = new Set(uniqueTo);
  const uniqueCc = dedupe(cc).filter((email) => !toSet.has(email));
  const ccSet = new Set(uniqueCc);
  const uniqueBcc = dedupe(RESEND_BCC).filter(
    (email) => !toSet.has(email) && !ccSet.has(email)
  );
  return { to: uniqueTo, cc: uniqueCc, bcc: uniqueBcc };
}

export function resolveRecipients(formData: FormDataValues): RecipientResult {
  const requestType = formData.requestType;
  const paymentTerms = formData.paymentTerms;
  const resellValue = formData.resell ?? formData.resellOrDistribute;
  const annualValue = formData.annualPurchase ?? formData.expectedAnnualPurchase;
  const taxableValue = formData.taxable;

  if (isAddShipToRequest(requestType)) {
    return finalizeRecipients([...EMAIL_TARGETS.customerMasterData], []);
  }

  const resellYes = isYes(resellValue);
  const net30 = isNet30(paymentTerms);
  const lowAnnual = isLowAnnualPurchase(annualValue ?? "");
  const taxableNo = isNo(taxableValue);

  let to: string[] = [];
  let cc: string[] = [];

  if (resellYes) {
    to = [...EMAIL_TARGETS.channelManagement];
    cc = [...EMAIL_TARGETS.customerMasterData];
    if (net30) {
      cc = [...cc, ...EMAIL_TARGETS.creditTeam];
    }
  } else if (lowAnnual) {
    to = [...EMAIL_TARGETS.customerMasterData];
    cc = [...EMAIL_TARGETS.channelManagement];
    if (net30) {
      to = [...to, ...EMAIL_TARGETS.creditTeam];
    }
  } else {
    to = [...EMAIL_TARGETS.customerMasterData];
    cc = [];
    if (net30) {
      to = [...to, ...EMAIL_TARGETS.creditTeam];
    }
  }

  if (taxableNo) {
    cc = [...cc, ...EMAIL_TARGETS.taxesTeam];
  }

  return finalizeRecipients(to, cc);
}
