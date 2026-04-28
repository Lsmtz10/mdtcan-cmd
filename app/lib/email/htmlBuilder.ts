import { MESSAGES, type Locale } from "@/app/locales";
import { LOW_ANNUAL_PURCHASE_VALUES } from "@/app/lib/emailTargets";

export type FormDataValues = Record<string, string>;

type BuildEmailOptions = {
  locale?: Locale;
  submittedAt?: string;
  resolvedTo?: string[];
  resolvedCc?: string[];
  instruction?: string;
};

const TRADE_FIELDS = ["Company", "Account", "Address", "Tel", "Contact", "Email"] as const;
const SHIP_TO_MAX = 10;
const ADDITIONAL_SHIP_TO_INDEXES = [2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const SHIP_TO_FIELDS = [
  "legalName",
  "shipTo",
  "city",
  "province",
  "postalCode",
  "telephone",
  "fax",
  "website",
  "email",
] as const;

type ShipToField = typeof SHIP_TO_FIELDS[number];

const SHIP_TO_FIELD_SUFFIX: Record<ShipToField, string> = {
  legalName: "LegalName",
  shipTo: "Address",
  city: "City",
  province: "Province",
  postalCode: "PostalCode",
  telephone: "Telephone",
  fax: "Fax",
  website: "Website",
  email: "Email",
};
const TAX_EXEMPT_INSTRUCTION =
  ". Taxes team approval must be in place to set the customer with a Tax exemption code.";

function normalizeValue(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function isAddShipToRequest(value: string | undefined): boolean {
  const normalized = normalizeValue(value).replace(/\s+/g, " ");
  return (
    normalized === "addshipto" ||
    normalized === "add a ship-to to an existing account"
  );
}

function isYes(value: string | undefined): boolean {
  return normalizeValue(value) === "yes";
}

function isNo(value: string | undefined): boolean {
  return normalizeValue(value) === "no";
}

function isLowAnnualPurchase(value: string | undefined): boolean {
  if (!value) return false;
  if (LOW_ANNUAL_PURCHASE_VALUES.has(value)) return true;
  const normalized = value.toLowerCase().replace(/\s+/g, "");
  if (normalized.startsWith(">")) return false;
  if (normalized.startsWith("<=")) return true;
  return false;
}

function buildInstructionText(formData: FormDataValues): string {
  const resellValue = formData.resell ?? formData.resellOrDistribute;
  const annualValue = formData.annualPurchase ?? formData.expectedAnnualPurchase;
  let instruction = "";

  if (isAddShipToRequest(formData.requestType)) {
    instruction = "PROCEED DIRECTLY WITH THE CREATION OF THIS Ship-To";
  } else if (isYes(resellValue)) {
    instruction = "CUSTOMER CREATION MUST WAIT UNTIL CHANNEL MANAGEMENT APPROVES";
  } else if (isLowAnnualPurchase(annualValue)) {
    instruction =
      "PROCEED DIRECTLY WITH THE CREATION OF THIS ACCOUNT. ADDITIONALLY, CHANNEL TEAM HAS BEEN INFORMED OF THIS LOW VOLUME CUSTOMER REQUEST ";
  } else {
    instruction = "PROCEED DIRECTLY WITH THE CREATION OF THIS ACCOUNT";
  }

  if (isNo(formData.taxable)) {
    instruction = instruction
      ? `${instruction}\n${TAX_EXEMPT_INSTRUCTION}`
      : TAX_EXEMPT_INSTRUCTION;
  }

  return instruction;
}

function formatMessage(template: string, replacements: Record<string, string | number>): string {
  return Object.entries(replacements).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template
  );
}

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cell(value: unknown): string {
  return esc(value).replace(/\n/g, "<br>");
}

function tr(label: string, value: unknown): string {
  const val = String(value ?? "").trim();
  if (!val) return "";
  return `
    <tr>
      <th style="text-align:left;border:1px solid #e5e7eb;padding:8px;background:#f9fafb;width:40%">${esc(label)}</th>
      <td style="border:1px solid #e5e7eb;padding:8px">${cell(val)}</td>
    </tr>`;
}

function section(title: string): string {
  return `
    <tr>
      <td colspan="2" style="background:#eef2ff;font-weight:600;padding:10px;border:1px solid #e5e7eb">${esc(title)}</td>
    </tr>`;
}

function tradeGroupHasAny(fd: FormDataValues, idx: number): boolean {
  return TRADE_FIELDS.some((field) => (fd[`trade${field}${idx}`] ?? "").trim() !== "");
}

function shipToFieldName(index: number, field: ShipToField): string {
  return index === 1 ? field : `shipTo${index}${SHIP_TO_FIELD_SUFFIX[field]}`;
}

function shipToGroupHasAny(formData: FormDataValues, index: number): boolean {
  return SHIP_TO_FIELDS.some(field => (formData[shipToFieldName(index, field)] ?? "").trim() !== "");
}

function shipToCount(formData: FormDataValues): number {
  const explicit = Number(formData.shipToCount);
  if (Number.isInteger(explicit) && explicit >= 1) {
    return Math.min(explicit, SHIP_TO_MAX);
  }

  let count = 1;
  for (const index of ADDITIONAL_SHIP_TO_INDEXES) {
    if (shipToGroupHasAny(formData, index)) count = index;
  }
  return count;
}

export function buildEmailHtml(formData: FormDataValues, options: BuildEmailOptions = {}): string {
  const locale: Locale = options.locale ?? "en";
  const messages = MESSAGES[locale];
  const emailText = messages.email;
  const fieldLabels = messages.fields;
  const submittedAt = options.submittedAt ?? new Date().toISOString();
  const rows: string[] = [];
  const instructionText = options.instruction ?? buildInstructionText(formData);
  const instructionHtml = instructionText
    ? `<div style="font-weight:700;font-size:16px;color:#8B0000;margin:0 0 12px 0;">${cell(instructionText)}</div>`
    : "";

  const requestTypeLabel =
    formData.requestType === "addShipTo"
      ? fieldLabels.requestType.options.addShipTo
      : fieldLabels.requestType.options.newAccount;
  const legalNameLabel =
    formData.requestType === "addShipTo"
      ? fieldLabels.legalName.addShipToLabel
      : fieldLabels.legalName.label;

  const routingLabels = {
    to: locale === "fr" ? "Courriel destinataire (To)" : "Email To",
    cc: locale === "fr" ? "Courriel en copie (Cc)" : "Email Cc",
  };

  rows.push(section(emailText.section_requestSummary));
  rows.push(tr(emailText.submittedAt, submittedAt));

  rows.push(section(emailText.section_requestDetails));
  rows.push(
    tr(fieldLabels.requestType.label, requestTypeLabel),
    tr(fieldLabels.existingAccountInfo.label, formData.existingAccountInfo),
    tr(fieldLabels.payerAddress.label, formData.payerAddress)
  );

  if (options.resolvedTo && options.resolvedTo.length) {
    rows.push(tr(routingLabels.to, options.resolvedTo.join(", ")));
  }
  if (options.resolvedCc && options.resolvedCc.length) {
    rows.push(tr(routingLabels.cc, options.resolvedCc.join(", ")));
  }

  if (formData.requestType === "addShipTo") {
    for (let index = 1; index <= shipToCount(formData); index += 1) {
      rows.push(section(formatMessage(fieldLabels.additionalShipTo.groupTitle, { idx: index })));
      rows.push(
        tr(legalNameLabel, formData[shipToFieldName(index, "legalName")]),
        tr(fieldLabels.shipTo.label, formData[shipToFieldName(index, "shipTo")]),
        tr(fieldLabels.city.label, formData[shipToFieldName(index, "city")]),
        tr(fieldLabels.province.label, formData[shipToFieldName(index, "province")]),
        tr(fieldLabels.postalCode.label, formData[shipToFieldName(index, "postalCode")]),
        tr(fieldLabels.telephone.label, formData[shipToFieldName(index, "telephone")]),
        tr(fieldLabels.fax.label, formData[shipToFieldName(index, "fax")]),
        tr(fieldLabels.website.label, formData[shipToFieldName(index, "website")]),
        tr(fieldLabels.email.label, formData[shipToFieldName(index, "email")])
      );
    }
  } else {
    rows.push(section(emailText.section_customerInfo));
    rows.push(
      tr(legalNameLabel, formData.legalName),
      tr(fieldLabels.city.label, formData.city),
      tr(fieldLabels.province.label, formData.province),
      tr(fieldLabels.postalCode.label, formData.postalCode),
      tr(fieldLabels.telephone.label, formData.telephone),
      tr(fieldLabels.fax.label, formData.fax),
      tr(fieldLabels.website.label, formData.website),
      tr(fieldLabels.email.label, formData.email)
    );

    const deliveryAddressAnswer =
      formData.deliveryAddressSameAsBilling === "yes"
        ? fieldLabels.newAccountDelivery.yes
        : formData.deliveryAddressSameAsBilling === "no"
          ? fieldLabels.newAccountDelivery.no
          : formData.deliveryAddressSameAsBilling;

    rows.push(section(emailText.section_addresses));
    rows.push(
      tr(fieldLabels.billTo.label, formData.billTo),
      tr(fieldLabels.newAccountDelivery.question, deliveryAddressAnswer)
    );
    if (formData.deliveryAddressSameAsBilling === "no") {
      rows.push(tr(fieldLabels.shipTo.label, fieldLabels.newAccountDelivery.noNote));
    }
    if (formData.deliveryAddressSameAsBilling === "yes") {
      rows.push(
        tr(fieldLabels.shipTo.label, formData.shipTo),
        tr(fieldLabels.city.label, formData.shipToCity),
        tr(fieldLabels.province.label, formData.shipToProvince),
        tr(fieldLabels.postalCode.label, formData.shipToPostalCode),
        tr(fieldLabels.telephone.label, formData.shipToTelephone),
        tr(fieldLabels.fax.label, formData.shipToFax),
        tr(fieldLabels.email.label, formData.shipToEmail)
      );
    }

    rows.push(section(emailText.section_accountsPayable));
    rows.push(
      tr(fieldLabels.apContact.label, formData.apContact),
      tr(fieldLabels.apPhone.label, formData.apPhone),
      tr(fieldLabels.apEmail.label, formData.apEmail),
      tr(
        fieldLabels.paymentTerms.label,
        formData.paymentTerms === "net30"
          ? emailText.paymentNet30Short
          : formData.paymentTerms === "creditCard"
            ? emailText.paymentCreditCardShort
            : formData.paymentTerms
      )
    );
  }

  if (formData.requestType !== "addShipTo") {
    rows.push(section(emailText.section_companyInformation));
    rows.push(
      tr(fieldLabels.typeOfOrganization.label, formData.typeOfOrganization),
      tr(fieldLabels.yearsInBusiness.label, formData.yearsInBusiness),
      tr(fieldLabels.typeOfBusiness.label, formData.typeOfBusiness),
      tr(fieldLabels.annualSales.label, formData.annualSales),
      tr(fieldLabels.resell.label, formData.resell),
      tr(fieldLabels.intendedDistribution.label, formData.intendedDistribution),
      tr(fieldLabels.creditAmount.label, formData.creditAmount),
      tr(fieldLabels.products.label, formData.products)
    );

    if (formData.paymentTerms === "net30") {
      rows.push(
        tr(fieldLabels.initialOrder.label, formData.initialOrder),
        tr(fieldLabels.annualPurchase.label, formData.annualPurchase),
        tr(fieldLabels.taxable.label, formData.taxable)
      );
      if (formData.taxable === "no") {
        rows.push(
          tr(fieldLabels.taxExemptionTypes.label, formData.taxExemptionTypes),
          tr(fieldLabels.craBusinessNumber.label, formData.craBusinessNumber)
        );
      }
      rows.push(section(emailText.section_bankReferences));
      rows.push(
        tr(fieldLabels.bankName.label, formData.bankName),
        tr(fieldLabels.bankAddress.label, formData.bankAddress),
        tr(fieldLabels.accountManager.label, formData.accountManager),
        tr(fieldLabels.bankPhone.label, formData.bankPhone),
        tr(fieldLabels.bankFax.label, formData.bankFax),
        tr(fieldLabels.bankEmail.label, formData.bankEmail),
        tr(fieldLabels.bankAccountNumber.label, formData.bankAccountNumber)
      );

      rows.push(section(emailText.section_tradeReferences));
      for (const idx of [1, 2, 3] as const) {
        if (idx === 3 && !tradeGroupHasAny(formData, 3)) continue;
        rows.push(
          `<tr><td colspan="2" style="padding:8px 10px;font-weight:600;border:1px solid #e5e7eb;background:#fafafa">${esc(formatMessage(fieldLabels.trade.groupTitle, { idx }))}</td></tr>`
        );
        rows.push(
          tr(fieldLabels.trade.company.label, formData[`tradeCompany${idx}`]),
          tr(fieldLabels.trade.account.label, formData[`tradeAccount${idx}`]),
          tr(fieldLabels.trade.address.label, formData[`tradeAddress${idx}`]),
          tr(fieldLabels.trade.tel.label, formData[`tradeTel${idx}`]),
          tr(fieldLabels.trade.contact.label, formData[`tradeContact${idx}`]),
          tr(fieldLabels.trade.email.label, formData[`tradeEmail${idx}`])
        );
      }
    }
  }

  const primaryKey = formData.primarySegment as keyof typeof messages.options.segmentation.secondaryByPrimary;
  const secondaryOptions = messages.options.segmentation.secondaryByPrimary[primaryKey] ?? [];
  const primaryLabel =
    messages.options.segmentation.primary.find((opt) => opt.value === formData.primarySegment)?.label ??
    formData.primarySegment;
  const secondaryLabel =
    secondaryOptions.find((opt) => opt.value === formData.secondarySegment)?.label ?? formData.secondarySegment;

  rows.push(section(messages.sections.customerSegmentation));
  rows.push(
    tr(fieldLabels.primarySegment.label, primaryLabel),
    tr(fieldLabels.secondarySegment.label, secondaryLabel)
  );

  rows.push(section(messages.sections.finalInformation));
  rows.push(
    tr(fieldLabels.requestorName.label, formData.requestorName),
    tr(fieldLabels.requestorEmail.label, formData.requestorEmail),
    tr(fieldLabels.title.label, formData.title),
    tr(fieldLabels.salesRepName.label, formData.salesRepName),
    tr(fieldLabels.date.label, formData.date)
  );

  return `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:14px;color:#111827">
    <h2 style="margin:0 0 12px 0">${esc(messages.page.title)}</h2>
    ${instructionHtml}
    <table style="border-collapse:collapse;width:100%">${rows.join("")}</table>
  </div>`;
}
