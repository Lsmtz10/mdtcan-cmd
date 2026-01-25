import { MESSAGES, type Locale } from "@/app/locales";

export type FormDataValues = Record<string, string>;

type BuildEmailOptions = {
  locale?: Locale;
  submittedAt?: string;
  resolvedTo?: string[];
  resolvedCc?: string[];
  instruction?: string;
};

const TRADE_FIELDS = ["Company", "Account", "Address", "Tel", "Contact", "Email"] as const;

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

export function buildEmailHtml(formData: FormDataValues, options: BuildEmailOptions = {}): string {
  const locale: Locale = options.locale ?? "en";
  const messages = MESSAGES[locale];
  const emailText = messages.email;
  const fieldLabels = messages.fields;
  const submittedAt = options.submittedAt ?? new Date().toISOString();
  const rows: string[] = [];

  const requestTypeLabel =
    formData.requestType === "addShipTo"
      ? fieldLabels.requestType.options.addShipTo
      : fieldLabels.requestType.options.newAccount;

  const routingLabels = {
    to: locale === "fr" ? "Courriel destinataire (To)" : "Email To",
    cc: locale === "fr" ? "Courriel en copie (Cc)" : "Email Cc",
  };
  const instructionLabel = locale === "fr" ? "Instruction" : "Instruction";

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
  if (options.instruction) {
    rows.push(tr(instructionLabel, options.instruction));
  }

  rows.push(section(emailText.section_customerInfo));
  rows.push(
    tr(fieldLabels.legalName.label, formData.legalName),
    tr(fieldLabels.city.label, formData.city),
    tr(fieldLabels.province.label, formData.province),
    tr(fieldLabels.postalCode.label, formData.postalCode),
    tr(fieldLabels.telephone.label, formData.telephone),
    tr(fieldLabels.fax.label, formData.fax),
    tr(fieldLabels.website.label, formData.website),
    tr(fieldLabels.email.label, formData.email)
  );

  rows.push(section(emailText.section_addresses));
  rows.push(
    tr(fieldLabels.billTo.label, formData.billTo),
    tr(fieldLabels.shipTo.label, formData.shipTo)
  );

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
        tr(fieldLabels.taxable.label, formData.taxable),
        tr(fieldLabels.gstTaxExempt.label, formData.gstTaxExempt),
        tr(fieldLabels.pstTaxExempt.label, formData.pstTaxExempt)
      );
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
    <table style="border-collapse:collapse;width:100%">${rows.join("")}</table>
  </div>`;
}
