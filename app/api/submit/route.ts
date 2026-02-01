import { NextResponse } from "next/server";
import { Resend } from "resend";

import { MESSAGES, type Locale } from "@/app/locales";
import { buildEmailHtml, type FormDataValues } from "@/app/lib/email/htmlBuilder";
import { resolveRecipients } from "@/app/lib/recipients";

export const runtime = "nodejs";

type SubmitPayload = {
  formData: Record<string, unknown>;
  taxExemptFile?: unknown;
  locale?: Locale;
};

type SendResult = {
  data?: { id: string };
  error?: { message: string };
};

const TAX_EXEMPT_MAX_BYTES = 3 * 1024 * 1024;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeFormData(raw: Record<string, unknown>): FormDataValues | null {
  const normalized: FormDataValues = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value !== "string") return null;
    normalized[key] = value;
  }
  return normalized;
}

function validateTaxExemptFile(file: File | null, required: boolean): string | null {
  if (!required) return null;
  if (!file) return "Tax exempt certificate PDF is required.";
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "File must be a PDF.";
  if (file.size > TAX_EXEMPT_MAX_BYTES) return "File must be 3 MB or less.";
  return null;
}

function parseLocale(value: unknown): Locale {
  return value === "fr" ? "fr" : "en";
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let rawFormData: Record<string, unknown> | null = null;
  let locale: Locale | undefined;
  let taxExemptFile: File | null = null;

  if (contentType.includes("application/json")) {
    let body: SubmitPayload | undefined;
    try {
      body = (await request.json()) as SubmitPayload;
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    if (!body || !isRecord(body) || !isRecord(body.formData)) {
      return NextResponse.json({ error: "Missing or invalid formData." }, { status: 400 });
    }

    rawFormData = body.formData;
    locale = body.locale;
  } else if (contentType.includes("multipart/form-data")) {
    let multipart: FormData;
    try {
      multipart = await request.formData();
    } catch {
      return NextResponse.json({ error: "Invalid multipart payload." }, { status: 400 });
    }

    const formDataField = multipart.get("formData");
    if (typeof formDataField !== "string") {
      return NextResponse.json({ error: "formData must be provided as JSON string." }, { status: 400 });
    }

    try {
      rawFormData = JSON.parse(formDataField) as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "formData must be valid JSON." }, { status: 400 });
    }

    if (!isRecord(rawFormData)) {
      return NextResponse.json({ error: "formData must be an object." }, { status: 400 });
    }

    const localeField = multipart.get("locale");
    locale = parseLocale(localeField);

    const fileField = multipart.get("taxExemptFile");
    if (fileField instanceof File) {
      taxExemptFile = fileField;
    } else if (fileField !== null && fileField !== undefined) {
      return NextResponse.json({ error: "taxExemptFile must be a file." }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Unsupported content type." }, { status: 415 });
  }

  if (!rawFormData) {
    return NextResponse.json({ error: "Missing formData." }, { status: 400 });
  }

  const formData = normalizeFormData(rawFormData);
  if (!formData) {
    return NextResponse.json({ error: "formData must contain only string values." }, { status: 400 });
  }

  const missingEnv = [
    ["RESEND_API_KEY", process.env.RESEND_API_KEY],
    ["RESEND_FROM", process.env.RESEND_FROM],
    ["RESEND_REPLY_TO", process.env.RESEND_REPLY_TO],
    ["DEFAULT_TO", process.env.DEFAULT_TO],
  ]
    .filter(([, value]) => !value || !value.trim())
    .map(([key]) => key);

  if (missingEnv.length > 0) {
    return NextResponse.json(
      { error: `Missing required environment variables: ${missingEnv.join(", ")}` },
      { status: 500 }
    );
  }

  const requiresTaxExemptFile =
    formData.paymentTerms === "net30" &&
    formData.taxable === "no" &&
    formData.requestType !== "addShipTo";
  const shouldValidateFile = requiresTaxExemptFile || taxExemptFile !== null;
  const taxExemptError = shouldValidateFile
    ? validateTaxExemptFile(taxExemptFile, true)
    : null;
  if (taxExemptError) {
    return NextResponse.json({ error: taxExemptError }, { status: 400 });
  }

  const recipients = resolveRecipients(formData);
  if (!recipients.to.length) {
    return NextResponse.json({ error: "No email recipients resolved." }, { status: 500 });
  }

  const resolvedLocale = parseLocale(locale);
  const subject = MESSAGES[resolvedLocale].email.subject;
  const submittedAt = new Date().toISOString();
  const html = buildEmailHtml(formData, {
    locale: resolvedLocale,
    submittedAt,
    resolvedTo: recipients.to,
    resolvedCc: recipients.cc,
  });

  const attachments = taxExemptFile
    ? [
        {
          filename: taxExemptFile.name || "tax-exempt.pdf",
          content: Buffer.from(await taxExemptFile.arrayBuffer()),
        },
      ]
    : undefined;

  const resendApiKey = process.env.RESEND_API_KEY ?? "";
  const resendFrom = process.env.RESEND_FROM ?? "";
  const resendReplyTo = process.env.RESEND_REPLY_TO ?? "";
  const resend = new Resend(resendApiKey);
  const result = (await resend.emails.send({
    from: resendFrom,
    to: recipients.to,
    ...(recipients.cc?.length ? { cc: recipients.cc } : {}),
    ...(recipients.bcc?.length ? { bcc: recipients.bcc } : {}),
    reply_to: resendReplyTo,
    subject,
    html,
    ...(attachments ? { attachments } : {}),
  })) as SendResult;

  if (result.error) {
    return NextResponse.json(
      { error: result.error.message || "Resend request failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, id: result.data?.id ?? null });
}
