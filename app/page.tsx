
'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { useRouter } from 'next/navigation';
import { MESSAGES, Locale } from './locales';
import { EMAIL_TARGETS, LOW_ANNUAL_PURCHASE_VALUES } from '@/app/lib/emailTargets';





const getTodayDate = () => {
  const now = new Date();
  // Ajusta por el offset de tu zona horaria y toma solo la parte de fecha local
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0]; // YYYY-MM-DD en hora local
};

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

const SHIP_TO_FIELD_BY_SUFFIX: Record<string, ShipToField> = {
  LegalName: "legalName",
  Address: "shipTo",
  City: "city",
  Province: "province",
  PostalCode: "postalCode",
  Telephone: "telephone",
  Fax: "fax",
  Website: "website",
  Email: "email",
};

const SHIP_TO_FIELD_SUFFIX_PATTERN = Object.keys(SHIP_TO_FIELD_BY_SUFFIX).join("|");

const NEW_ACCOUNT_DELIVERY_FIELDS = [
  "shipTo",
  "shipToCity",
  "shipToProvince",
  "shipToPostalCode",
  "shipToTelephone",
  "shipToFax",
  "shipToEmail",
] as const;

type NewAccountDeliveryField = typeof NEW_ACCOUNT_DELIVERY_FIELDS[number];

const NEW_ACCOUNT_DELIVERY_FIELD_TO_SHIP_TO_FIELD: Record<NewAccountDeliveryField, ShipToField> = {
  shipTo: "shipTo",
  shipToCity: "city",
  shipToProvince: "province",
  shipToPostalCode: "postalCode",
  shipToTelephone: "telephone",
  shipToFax: "fax",
  shipToEmail: "email",
};

const NEW_ACCOUNT_DELIVERY_FIELD_SET = new Set<string>(NEW_ACCOUNT_DELIVERY_FIELDS);



export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');
  const messages = MESSAGES[locale];

  const [formData, setFormData] = useState<Record<string, string>>({
    requestType: 'newAccount',
    formEmailTo: EMAIL_TARGETS.customerMasterData.join(", "),
    formEmailCc: '',
    textInstruction: '',

    legalName: '',
    city: '',
    province: '',
    postalCode: '',
    telephone: '',
    fax: '',
    website: '',
    email: '',
    billTo: '',
    deliveryAddressSameAsBilling: '',
    shipTo: '',
    shipToCity: '',
    shipToProvince: '',
    shipToPostalCode: '',
    shipToTelephone: '',
    shipToFax: '',
    shipToEmail: '',
    apContact: '',
    apPhone: '',
    apEmail: '',
    existingAccountInfo: '',
    payerAddress: '',
    paymentTerms: '',
    typeOfOrganization: '',
    yearsInBusiness: '',
    typeOfBusiness: '',
    annualSales: '',
    resell: '',
    intendedDistribution: '',
    creditAmount: '',
    products: '',
    initialOrder: '',
    annualPurchase: '',
    taxable: '',
    taxExemptionTypes: '',
    craBusinessNumber: '',
    bankName: '',
    bankAddress: '',
    accountManager: '',
    bankPhone: '',
    bankFax: '',
    bankAccountNumber: '',
    bankEmail: '',
    tradeCompany1: '',
    tradeAccount1: '',
    tradeAddress1: '',
    tradeTel1: '',
    tradeContact1: '',
    tradeEmail1: '',
    tradeCompany2: '',
    tradeAccount2: '',
    tradeAddress2: '',
    tradeTel2: '',
    tradeContact2: '',
    tradeEmail2: '',
    primarySegment: '',
    secondarySegment: '',
    salesRepName: '',
    requestorName: '',
    requestorEmail: '',
    title: '',
    date: getTodayDate(),
  })
  

/*   const [errors, setErrors] = useState<{
    legalName?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    telephone?: string;
    apPhone?: string;
    fax?: string;
    apEmail?: string;
    paymentTerms?: string;
    bankName?: string;
    accountManager?: string;
    bankPhone?: string;
    bankEmail?: string;
    bankAccountNumber?: string;
    email?: string;
 }>({});
 */

 
  const [intendedDistribution, setIntendedDistribution] = useState<string[]>([]);
  const [taxExemptionTypes, setTaxExemptionTypes] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [taxExemptFile, setTaxExemptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipToCount, setShipToCount] = useState(1);
  const [focusedDeliveryAddressField, setFocusedDeliveryAddressField] = useState<string | null>(null);

  useEffect(() => {
    setErrors({});
  }, [locale]);

  const TAX_EXEMPT_INSTRUCTION =
    "Taxes team approval must be in place to set the customer with a Tax exemption code";

  function buildInstructionText(fd: Record<string, string>): string {
    let instruction = "";
    const requestType = fd.requestType ?? "";
    const resellValue = fd.resell ?? fd.resellOrDistribute ?? "";
    const annual = fd.annualPurchase ?? fd.expectedAnnualPurchase ?? "";

    if (requestType === "addShipTo") {
      instruction = "PROCEED DIRECTLY WITH THE CREATION OF THIS Ship-To";
    } else if (resellValue === "yes") {
      instruction = "CUSTOMER CREATION MUST WAIT UNTIL CHANNEL MANAGEMENT APPROVES";
    } else if (LOW_ANNUAL_PURCHASE_VALUES.has(annual)) {
      instruction =
        "THIS IS A LOW VOLUME CUSTOMER, SHOULD NOT BE CREATED, CUSTOMER WAS ADVISED TO CONTACT A DISTRIBUTOR";
    } else {
      instruction = "PROCEED DIRECTLY WITH THE CREATION OF THIS CUSTOMER";
    }

    if (fd.taxable === "no") {
      instruction = instruction
        ? `${instruction}\n${TAX_EXEMPT_INSTRUCTION}`
        : TAX_EXEMPT_INSTRUCTION;
    }

    return instruction;
  }

  function computeEmailRouting(fd: Record<string, string>) {
    let to = [...EMAIL_TARGETS.customerMasterData];
    let cc: string[] = [];
    let confirmationVariant: "default" | "resellYes" | "lowPurchase" = "default";

    const requestType = fd.requestType ?? "";
    const isAddShipTo = requestType === "addShipTo";
    const resellValue = fd.resell ?? fd.resellOrDistribute ?? "";
    const annual = fd.annualPurchase ?? fd.expectedAnnualPurchase ?? "";
    const isResellYes = resellValue === "yes";
    const isLowAnnual = LOW_ANNUAL_PURCHASE_VALUES.has(annual);
    const isNet30 = fd.paymentTerms === "net30";

    if (!isAddShipTo) {
      if (isResellYes) {
        to = [...EMAIL_TARGETS.channelManagement];
        cc = [...EMAIL_TARGETS.customerMasterData];
        confirmationVariant = "resellYes";
      } else if (isLowAnnual) {
        to = [...EMAIL_TARGETS.customerMasterData];
        cc = [...EMAIL_TARGETS.channelManagement];
        confirmationVariant = "lowPurchase";
      } else {
        to = [...EMAIL_TARGETS.customerMasterData];
        cc = [];
        confirmationVariant = "default";
      }
    }

    if (isNet30) {
      const toSet = new Set(to);
      EMAIL_TARGETS.creditTeam.forEach(e => toSet.add(e));
      to = Array.from(toSet);
    }

    return {
      to: to.join(", "),
      cc: Array.from(new Set(cc)).join(", "),
      textInstruction: buildInstructionText(fd),
      confirmationVariant,
    };
  }

  const formatMessage = (template: string, replacements: Record<string, string | number>) =>
    Object.entries(replacements).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
      template
    );

  function getLegalNameLabel(requestType = formData.requestType): string {
    return requestType === "addShipTo"
      ? messages.fields.legalName.addShipToLabel
      : messages.fields.legalName.label;
  }



  const LEGAL_NAME_MAX = 35;
  // Letras Unicode (incluye acentos) + marcas combinadas + dígitos + espacios
  const LEGAL_NAME_ALLOWED = /^[\p{L}\p{M}\d ]+$/u;
  
  function validateLegalName(value: string): string | null {
    const v = value.trim();
    if (!v) return `${getLegalNameLabel()} ${messages.errors.requiredSuffix}`;
    if (v.length > LEGAL_NAME_MAX) return formatMessage(messages.errors.maxLength, { max: LEGAL_NAME_MAX });
    if (!LEGAL_NAME_ALLOWED.test(v)) return messages.errors.onlyLettersNumbersSpaces;
    return null;
  }




// Allow: letters (incl. accents), spaces, hyphen, apostrophe (' or ’), dot, digits (opcionales)
// const CITY_ALLOWED = /^[\p{L}\p{M}\d .'\-’]+$/u;

// Valida: letras (incl. acentos), dígitos, espacio, punto, apóstrofe (dos variantes) y guion
const CITY_ALLOWED = /^[\p{L}\p{M}\d .'\-]+$/u;
// Para limpiar mientras se escribe (negado del conjunto permitido)
const CITY_STRIP = /[^ \p{L}\p{M}\d.'-]/gu;


function validateCity(value: string): string | null {
  const v = value.trim();
  if (!v) return messages.errors.cityRequired;
  if (!CITY_ALLOWED.test(v)) {
    return messages.errors.cityAllowedChars;
  }
  return null;
}


// justo debajo de 'use client' y de tus imports, SIN export
const PROVINCES_CA = [
  "Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
  "Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan",
] as const;

const CANADA_WIDE_OPTION = "Canada wide";
const DISTRIBUTION_OPTIONS = [CANADA_WIDE_OPTION, ...PROVINCES_CA] as const;

const PROVINCES_SET = new Set<string>(PROVINCES_CA);

function validateProvince(value: string): string | null {
  if (!value) return messages.errors.provinceRequired;
  if (!PROVINCES_SET.has(value)) return messages.errors.invalidProvince;
  return null;
}


// Letras aceptadas por la app para el codigo postal canadiense.
const POSTAL_LETTERS = "ABCEGHJKLMNPRSTVWXYZ";
const POSTAL_REGEX = new RegExp(`^[${POSTAL_LETTERS}]\\d[${POSTAL_LETTERS}] \\d[${POSTAL_LETTERS}]\\d$`);

function normalizePostalInput(raw: string): string {
  const up = raw.toUpperCase().normalize("NFC");
  // Acepta que el usuario teclee con o sin espacio/guion; tú lo formateas
  const alnum = up.replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return alnum.length > 3 ? `${alnum.slice(0, 3)} ${alnum.slice(3)}` : alnum;
}

function validatePostalCode(value: string): string | null {
  const v = value.trim().toUpperCase();
  if (!v) return messages.errors.postalCodeRequired;
  if (!POSTAL_REGEX.test(v)) return messages.errors.postalCodeFormat;
  return null;
}



// Quita todo lo que no sea dígito
function onlyDigits(s: string): string {
  return s.replace(/\D/g, "");
}

// Normaliza a 10 dígitos (permite +1 / 1 inicial) y retorna en formato legible
function normalizePhoneCA(raw: string): string {
  let d = onlyDigits(raw);
  if (d.startsWith("1") && d.length >= 11) d = d.slice(1); // quita prefijo país si viene
  d = d.slice(0, 10); // tope 10

  // Formato visible; no “brinca” el cursor demasiado y es claro
  if (d.length >= 7) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  if (d.length >= 4) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  if (d.length >= 1) return `(${d}`;
  return "";
}

// Valida 10 dígitos (si es requerido); si opcional y vacío, no marca error
function validatePhoneCA(value: string, required: boolean, fieldLabel: string): string | null {
  const digits = onlyDigits(value);
  if (!digits) {
    return required ? `${fieldLabel} ${messages.errors.requiredSuffix}` : null;
  }
  // Quita 1 inicial si sobrara por copy/paste
  const core = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (core.length !== 10) return formatMessage(messages.errors.phone10Digits, { label: fieldLabel });
  // (Opcional) Reglas NANP más estrictas:
  // if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(core)) return `${fieldLabel} is not a valid Canadian number.`;
  return null;
}


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string, required: boolean, label: string): string | null {
  const v = value.trim();
  if (!v) return required ? `${label} ${messages.errors.requiredSuffix}` : null;
  if (!EMAIL_REGEX.test(v)) return messages.errors.invalidEmail;
  return null;
}

const PAYMENT_TERMS = ["creditCard", "net30"] as const;
const PAYMENT_TERMS_SET = new Set<string>(PAYMENT_TERMS);

function validatePaymentTerms(value: string): string | null {
  if (!value) return messages.errors.paymentTermsRequired;
  if (!PAYMENT_TERMS_SET.has(value)) return messages.errors.invalidOption;
  return null;
}

const RESELL_OPTIONS = ["yes", "no"] as const;
const RESELL_OPTIONS_SET = new Set<string>(RESELL_OPTIONS);

function validateResell(value: string): string | null {
  if (!value) return `${messages.fields.resell.label} ${messages.errors.requiredSuffix}`;
  if (!RESELL_OPTIONS_SET.has(value)) return messages.errors.invalidOption;
  return null;
}

const TYPE_OF_BUSINESS_OPTIONS = ["Hospital", "Clinic", "Distributor", "Physician", "Other"] as const;
const TYPE_OF_BUSINESS_OPTIONS_SET = new Set<string>(TYPE_OF_BUSINESS_OPTIONS);

function validateTypeOfBusiness(value: string): string | null {
  if (!value) return `${messages.fields.typeOfBusiness.label} ${messages.errors.requiredSuffix}`;
  if (!TYPE_OF_BUSINESS_OPTIONS_SET.has(value)) return messages.errors.invalidOption;
  return null;
}

function validateIntendedDistribution(selected: string[], resellValue: string): string | null {
  if (resellValue !== "yes") return null;
  if (!selected.length) return messages.errors.intendedDistributionRequired;
  return null;
}

function validateTaxExemptionTypes(selected: string[], required: boolean): string | null {
  if (!required) return null;
  if (!selected.length) return messages.errors.taxExemptionTypesRequired;
  return null;
}

function validateAnnualPurchase(value: string): string | null {
  if (!value) return `${messages.fields.annualPurchase.label} ${messages.errors.requiredSuffix}`;
  const validValues = new Set<string>(messages.options.annualPurchase.map(opt => String(opt.value)));
  if (!validValues.has(value)) return messages.errors.invalidOption;
  return null;
}


function validateRequired(value: string, required: boolean, label: string): string | null {
  const v = (value ?? "").trim();
  if (required && !v) return `${label} ${messages.errors.requiredSuffix}`;
  return null;
}

function getShipToFieldName(index: number, field: ShipToField): string {
  return index === 1 ? field : `shipTo${index}${SHIP_TO_FIELD_SUFFIX[field]}`;
}

function parseAdditionalShipToFieldName(name: string): { index: number; field: ShipToField } | null {
  const match = name.match(new RegExp(`^shipTo(10|[2-9])(${SHIP_TO_FIELD_SUFFIX_PATTERN})$`));
  if (!match) return null;
  return {
    index: Number(match[1]),
    field: SHIP_TO_FIELD_BY_SUFFIX[match[2]],
  };
}

function getShipToFieldLabel(field: ShipToField): string {
  switch (field) {
    case "legalName":
      return getLegalNameLabel("addShipTo");
    case "shipTo":
      return messages.fields.shipTo.label;
    case "city":
      return messages.fields.city.label;
    case "province":
      return messages.fields.province.label;
    case "postalCode":
      return messages.fields.postalCode.label;
    case "telephone":
      return messages.fields.telephone.label;
    case "fax":
      return messages.fields.fax.label;
    case "website":
      return messages.fields.website.label;
    case "email":
      return messages.fields.email.label;
    default:
      return field;
  }
}

function normalizeShipToFieldValue(field: ShipToField, value: string): string {
  switch (field) {
    case "legalName":
      return value
        .normalize("NFC")
        .replace(/[^\p{L}\p{M}\d ]/gu, "")
        .slice(0, LEGAL_NAME_MAX);
    case "city":
      return value
        .normalize("NFC")
        .replace(/[â€“â€”]/g, "-")
        .replace(/[â€™]/g, "'")
        .replace(CITY_STRIP, "")
        .replace(/\s{2,}/g, " ");
    case "postalCode":
      return normalizePostalInput(value);
    case "telephone":
    case "fax":
      return normalizePhoneCA(value);
    case "email":
      return value.normalize("NFC").replace(/\s/g, "");
    case "shipTo":
      return value.normalize("NFC").trimStart();
    default:
      return value.normalize("NFC").replace(/\s{2,}/g, " ");
  }
}

function validateShipToFieldValue(field: ShipToField, value: string): string | null {
  const label = getShipToFieldLabel(field);
  switch (field) {
    case "legalName":
      return validateLegalName(value);
    case "shipTo":
      return validateRequired(value, true, label);
    case "city":
      return validateCity(value);
    case "province":
      return validateProvince(value);
    case "postalCode":
      return validatePostalCode(value);
    case "telephone":
      return validatePhoneCA(value, true, label);
    case "fax":
      return validatePhoneCA(value, false, label);
    case "email":
      return validateEmail(value, true, label);
    default:
      return null;
  }
}

function clearAdditionalShipToData(startIndex: number, values: Record<string, string>): Record<string, string> {
  const next = { ...values };
  for (let index = startIndex; index <= SHIP_TO_MAX; index += 1) {
    SHIP_TO_FIELDS.forEach(field => {
      delete next[getShipToFieldName(index, field)];
    });
  }
  return next;
}

function clearAdditionalShipToErrors(
  startIndex: number,
  values: Record<string, string | undefined>
): Record<string, string | undefined> {
  const next = { ...values };
  for (let index = startIndex; index <= SHIP_TO_MAX; index += 1) {
    SHIP_TO_FIELDS.forEach(field => {
      delete next[getShipToFieldName(index, field)];
    });
  }
  return next;
}

function validateAdditionalShipTos(): Record<string, string | undefined> {
  const nextErrors: Record<string, string | undefined> = {};
  for (const index of ADDITIONAL_SHIP_TO_INDEXES) {
    if (index > shipToCount) break;
    SHIP_TO_FIELDS.forEach(field => {
      const name = getShipToFieldName(index, field);
      const msg = validateShipToFieldValue(field, formData[name] ?? "");
      if (msg) nextErrors[name] = msg;
    });
  }
  return nextErrors;
}

function isNewAccountDeliveryField(name: string): name is NewAccountDeliveryField {
  return NEW_ACCOUNT_DELIVERY_FIELD_SET.has(name);
}

function normalizeNewAccountDeliveryFieldValue(field: NewAccountDeliveryField, value: string): string {
  return normalizeShipToFieldValue(NEW_ACCOUNT_DELIVERY_FIELD_TO_SHIP_TO_FIELD[field], value);
}

function getNewAccountDeliveryFieldLabel(field: NewAccountDeliveryField): string {
  return getShipToFieldLabel(NEW_ACCOUNT_DELIVERY_FIELD_TO_SHIP_TO_FIELD[field]);
}

function validateNewAccountDeliveryFieldValue(field: NewAccountDeliveryField, value: string): string | null {
  if (field === "shipTo") {
    return validateRequired(value, true, getNewAccountDeliveryFieldLabel(field));
  }
  if (field === "shipToFax") {
    return validatePhoneCA(value, false, getNewAccountDeliveryFieldLabel(field));
  }
  return validateShipToFieldValue(NEW_ACCOUNT_DELIVERY_FIELD_TO_SHIP_TO_FIELD[field], value);
}

function clearNewAccountDeliveryData(values: Record<string, string>): Record<string, string> {
  const next = { ...values };
  NEW_ACCOUNT_DELIVERY_FIELDS.forEach(field => {
    next[field] = "";
  });
  return next;
}

function clearNewAccountDeliveryErrors(
  values: Record<string, string | undefined>
): Record<string, string | undefined> {
  const next = { ...values };
  NEW_ACCOUNT_DELIVERY_FIELDS.forEach(field => {
    delete next[field];
  });
  return next;
}

function validateNewAccountDeliveryFields(): Record<string, string | undefined> {
  const nextErrors: Record<string, string | undefined> = {};
  NEW_ACCOUNT_DELIVERY_FIELDS.forEach(field => {
    const msg = validateNewAccountDeliveryFieldValue(field, formData[field] ?? "");
    if (msg) nextErrors[field] = msg;
  });
  return nextErrors;
}

const TAX_EXEMPT_MAX_BYTES = 3 * 1024 * 1024;

function validateTaxExemptFile(file: File | null, required: boolean): string | null {
  if (!required) return null;
  if (!file) return messages.errors.taxExemptFileRequired;
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return messages.errors.taxExemptFileType;
  if (file.size > TAX_EXEMPT_MAX_BYTES) return messages.errors.taxExemptFileSize;
  return null;
}


const TRADE_FIELDS = ['Company','Account','Address','Tel','Contact','Email'] as const;

function tradeGroupHasAny(i: number): boolean {
  return TRADE_FIELDS.some(f => ((formData[`trade${f}${i}`] ?? '').trim() !== ''));
}


function tradeIsRequired(i: number): boolean {
  // SOLO si Net 30
  if (formData.paymentTerms !== "net30") return false;
  // 1 y 2 obligatorias; 3 si el usuario empezó a llenarla
  return i === 1 || i === 2 || tradeGroupHasAny(i);
}






// Permite pasar un valor ya “limpio” cuando validamos en onChange
function validateTradeField(name: string, override?: string): string | null {
  const m = name.match(/^trade(Company|Account|Address|Tel|Contact|Email)([123])$/);
  if (!m) return null;

  const field = m[1] as typeof TRADE_FIELDS[number];
  const idx = Number(m[2]);
  const required = tradeIsRequired(idx);
  const raw = (override ?? formData[name] ?? '').trim();
  const tradeGroupLabel = formatMessage(messages.fields.trade.groupTitle, { idx });

  switch (field) {
    case 'Tel':
      return validatePhoneCA(raw, required, `${tradeGroupLabel} ${messages.fields.trade.tel.label}`);
    case 'Email':
      return validateEmail(raw, required, `${tradeGroupLabel} ${messages.fields.trade.email.label}`);
    case 'Account': {
      const digits = onlyDigits(raw);
      // si el usuario metió letras, las limpiamos en el handleChange
      return required && !digits
        ? formatMessage(messages.errors.tradeRefAccountRequired, { idx })
        : null;
    }
    case 'Company':
      return validateRequired(raw, required, `${tradeGroupLabel} ${messages.fields.trade.company.label}`);
    case 'Address':
      return validateRequired(raw, required, `${tradeGroupLabel} ${messages.fields.trade.address.label}`);
    case 'Contact':
      if (required && !raw) {
        return formatMessage(messages.errors.tradeRefContactRequired, { idx });
      }
      return null;
    default:
      return null;
  }
}



function tradeLabel(field: string): string {
  const tradeFields = messages.fields.trade;
  switch (field) {
    case 'Tel':     return tradeFields.tel.label;
    case 'Contact': return tradeFields.contact.label;
    case 'Account': return tradeFields.account.label;
    case 'Email':   return tradeFields.email.label;
    case 'Address': return tradeFields.address.label;
    default:        return tradeFields.company.label; // 'Company'
  }
}




function handlePhoneFieldChange(
  field: "telephone" | "apPhone" | "fax",
  required: boolean,
  value: string
) {
  const normalized = normalizePhoneCA(value);
  setFormData(prev => ({ ...prev, [field]: normalized }));
  const label =
    field === "fax"
      ? messages.fields.fax.label
      : field === "telephone"
        ? messages.fields.telephone.label
        : messages.fields.apPhone.label;
  const msg = validatePhoneCA(normalized, required, label);
  setErrors(prev => ({ ...prev, [field]: msg || undefined }));
}

function nextDistributionSelection(value: string, checked: boolean, current: string[]): string[] {
  const currentSet = new Set(current);

  if (value === CANADA_WIDE_OPTION) {
    return checked ? [...DISTRIBUTION_OPTIONS] : [];
  }

  if (checked) {
    currentSet.add(value);
    currentSet.delete(CANADA_WIDE_OPTION); // manual picks do not auto-set Canada wide
    return Array.from(currentSet);
  }

  // Unchecking a province removes it and also drops Canada wide if it was on
  currentSet.delete(value);
  currentSet.delete(CANADA_WIDE_OPTION);
  return Array.from(currentSet);
}

function handleDistributionCheckbox(value: string, checked: boolean) {
  const nextSelection = nextDistributionSelection(value, checked, intendedDistribution);
  setIntendedDistribution(nextSelection);
  setFormData(prev => ({ ...prev, intendedDistribution: nextSelection.join(", ") }));

  const msg = validateIntendedDistribution(nextSelection, formData.resell);
  setErrors(prev => ({ ...prev, intendedDistribution: msg || undefined }));
}

function handleTaxExemptionTypeCheckbox(value: string, checked: boolean) {
  const nextSelection = checked
    ? Array.from(new Set([...taxExemptionTypes, value]))
    : taxExemptionTypes.filter(item => item !== value);

  const required =
    formData.paymentTerms === "net30" &&
    formData.taxable === "no" &&
    formData.requestType !== "addShipTo";

  setTaxExemptionTypes(nextSelection);
  setFormData(prev => ({ ...prev, taxExemptionTypes: nextSelection.join(", ") }));
  setErrors(prev => ({
    ...prev,
    taxExemptionTypes: validateTaxExemptionTypes(nextSelection, required) || undefined,
  }));
}

  const secondaryOptions = messages.options.segmentation.secondaryByPrimary as Record<
    string,
    ReadonlyArray<{ value: string; label: string }>
  >;

  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "requestType") {
      const nextType = value;
      setShipToCount(1);
      setFormData(prev => clearAdditionalShipToData(2, {
        ...prev,
        requestType: nextType,
        paymentTerms: nextType === "newAccount" ? prev.paymentTerms : "",
        billTo: nextType === "addShipTo" ? "" : prev.billTo,
        apContact: nextType === "addShipTo" ? "" : prev.apContact,
        apPhone: nextType === "addShipTo" ? "" : prev.apPhone,
        apEmail: nextType === "addShipTo" ? "" : prev.apEmail,
      }));
      if (nextType === "addShipTo") {
        setTaxExemptFile(null);
      }
      setErrors(prev => {
        const next = { ...prev };
        next.paymentTerms = undefined;
        next.requestType = undefined;
        next.existingAccountInfo = undefined;
        next.payerAddress = undefined;
        next.legalName = undefined;
        next.billTo = undefined;
        next.apContact = undefined;
        next.apPhone = undefined;
        next.apEmail = undefined;
        next.deliveryAddressSameAsBilling = undefined;
        next.taxExemptFile = undefined;
        next.taxExemptionTypes = undefined;
        next.craBusinessNumber = undefined;
        return clearNewAccountDeliveryErrors(clearAdditionalShipToErrors(2, next));
      });
      return;
    }

    if (name === "deliveryAddressSameAsBilling") {
      setFormData(prev => {
        const next = {
          ...prev,
          deliveryAddressSameAsBilling: value,
        };
        return value === "yes" ? clearNewAccountDeliveryData(next) : next;
      });
      setErrors(prev => {
        const next = {
          ...prev,
          deliveryAddressSameAsBilling: undefined,
        };
        return value === "yes" ? clearNewAccountDeliveryErrors(next) : next;
      });
      return;
    }

    const additionalShipToField = parseAdditionalShipToFieldName(name);
    if (additionalShipToField) {
      const { field } = additionalShipToField;
      const cleaned = normalizeShipToFieldValue(field, value);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      setErrors(prev => ({
        ...prev,
        [name]: validateShipToFieldValue(field, cleaned) || undefined,
      }));
      return;
    }

    if (isNewAccountDeliveryField(name) && formData.requestType === "newAccount") {
      const cleaned = normalizeNewAccountDeliveryFieldValue(name, value);
      setFormData(prev => ({ ...prev, [name]: cleaned }));
      setErrors(prev => ({
        ...prev,
        [name]: validateNewAccountDeliveryFieldValue(name, cleaned) || undefined,
      }));
      return;
    }

    if (name === "legalName") {
      const cleaned = value
        .normalize("NFC")
        .replace(/[^\p{L}\p{M}\d ]/gu, "")   // elimina caracteres no permitidos
        .slice(0, LEGAL_NAME_MAX);           // tope de 35
    
      setFormData(prev => ({ ...prev, legalName: cleaned }));
      const msg = validateLegalName(cleaned);
      setErrors(prev => ({ ...prev, legalName: msg || undefined }));
      return;
    }
   

    if (name === "billTo") {
      const v = value.normalize("NFC");
      setFormData(prev => ({ ...prev, billTo: v }));
      setErrors(prev => ({
        ...prev,
        billTo: validateRequired(v, true, messages.fields.billTo.label) || undefined,
      }));
      return;
    }
    



// --- handleChange (sustituye SOLO el bloque de city) ---
if (name === "city") {
  const cleaned = value
    .normalize("NFC")
    .replace(/[–—]/g, "-")   // en/em dash -> hyphen
    .replace(/[’]/g, "'")    // apóstrofe tipográfico -> simple
    .replace(CITY_STRIP, "") // elimina lo no permitido
    .replace(/\s{2,}/g, " "); // colapsa espacios múltiples
  setFormData(prev => ({ ...prev, city: cleaned }));
  setErrors(prev => ({ ...prev, city: (cleaned.trim() ? (CITY_ALLOWED.test(cleaned) ? undefined : "Only letters, numbers, spaces, hyphens (-), apostrophes ('), and periods (.) are allowed.") : "City is required.") }));
  return;
}
    
    if (name === "province") {
      setFormData(prev => ({ ...prev, province: value }));
      setErrors(prev => ({ ...prev, province: validateProvince(value) || undefined }));
      return;
    }
    

    if (name === "postalCode") {
      const cleaned = normalizePostalInput(value);
      setFormData(prev => ({ ...prev, postalCode: cleaned }));
      setErrors(prev => ({ ...prev, postalCode: validatePostalCode(cleaned) || undefined }));
      return;
    }
    
    if (name === "telephone") {
      handlePhoneFieldChange("telephone", true, value);
      return;
    }
    if (name === "apPhone") {
      handlePhoneFieldChange("apPhone", true, value);
      return;
    }
    if (name === "fax") {
      handlePhoneFieldChange("fax", false, value);
      return;
    }
    

    if (name === "email") {
      const cleaned = value.normalize("NFC").replace(/\s/g, ""); // sin espacios
      setFormData(prev => ({ ...prev, email: cleaned }));
      setErrors(prev => ({
        ...prev,
        email: validateEmail(cleaned, false, messages.fields.email.label) || undefined   // false => opcional
      }));
      return;
    }



    if (name === "apEmail") {
      const cleaned = value
        .normalize("NFC")
        .replace(/\s/g, ""); // quita espacios accidentales
      setFormData(prev => ({ ...prev, apEmail: cleaned }));
      setErrors(prev => ({
        ...prev,
        apEmail: validateEmail(cleaned, true, messages.fields.apEmail.label) || undefined
      }));
      return;
    }
   
    if (name === "existingAccountInfo") {
      const cleaned = value.normalize("NFC").trimStart();
      const required = formData.requestType === "addShipTo";
      setFormData(prev => ({ ...prev, existingAccountInfo: cleaned }));
      setErrors(prev => ({
        ...prev,
        existingAccountInfo: validateRequired(cleaned, required, messages.fields.existingAccountInfo.label) || undefined,
      }));
      return;
    }

    if (name === "payerAddress") {
      const cleaned = value.normalize("NFC").trimStart();
      const required = formData.requestType === "addShipTo";
      setFormData(prev => ({ ...prev, payerAddress: cleaned }));
      setErrors(prev => ({
        ...prev,
        payerAddress: validateRequired(cleaned, required, messages.fields.payerAddress.label) || undefined,
      }));
      return;
    }


    if (name === "requestorEmail") {
      const cleaned = value.normalize("NFC").replace(/\s/g, "");
      setFormData(prev => ({ ...prev, requestorEmail: cleaned }));
      setErrors(prev => ({
        ...prev,
        requestorEmail: validateEmail(cleaned, true, messages.fields.requestorEmail.label) || undefined,
      }));
      return;
    }

    if (name === "requestorName") {
      const cleaned = value.normalize("NFC").trimStart();
      setFormData(prev => ({ ...prev, requestorName: cleaned }));
      setErrors(prev => ({
        ...prev,
        requestorName: validateRequired(cleaned, true, messages.fields.requestorName.label) || undefined,
      }));
      return;
    }

    if (name === "taxExemptFile") {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0] ?? null;
      const required =
        formData.paymentTerms === "net30" &&
        formData.taxable === "no" &&
        formData.requestType !== "addShipTo";
      setTaxExemptFile(file);
      setErrors(prev => ({
        ...prev,
        taxExemptFile: validateTaxExemptFile(file, required) || undefined,
      }));
      return;
    }

    if (name === "paymentTerms") {
      setFormData(prev => ({
        ...prev,
        paymentTerms: value,
        taxable: value === "net30" && !prev.taxable ? "yes" : prev.taxable,
      }));
      setErrors(prev => {
        // 👇 anota explícitamente el tipo para que exista firma de índice
        const next: Record<string, string | undefined> = {
          ...prev,
          paymentTerms: validatePaymentTerms(value) || undefined,
        };
    
        if (value === "creditCard") {
          const bankKeys = ["bankName","accountManager","bankPhone","bankEmail","bankAccountNumber"] as const;
          bankKeys.forEach(k => { delete next[k]; });

          const tradeFields = ["Company","Account","Address","Tel","Contact","Email"] as const;
          ( [1,2,3] as const).forEach(i => {
            tradeFields.forEach(f => { delete next[`trade${f}${i}`]; });
          });
          delete next.creditAmount;
          delete next.initialOrder;
          delete next.taxable;
          delete next.taxExemptionTypes;
          delete next.craBusinessNumber;
          delete next.taxExemptFile;
        }
        return next;
      });
      if (value !== "net30") {
        setTaxExemptFile(null);
      }
      return;
    }
       

    if (name === "resell") {
      const nextResell = value;
      const keepDistribution = nextResell === "yes";
      if (!keepDistribution) {
        setIntendedDistribution([]);
      }
      const distributionSelection = keepDistribution ? intendedDistribution : [];

      const distributionMsg = distributionSelection.length
        ? validateIntendedDistribution(distributionSelection, nextResell)
        : null;

      setFormData(prev => ({
        ...prev,
        resell: nextResell,
        intendedDistribution: distributionSelection.join(", "),
      }));
      setErrors(prev => ({
        ...prev,
        resell: validateResell(nextResell) || undefined,
        intendedDistribution: distributionMsg || undefined,
      }));
      return;
    }

    if (name === "annualPurchase") {
      setFormData(prev => ({ ...prev, annualPurchase: value }));
      setErrors(prev => ({
        ...prev,
        annualPurchase: validateAnnualPurchase(value) || undefined,
      }));
      return;
    }


    if (name === "typeOfOrganization") {
      setFormData(prev => ({ ...prev, typeOfOrganization: value }));
      setErrors(prev => ({
        ...prev,
        typeOfOrganization: validateRequired(value, true, messages.fields.typeOfOrganization.label) || undefined,
      }));
      return;
    }

    if (name === "typeOfBusiness") {
      setFormData(prev => ({ ...prev, typeOfBusiness: value }));
      setErrors(prev => ({
        ...prev,
        typeOfBusiness: validateTypeOfBusiness(value) || undefined,
      }));
      return;
    }

    if (name === "products") {
      const cleaned = value.normalize("NFC").trimStart();
      setFormData(prev => ({ ...prev, products: cleaned }));
      setErrors(prev => ({
        ...prev,
        products: validateRequired(cleaned, true, messages.fields.products.label) || undefined,
      }));
      return;
    }

    if (name === "creditAmount") {
      const cleaned = value.normalize("NFC").replace(/\s{2,}/g, " ");
      const required = formData.paymentTerms === "net30";
      setFormData(prev => ({ ...prev, creditAmount: cleaned }));
      setErrors(prev => ({
        ...prev,
        creditAmount: validateRequired(cleaned, required, messages.fields.creditAmount.label) || undefined,
      }));
      return;
    }

    if (name === "craBusinessNumber") {
      const cleaned = value.normalize("NFC").trimStart();
      const required =
        formData.paymentTerms === "net30" &&
        formData.taxable === "no" &&
        formData.requestType !== "addShipTo";
      setFormData(prev => ({ ...prev, craBusinessNumber: cleaned }));
      setErrors(prev => ({
        ...prev,
        craBusinessNumber: validateRequired(cleaned, required, messages.fields.craBusinessNumber.label) || undefined,
      }));
      return;
    }

    if (name === "taxable") {
      const required = formData.paymentTerms === "net30";
      const requiresTaxExemptDetails =
        formData.paymentTerms === "net30" &&
        value === "no" &&
        formData.requestType !== "addShipTo";
      setFormData(prev => ({ ...prev, taxable: value }));
      if (value !== "no") {
        setTaxExemptFile(null);
      }
      setErrors(prev => ({
        ...prev,
        taxable: validateRequired(value, required, messages.fields.taxable.label) || undefined,
        taxExemptFile: validateTaxExemptFile(value === "no" ? taxExemptFile : null, requiresTaxExemptDetails) || undefined,
        taxExemptionTypes: validateTaxExemptionTypes(taxExemptionTypes, requiresTaxExemptDetails) || undefined,
        craBusinessNumber: validateRequired(
          formData.craBusinessNumber,
          requiresTaxExemptDetails,
          messages.fields.craBusinessNumber.label
        ) || undefined,
      }));
      return;
    }



             // LAS SIGUIENTES VALIDACIONES SOLO SE USAN PARA PAYMENT TERMS NET 30

    if (name === "bankName") {
      const cleaned = value.normalize("NFC").replace(/\s{2,}/g, " ");
      const required = formData.paymentTerms === "net30";
      setFormData(prev => ({ ...prev, bankName: cleaned }));
      setErrors(prev => ({ ...prev, bankName: validateRequired(cleaned, required, messages.fields.bankName.label) || undefined }));
      return;
    }
    
    if (name === "accountManager") {
      const cleaned = value.normalize("NFC").replace(/\s{2,}/g, " ");
      const required = formData.paymentTerms === "net30";
      setFormData(prev => ({ ...prev, accountManager: cleaned }));
      setErrors(prev => ({ ...prev, accountManager: validateRequired(cleaned, required, messages.fields.accountManager.label) || undefined }));
      return;
    }
    
    if (name === "bankPhone") {
      const required = formData.paymentTerms === "net30";
      const normalized = normalizePhoneCA(value); // el mismo que usas para Telephone/AP Phone
      setFormData(prev => ({ ...prev, bankPhone: normalized }));
      setErrors(prev => ({ ...prev, bankPhone: validatePhoneCA(normalized, required, messages.fields.bankPhone.label) || undefined }));
      return;
    }
    
    if (name === "bankEmail") {
      const required = formData.paymentTerms === "net30";
      const cleaned = value.normalize("NFC").replace(/\s/g, "");
      setFormData(prev => ({ ...prev, bankEmail: cleaned }));
      setErrors(prev => ({ ...prev, bankEmail: validateEmail(cleaned, required, messages.fields.bankEmail.label) || undefined }));
      return;
    }
    
    if (name === "bankAccountNumber") {
      const digits = onlyDigits(value); // opcional: slice(0, 30) si quieres tope
      setFormData(prev => ({ ...prev, bankAccountNumber: digits }));
      // opcional: no marcamos error; es opcional y ya sanitizamos a dígitos
      setErrors(prev => ({ ...prev, bankAccountNumber: undefined }));
      return;
    }
    

// --- Trade References: detección genérica por nombre ---
const t = name.match(/^trade(Company|Account|Address|Tel|Contact|Email)([123])$/);
if (t) {
  const field = t[1];
  let newVal = value;

  if (field === 'Tel') {
    newVal = normalizePhoneCA(value);
  } else if (field === 'Email') {
    newVal = value.normalize('NFC').replace(/\s/g, '');
  } else if (field === 'Account') {
    newVal = onlyDigits(value); // solo dígitos, sin tope de longitud
  } else {
    newVal = value.normalize('NFC').replace(/\s{2,}/g, ' ');
  }

  setFormData(prev => ({ ...prev, [name]: newVal }));

  const msg = validateTradeField(name, newVal);
  setErrors(prev => ({ ...prev, [name]: msg || undefined }));

  return;
}





    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  function handleAdditionalShipToAnswer(index: number, answer: "yes" | "no") {
    if (answer === "yes") {
      setShipToCount(prev => Math.min(SHIP_TO_MAX, Math.max(prev, index + 1)));
      return;
    }

    setShipToCount(index);
    setFormData(prev => clearAdditionalShipToData(index + 1, prev));
    setErrors(prev => clearAdditionalShipToErrors(index + 1, prev));
  }

  const deliveryAddressNoteId = (name: string) => `${name}-business-address-note`;

  const renderDeliveryAddressNote = (name: string) =>
    focusedDeliveryAddressField === name ? (
      <p id={deliveryAddressNoteId(name)} className="text-sm font-semibold text-gray-700 mt-1">
        {messages.fields.shipTo.businessAddressNote}
      </p>
    ) : null;

  const deliveryAddressDescribedBy = (name: string, errorId?: string) => {
    const ids = [
      errorId && errors[name] ? errorId : undefined,
      focusedDeliveryAddressField === name ? deliveryAddressNoteId(name) : undefined,
    ].filter(Boolean);

    return ids.length ? ids.join(" ") : undefined;
  };


  const renderInput = (label: string, name: keyof typeof formData, type = 'text', isTextArea = false, placeholder?: string) => {
    const fieldName = String(name);
    const isDeliveryAddressField = isTextArea && fieldName === "shipTo";
    const errorId = `${fieldName}-error`;
    const commonClass = `w-full border rounded px-3 py-2 ${errors[fieldName] ? 'border-red-600' : ''}`;

    return (
      <div>
        <label className="block mb-1" htmlFor={fieldName}>{label}</label>
        {isTextArea ? (
          <>
            <textarea
              id={fieldName}
              name={name}
              value={formData[name]}
              onChange={handleChange}
              onFocus={isDeliveryAddressField ? () => setFocusedDeliveryAddressField(fieldName) : undefined}
              onBlur={
                isDeliveryAddressField
                  ? () => {
                      setFocusedDeliveryAddressField(prev => (prev === fieldName ? null : prev));
                      setErrors(prev => ({
                        ...prev,
                        [fieldName]: validateShipToFieldValue("shipTo", formData.shipTo) || undefined,
                      }));
                    }
                  : undefined
              }
              placeholder={placeholder}
              className={commonClass}
              rows={2}
              aria-invalid={!!errors[fieldName]}
              aria-describedby={
                isDeliveryAddressField ? deliveryAddressDescribedBy(fieldName, errorId) : undefined
              }
            />
            {isDeliveryAddressField && renderDeliveryAddressNote(fieldName)}
            {errors[fieldName] && <p id={errorId} className="text-red-600 text-sm mt-1">{errors[fieldName]}</p>}
          </>
        ) : (
          <input
            id={fieldName}
            type={type}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            placeholder={placeholder}
            className={commonClass}
            aria-invalid={!!errors[fieldName]}
            aria-describedby={errors[fieldName] ? errorId : undefined}
          />
        )}
        {!isTextArea && errors[fieldName] && (
          <p id={errorId} className="text-red-600 text-sm mt-1">{errors[fieldName]}</p>
        )}
      </div>
    );
  }

  const withRequiredMark = (label: string, required = false) =>
    required ? `* ${label}` : label;


const router = useRouter();


//  EL SIGUIENTE CODIGO ES PARA ARMAR EL EMAIL CON FORMATO VISUALMENTE AMIGABLE

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cell(v: unknown): string {
  return esc(v).replace(/\n/g, "<br>");
}

function tr(label: string, value: unknown): string {
  const val = String(value ?? "").trim();
  if (!val) return ""; // no imprimas filas vacías
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

// Para decidir si TR3 se incluye (solo si el usuario escribió algo)






type FormValues = Record<string, string>;

function tradeGroupHasAnyLocal(fd: FormValues, i: number): boolean {
  const fields = ["Company","Account","Address","Tel","Contact","Email"] as const;
  return fields.some(f => (fd[`trade${f}${i}`] ?? "").trim() !== "");
}

function shipToGroupHasAnyLocal(fd: FormValues, index: number): boolean {
  return SHIP_TO_FIELDS.some(field => (fd[getShipToFieldName(index, field)] ?? "").trim() !== "");
}

function shipToEmailCount(fd: FormValues): number {
  const explicit = Number(fd.shipToCount);
  if (Number.isInteger(explicit) && explicit >= 1) {
    return Math.min(explicit, SHIP_TO_MAX);
  }

  let count = 1;
  for (const index of ADDITIONAL_SHIP_TO_INDEXES) {
    if (shipToGroupHasAnyLocal(fd, index)) count = index;
  }
  return count;
}

function buildEmailHtml(fd: FormValues, timestamp: string): string {
  const rows: string[] = [];
  const emailText = messages.email;
  const fieldLabels = messages.fields;
  const requestTypeLabel =
    fd["requestType"] === "addShipTo"
      ? fieldLabels.requestType.options.addShipTo
      : fieldLabels.requestType.options.newAccount;
  const legalNameLabel =
    fd["requestType"] === "addShipTo"
      ? fieldLabels.legalName.addShipToLabel
      : fieldLabels.legalName.label;
  const routingLabels = {
    to: locale === "fr" ? "Courriel destinataire (To)" : "Email To",
    cc: locale === "fr" ? "Courriel en copie (Cc)" : "Email Cc",
  };
  const instructionText = buildInstructionText(fd);
  const instructionHtml = instructionText
    ? `<div style="font-weight:700;font-size:16px;color:#8B0000;margin:0 0 12px 0;">${cell(instructionText)}</div>`
    : "";
  const primaryKey = fd["primarySegment"] as keyof typeof messages.options.segmentation.secondaryByPrimary;
  const secondaryOptions = messages.options.segmentation.secondaryByPrimary[primaryKey] ?? [];
  const primaryLabel =
    messages.options.segmentation.primary.find(p => p.value === fd["primarySegment"])?.label ??
    fd["primarySegment"];
  const secondaryLabel =
    secondaryOptions.find(s => s.value === fd["secondarySegment"])?.label ?? fd["secondarySegment"];

  rows.push(section(emailText.section_requestSummary));
  rows.push(tr(emailText.submittedAt, timestamp));

  rows.push(section(emailText.section_requestDetails));
  rows.push(
    tr(fieldLabels.requestType.label, requestTypeLabel),
    tr(fieldLabels.existingAccountInfo.label, fd["existingAccountInfo"]),
    tr(fieldLabels.payerAddress.label, fd["payerAddress"]),
    tr(routingLabels.to, fd["formEmailTo"]),
    tr(routingLabels.cc, fd["formEmailCc"]),
  );

  if (fd["requestType"] === "addShipTo") {
    for (let index = 1; index <= shipToEmailCount(fd); index += 1) {
      rows.push(section(formatMessage(fieldLabels.additionalShipTo.groupTitle, { idx: index })));
      rows.push(
        tr(legalNameLabel, fd[getShipToFieldName(index, "legalName")]),
        tr(fieldLabels.shipTo.label, fd[getShipToFieldName(index, "shipTo")]),
        tr(fieldLabels.city.label, fd[getShipToFieldName(index, "city")]),
        tr(fieldLabels.province.label, fd[getShipToFieldName(index, "province")]),
        tr(fieldLabels.postalCode.label, fd[getShipToFieldName(index, "postalCode")]),
        tr(fieldLabels.telephone.label, fd[getShipToFieldName(index, "telephone")]),
        tr(fieldLabels.fax.label, fd[getShipToFieldName(index, "fax")]),
        tr(fieldLabels.website.label, fd[getShipToFieldName(index, "website")]),
        tr(fieldLabels.email.label, fd[getShipToFieldName(index, "email")]),
      );
    }
  } else {
    rows.push(section(emailText.section_customerInfo));
    rows.push(
      tr(legalNameLabel,  fd["legalName"]),
      tr(fieldLabels.city.label,        fd["city"]),
      tr(fieldLabels.province.label,    fd["province"]),
      tr(fieldLabels.postalCode.label, fd["postalCode"]),
      tr(fieldLabels.telephone.label,   fd["telephone"]),
      tr(fieldLabels.fax.label,         fd["fax"]),
      tr(fieldLabels.website.label,     fd["website"]),
      tr(fieldLabels.email.label,       fd["email"]),
    );

    const deliveryAddressAnswer =
      fd["deliveryAddressSameAsBilling"] === "yes"
        ? fieldLabels.newAccountDelivery.yes
        : fd["deliveryAddressSameAsBilling"] === "no"
          ? fieldLabels.newAccountDelivery.no
          : fd["deliveryAddressSameAsBilling"];

    rows.push(section(emailText.section_addresses));
    rows.push(
      tr(fieldLabels.billTo.label, fd["billTo"]),
      tr(fieldLabels.newAccountDelivery.question, deliveryAddressAnswer),
    );
    if (fd["deliveryAddressSameAsBilling"] === "yes") {
      rows.push(tr(fieldLabels.shipTo.label, fieldLabels.newAccountDelivery.noNote));
    }
    if (fd["deliveryAddressSameAsBilling"] === "no") {
      rows.push(
        tr(fieldLabels.shipTo.label, fd["shipTo"]),
        tr(fieldLabels.city.label, fd["shipToCity"]),
        tr(fieldLabels.province.label, fd["shipToProvince"]),
        tr(fieldLabels.postalCode.label, fd["shipToPostalCode"]),
        tr(fieldLabels.telephone.label, fd["shipToTelephone"]),
        tr(fieldLabels.fax.label, fd["shipToFax"]),
        tr(fieldLabels.email.label, fd["shipToEmail"]),
      );
    }

    rows.push(section(emailText.section_accountsPayable));
    rows.push(
      tr(fieldLabels.apContact.label,               fd["apContact"]),
      tr(fieldLabels.apPhone.label,   fd["apPhone"]),
      tr(fieldLabels.apEmail.label,   fd["apEmail"]),
      tr(fieldLabels.paymentTerms.label,            fd["paymentTerms"] === "net30" ? emailText.paymentNet30Short
                                     : fd["paymentTerms"] === "creditCard" ? emailText.paymentCreditCardShort
                                     : fd["paymentTerms"]),
    );
  }

  if (fd["requestType"] !== "addShipTo") {
    rows.push(section(emailText.section_companyInformation));
    rows.push(
      tr(fieldLabels.typeOfOrganization.label,          fd["typeOfOrganization"]),
      tr(fieldLabels.yearsInBusiness.label,             fd["yearsInBusiness"]),
      tr(fieldLabels.typeOfBusiness.label,              fd["typeOfBusiness"]),
      tr(fieldLabels.annualSales.label,                  fd["annualSales"]),
      tr(fieldLabels.resell.label,          fd["resell"]),
      tr(fieldLabels.intendedDistribution.label, fd["intendedDistribution"]),
      tr(fieldLabels.creditAmount.label,       fd["creditAmount"]),
      tr(fieldLabels.products.label, fd["products"]),
    );

    if (fd["paymentTerms"] === "net30") {
      rows.push(
        tr(fieldLabels.initialOrder.label,       fd["initialOrder"]),
        tr(fieldLabels.annualPurchase.label,      fd["annualPurchase"]),
        tr(fieldLabels.taxable.label,                       fd["taxable"]),
      );
      if (fd["taxable"] === "no") {
        rows.push(
          tr(fieldLabels.taxExemptionTypes.label, fd["taxExemptionTypes"]),
          tr(fieldLabels.craBusinessNumber.label, fd["craBusinessNumber"]),
        );
      }
      rows.push(section(emailText.section_bankReferences));
      rows.push(
        tr(fieldLabels.bankName.label,        fd["bankName"]),
        tr(fieldLabels.bankAddress.label,     fd["bankAddress"]),
        tr(fieldLabels.accountManager.label,  fd["accountManager"]),
        tr(fieldLabels.bankPhone.label,       fd["bankPhone"]),
        tr(fieldLabels.bankFax.label,         fd["bankFax"]),
        tr(fieldLabels.bankEmail.label,       fd["bankEmail"]),
        tr(fieldLabels.bankAccountNumber.label,   fd["bankAccountNumber"]),
      );

      rows.push(section(emailText.section_tradeReferences));
      for (const i of [1, 2, 3] as const) {
        if (i === 3 && !tradeGroupHasAnyLocal(fd, 3)) continue;
        rows.push(`<tr><td colspan="2" style="padding:8px 10px;font-weight:600;border:1px solid #e5e7eb;background:#fafafa">${esc(formatMessage(fieldLabels.trade.groupTitle, { idx: i }))}</td></tr>`);
        rows.push(
          tr(fieldLabels.trade.company.label,    fd[`tradeCompany${i}`]),
          tr(fieldLabels.trade.account.label,     fd[`tradeAccount${i}`]),
          tr(fieldLabels.trade.address.label,         fd[`tradeAddress${i}`]),
          tr(fieldLabels.trade.tel.label,       fd[`tradeTel${i}`]),
          tr(fieldLabels.trade.contact.label,  fd[`tradeContact${i}`]),
          tr(fieldLabels.trade.email.label,           fd[`tradeEmail${i}`]),
        );
      }
    }
  }

  rows.push(section(messages.sections.customerSegmentation));
  rows.push(
    tr(fieldLabels.primarySegment.label, primaryLabel),
    tr(fieldLabels.secondarySegment.label, secondaryLabel),
  );

  rows.push(section(messages.sections.finalInformation));
  rows.push(
    tr(fieldLabels.requestorName.label, fd["requestorName"]),
    tr(fieldLabels.requestorEmail.label, fd["requestorEmail"]),
    tr(fieldLabels.title.label, fd["title"]),
    tr(fieldLabels.salesRepName.label, fd["salesRepName"]),
    tr(fieldLabels.date.label, fd["date"]),
  );

  return `
  <div style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:14px;color:#111827">
    <h2 style="margin:0 0 12px 0">${esc(messages.page.title)}</h2>
    ${instructionHtml}
    <table style="border-collapse:collapse;width:100%">${rows.join("")}</table>
  </div>`;
}


const handleSubmit = async () => {
  if (isSubmitting) return;
  const isAddShipTo = formData.requestType === "addShipTo";

  const msg = validateLegalName(formData.legalName);
  if (msg) {
    setErrors(prev => ({ ...prev, legalName: msg }));
    alert(messages.alerts.fixErrors);
    return;
  }


  const billToMsg = isAddShipTo
    ? null
    : validateRequired(formData.billTo ?? "", true, messages.fields.billTo.label);
  if (billToMsg) {
    setErrors(prev => ({ ...prev, billTo: billToMsg }));
    alert(messages.alerts.fixErrors);
    return;
  }


  const cityMsg = validateCity(formData.city);
  const provMsg = validateProvince(formData.province);
  
  if (cityMsg || provMsg) {
    setErrors(prev => ({
      ...prev,
      city: cityMsg || undefined,
      province: provMsg || undefined,
    }));
    alert(messages.alerts.fixErrors);
    return;
  }
  
  const pcMsg = validatePostalCode(formData.postalCode);
  if (pcMsg) {
    setErrors(prev => ({ ...prev, postalCode: pcMsg }));
    alert(messages.alerts.fixErrors);
    return;
  }


  const emailMsg = validateEmail(formData.email ?? "", true, messages.fields.email.label);
  const telMsg = validatePhoneCA(formData.telephone, true, messages.fields.telephone.label);
  const apMsg = !isAddShipTo
    ? validatePhoneCA(formData.apPhone, true, messages.fields.apPhone.label)
    : null;
  const faxMsg = validatePhoneCA(formData.fax ?? "", false, messages.fields.fax.label);
  const apEmailMsg = !isAddShipTo
    ? validateEmail(formData.apEmail ?? "", true, messages.fields.apEmail.label)
    : null;
  const payMsg = formData.requestType === "newAccount" ? validatePaymentTerms(formData.paymentTerms) : null;
  const existingAccountMsg = isAddShipTo
    ? validateRequired(formData.existingAccountInfo, true, messages.fields.existingAccountInfo.label)
    : null;
  const payerAddressMsg = isAddShipTo
    ? validateRequired(formData.payerAddress, true, messages.fields.payerAddress.label)
    : null;
  const shipToMsg = isAddShipTo
    ? validateShipToFieldValue("shipTo", formData.shipTo ?? "")
    : null;
  const deliveryQuestionMsg = !isAddShipTo
    ? validateRequired(
        formData.deliveryAddressSameAsBilling ?? "",
        true,
        messages.fields.newAccountDelivery.question
      )
    : null;
  const resellMsg = !isAddShipTo ? validateResell(formData.resell) : null;
  const distributionMsg = !isAddShipTo
    ? validateIntendedDistribution(intendedDistribution, formData.resell)
    : null;
  const annualPurchaseMsg = !isAddShipTo ? validateAnnualPurchase(formData.annualPurchase) : null;
  const typeOrgMsg = !isAddShipTo
    ? validateRequired(formData.typeOfOrganization, true, messages.fields.typeOfOrganization.label)
    : null;
  const typeBusinessMsg = !isAddShipTo
    ? validateTypeOfBusiness(formData.typeOfBusiness)
    : null;
  const productsMsg = !isAddShipTo
    ? validateRequired(formData.products, true, messages.fields.products.label)
    : null;
  const creditAmountMsg = !isAddShipTo && formData.paymentTerms === "net30"
    ? validateRequired(formData.creditAmount, true, messages.fields.creditAmount.label)
    : null;
  const taxableMsg = !isAddShipTo && formData.paymentTerms === "net30"
    ? validateRequired(formData.taxable, true, messages.fields.taxable.label)
    : null;
  const taxExemptionTypesMsg = !isAddShipTo && formData.paymentTerms === "net30" && formData.taxable === "no"
    ? validateTaxExemptionTypes(taxExemptionTypes, true)
    : null;
  const craBusinessNumberMsg = !isAddShipTo && formData.paymentTerms === "net30" && formData.taxable === "no"
    ? validateRequired(formData.craBusinessNumber, true, messages.fields.craBusinessNumber.label)
    : null;
  const requiresTaxExemptFile =
    !isAddShipTo && formData.paymentTerms === "net30" && formData.taxable === "no";
  const taxExemptFileMsg = validateTaxExemptFile(taxExemptFile, requiresTaxExemptFile);
  const requestorNameMsg = validateRequired(formData.requestorName ?? "", true, messages.fields.requestorName.label);
  const requestorEmailMsg = validateEmail(formData.requestorEmail ?? "", true, messages.fields.requestorEmail.label);

// Solo si Net 30: valida Bank References
if (!isAddShipTo && formData.paymentTerms === "net30") {
  const bankNameMsg = validateRequired(formData.bankName, true, messages.fields.bankName.label);
  const acctMgrMsg  = validateRequired(formData.accountManager, true, messages.fields.accountManager.label);
  const bankPhoneMsg = validatePhoneCA(formData.bankPhone, true, messages.fields.bankPhone.label);
  const bankEmailMsg = validateEmail(formData.bankEmail, true, messages.fields.bankEmail.label);

  // Sanitiza Account Number a dígitos antes de enviar
  const sanitizedAcc = onlyDigits(formData.bankAccountNumber || "");
  if (sanitizedAcc !== (formData.bankAccountNumber || "")) {
    setFormData(prev => ({ ...prev, bankAccountNumber: sanitizedAcc }));
  }

  if (bankNameMsg || acctMgrMsg || bankPhoneMsg || bankEmailMsg || creditAmountMsg || taxableMsg) {
    setErrors(prev => ({
      ...prev,
      bankName: bankNameMsg || undefined,
      accountManager: acctMgrMsg || undefined,
      bankPhone: bankPhoneMsg || undefined,
      bankEmail: bankEmailMsg || undefined,
      creditAmount: creditAmountMsg || undefined,
      taxable: taxableMsg || undefined,
    }));
    alert(messages.alerts.fixErrors);
    return;
  }
}


if (telMsg || apMsg || faxMsg || apEmailMsg || payMsg  || emailMsg || resellMsg || distributionMsg || annualPurchaseMsg || typeOrgMsg || typeBusinessMsg || productsMsg || creditAmountMsg || taxableMsg || taxExemptionTypesMsg || craBusinessNumberMsg || taxExemptFileMsg || requestorNameMsg || requestorEmailMsg || existingAccountMsg || payerAddressMsg || shipToMsg || deliveryQuestionMsg) {
  setErrors(prev => ({
    ...prev,
    telephone: telMsg || undefined,
    apPhone: apMsg || undefined,
    fax: faxMsg || undefined,
    apEmail: apEmailMsg || undefined,
    paymentTerms: payMsg || undefined,
    existingAccountInfo: existingAccountMsg || undefined,
    payerAddress: payerAddressMsg || undefined,
    shipTo: shipToMsg || undefined,
    deliveryAddressSameAsBilling: deliveryQuestionMsg || undefined,
    resell: resellMsg || undefined,
    intendedDistribution: distributionMsg || undefined,
    annualPurchase: annualPurchaseMsg || undefined,
    typeOfOrganization: typeOrgMsg || undefined,
    typeOfBusiness: typeBusinessMsg || undefined,
    products: productsMsg || undefined,
    creditAmount: creditAmountMsg || undefined,
    taxable: taxableMsg || undefined,
    taxExemptionTypes: taxExemptionTypesMsg || undefined,
    craBusinessNumber: craBusinessNumberMsg || undefined,
    taxExemptFile: taxExemptFileMsg || undefined,
    requestorName: requestorNameMsg || undefined,
    requestorEmail: requestorEmailMsg || undefined,
    email: emailMsg || undefined,
  }));
  alert(messages.alerts.fixErrors);
  return;
}

const additionalShipToErrors = isAddShipTo ? validateAdditionalShipTos() : {};
if (Object.keys(additionalShipToErrors).length > 0) {
  setErrors(prev => ({ ...prev, ...additionalShipToErrors }));
  alert(messages.alerts.fixErrors);
  return;
}

const newAccountDeliveryErrors =
  !isAddShipTo && formData.deliveryAddressSameAsBilling === "no"
    ? validateNewAccountDeliveryFields()
    : {};
if (Object.keys(newAccountDeliveryErrors).length > 0) {
  setErrors(prev => ({ ...prev, ...newAccountDeliveryErrors }));
  alert(messages.alerts.fixErrors);
  return;
}




// --- Trade References: validar SOLO si Net 30 ---
if (!isAddShipTo && formData.paymentTerms === "net30") {
// --- Trade References: 1 y 2 siempre; 3 solo si empezó a llenarse ---
const tradeErrs: Record<string, string | undefined> = {};
[1, 2, 3].forEach((idx) => {
  const req = tradeIsRequired(idx);
  if (!req && !tradeGroupHasAny(idx)) return; // TR3 vacío por completo -> lo ignoramos

  for (const f of TRADE_FIELDS) {
    const name = `trade${f}${idx}`;
    const msg = validateTradeField(name);
    if (msg) tradeErrs[name] = msg;
  }
});

if (Object.keys(tradeErrs).length > 0) {
  setErrors(prev => ({ ...prev, ...tradeErrs }));
  alert(messages.alerts.fixErrors);
  return;
}
}



const submissionData = isAddShipTo
  ? { ...formData, shipToCount: String(shipToCount) }
  : formData;
const routing = computeEmailRouting(submissionData);

setIsSubmitting(true);
try {
  const payload = new FormData();
  payload.append("formData", JSON.stringify(submissionData));
  payload.append("locale", locale);
  if (taxExemptFile) {
    payload.append("taxExemptFile", taxExemptFile);
  }
  const response = await fetch("/api/submit", {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data?.error) {
        errorMessage = data.error;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
      }
    }
    alert(formatMessage(messages.alerts.emailSendError, { errorMessage }));
    return;
  }

  router.push(`/confirmation?variant=${routing.confirmationVariant}&locale=${locale}`);
} catch (error: unknown) {
  const errorMessage =
    error instanceof Error ? error.message : messages.alerts.unknownError;
  console.error("Submit error:", errorMessage);
  alert(formatMessage(messages.alerts.emailSendError, { errorMessage }));
} finally {
  setIsSubmitting(false);
}

};




  const { fields, placeholders, sections, options, page } = messages;
  const distributionOptions = [
    { value: CANADA_WIDE_OPTION, label: options.intendedDistribution.canadaWide },
    ...options.provinces,
  ];
  const taxExemptionTypeOptions = [
    { value: "GST", label: options.taxExemptionTypes.gst },
    { value: "HST", label: options.taxExemptionTypes.hst },
    { value: "PST", label: options.taxExemptionTypes.pst },
    { value: "QST", label: options.taxExemptionTypes.qst },
  ];
  const pdfFilename = locale === 'fr'
    ? "Credit Application Form - Fr version - Jan25.pdf"
    : "Credit Application Form - En version - Jan25.pdf";
  const pdfUrl = encodeURI(`/${pdfFilename}`);

  const requiredShipToFields = new Set<ShipToField>([
    "legalName",
    "shipTo",
    "city",
    "province",
    "postalCode",
    "telephone",
    "email",
  ]);

  const renderAdditionalShipToField = (index: number, field: ShipToField) => {
    const name = getShipToFieldName(index, field);
    const label = getShipToFieldLabel(field);
    const required = requiredShipToFields.has(field);
    const errorId = `${name}-error`;
    const commonClass = `w-full border rounded px-3 py-2 ${errors[name] ? 'border-red-600' : ''}`;

    if (field === "province") {
      return (
        <div key={name}>
          <label className="block mb-1" htmlFor={name}>{withRequiredMark(label, required)}</label>
          <select
            id={name}
            name={name}
            value={formData[name] ?? ""}
            onChange={handleChange}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                [name]: validateShipToFieldValue(field, formData[name] ?? "") || undefined,
              }))
            }
            className={commonClass}
            aria-invalid={!!errors[name]}
            aria-describedby={errorId}
          >
            <option value="">{page.select}</option>
            {options.provinces.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors[name] && <p id={errorId} className="text-red-600 text-sm mt-1">{errors[name]}</p>}
        </div>
      );
    }

    if (field === "shipTo") {
      return (
        <div key={name}>
          <label className="block mb-1" htmlFor={name}>{withRequiredMark(label, required)}</label>
          <textarea
            id={name}
            name={name}
            rows={2}
            value={formData[name] ?? ""}
            onChange={handleChange}
            onFocus={() => setFocusedDeliveryAddressField(name)}
            onBlur={() => {
              setFocusedDeliveryAddressField(prev => (prev === name ? null : prev));
              setErrors(prev => ({
                ...prev,
                [name]: validateShipToFieldValue(field, formData[name] ?? "") || undefined,
              }));
            }}
            className={commonClass}
            aria-invalid={!!errors[name]}
            aria-describedby={deliveryAddressDescribedBy(name, errorId)}
          />
          {renderDeliveryAddressNote(name)}
          {errors[name] && <p id={errorId} className="text-red-600 text-sm mt-1">{errors[name]}</p>}
        </div>
      );
    }

    const inputType =
      field === "telephone" || field === "fax"
        ? "tel"
        : field === "email"
          ? "email"
          : "text";
    const placeholder =
      field === "telephone" || field === "fax"
        ? placeholders.phone
        : field === "email"
          ? placeholders.email
          : field === "postalCode"
            ? placeholders.postalCode
            : undefined;
    const inputMode =
      inputType === "tel"
        ? "tel"
        : inputType === "email"
          ? "email"
          : field === "postalCode"
            ? "text"
            : undefined;

    return (
      <div key={name}>
        <label className="block mb-1" htmlFor={name}>{withRequiredMark(label, required)}</label>
        <input
          id={name}
          name={name}
          type={inputType}
          inputMode={inputMode}
          autoComplete={inputType === "tel" ? "tel" : inputType === "email" ? "email" : undefined}
          autoCapitalize={field === "postalCode" ? "characters" : undefined}
          placeholder={placeholder}
          maxLength={field === "legalName" ? LEGAL_NAME_MAX : field === "postalCode" ? 7 : undefined}
          pattern={field === "legalName" ? "[\\p{L}\\p{M}\\d ]+" : undefined}
          value={formData[name] ?? ""}
          onChange={handleChange}
          onBlur={() =>
            setErrors(prev => ({
              ...prev,
              [name]: validateShipToFieldValue(field, formData[name] ?? "") || undefined,
            }))
          }
          className={commonClass}
          aria-invalid={!!errors[name]}
          aria-describedby={errorId}
        />
        {errors[name] && <p id={errorId} className="text-red-600 text-sm mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const renderAdditionalShipToQuestion = (index: number) => {
    if (index >= SHIP_TO_MAX) {
      return (
        <p className="md:col-span-2 text-sm text-gray-700">
          {fields.additionalShipTo.maxReached}
        </p>
      );
    }

    const questionId = `additionalShipToQuestion-${index}`;
    const radioName = `additionalShipToQuestion${index}`;

    return (
      <fieldset className="md:col-span-2 border-t border-gray-200 pt-4">
        <legend id={questionId} className="font-medium">{fields.additionalShipTo.question}</legend>
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={radioName}
              value="yes"
              checked={shipToCount > index}
              onChange={() => handleAdditionalShipToAnswer(index, "yes")}
            />
            {fields.additionalShipTo.yes}
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="radio"
              name={radioName}
              value="no"
              checked={shipToCount <= index}
              onChange={() => handleAdditionalShipToAnswer(index, "no")}
            />
            {fields.additionalShipTo.no}
          </label>
        </div>
      </fieldset>
    );
  };

  const renderAdditionalShipToSection = (index: number) => (
    <div key={index} className="md:col-span-2 border-t border-gray-200 pt-5 mt-2">
      <h2 className="text-lg font-semibold text-[#170f5f] mb-4">
        {formatMessage(fields.additionalShipTo.groupTitle, { idx: index })}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHIP_TO_FIELDS.map(field => renderAdditionalShipToField(index, field))}
        {renderAdditionalShipToQuestion(index)}
      </div>
    </div>
  );

  const requiredNewAccountDeliveryFields = new Set<NewAccountDeliveryField>([
    "shipTo",
    "shipToCity",
    "shipToProvince",
    "shipToPostalCode",
    "shipToTelephone",
    "shipToEmail",
  ]);

  const renderNewAccountDeliveryField = (field: NewAccountDeliveryField) => {
    const name = field;
    const label = getNewAccountDeliveryFieldLabel(field);
    const required = requiredNewAccountDeliveryFields.has(field);
    const errorId = `${name}-error`;
    const commonClass = `w-full border rounded px-3 py-2 ${errors[name] ? 'border-red-600' : ''}`;

    if (field === "shipToProvince") {
      return (
        <div key={name}>
          <label className="block mb-1" htmlFor={name}>{withRequiredMark(label, required)}</label>
          <select
            id={name}
            name={name}
            value={formData[name] ?? ""}
            onChange={handleChange}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                [name]: validateNewAccountDeliveryFieldValue(field, formData[name] ?? "") || undefined,
              }))
            }
            className={commonClass}
            aria-invalid={!!errors[name]}
            aria-describedby={errorId}
          >
            <option value="">{page.select}</option>
            {options.provinces.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {errors[name] && <p id={errorId} className="text-red-600 text-sm mt-1">{errors[name]}</p>}
        </div>
      );
    }

    if (field === "shipTo") {
      return (
        <div key={name}>
          <label className="block mb-1" htmlFor={name}>{withRequiredMark(label, required)}</label>
          <textarea
            id={name}
            name={name}
            rows={2}
            value={formData[name] ?? ""}
            onChange={handleChange}
            onFocus={() => setFocusedDeliveryAddressField(name)}
            onBlur={() => {
              setFocusedDeliveryAddressField(prev => (prev === name ? null : prev));
              setErrors(prev => ({
                ...prev,
                [name]: validateNewAccountDeliveryFieldValue(field, formData[name] ?? "") || undefined,
              }));
            }}
            className={commonClass}
            aria-invalid={!!errors[name]}
            aria-describedby={deliveryAddressDescribedBy(name, errorId)}
          />
          {renderDeliveryAddressNote(name)}
          {errors[name] && <p id={errorId} className="text-red-600 text-sm mt-1">{errors[name]}</p>}
        </div>
      );
    }

    const inputType =
      field === "shipToTelephone" || field === "shipToFax"
        ? "tel"
        : field === "shipToEmail"
          ? "email"
          : "text";
    const placeholder =
      field === "shipToTelephone" || field === "shipToFax"
        ? placeholders.phone
        : field === "shipToEmail"
          ? placeholders.email
          : field === "shipToPostalCode"
            ? placeholders.postalCode
            : undefined;
    const inputMode =
      inputType === "tel"
        ? "tel"
        : inputType === "email"
          ? "email"
          : field === "shipToPostalCode"
            ? "text"
            : undefined;

    return (
      <div key={name}>
        <label className="block mb-1" htmlFor={name}>{withRequiredMark(label, required)}</label>
        <input
          id={name}
          name={name}
          type={inputType}
          inputMode={inputMode}
          autoComplete={inputType === "tel" ? "tel" : inputType === "email" ? "email" : undefined}
          autoCapitalize={field === "shipToPostalCode" ? "characters" : undefined}
          placeholder={placeholder}
          maxLength={field === "shipToPostalCode" ? 7 : undefined}
          value={formData[name] ?? ""}
          onChange={handleChange}
          onBlur={() =>
            setErrors(prev => ({
              ...prev,
              [name]: validateNewAccountDeliveryFieldValue(field, formData[name] ?? "") || undefined,
            }))
          }
          className={commonClass}
          aria-invalid={!!errors[name]}
          aria-describedby={errorId}
        />
        {errors[name] && <p id={errorId} className="text-red-600 text-sm mt-1">{errors[name]}</p>}
      </div>
    );
  };

  const renderNewAccountDeliveryQuestion = () => (
    <fieldset
      className="md:col-span-2 border-t border-gray-200 pt-4"
      aria-invalid={!!errors.deliveryAddressSameAsBilling}
      aria-describedby={errors.deliveryAddressSameAsBilling ? "deliveryAddressSameAsBilling-error" : undefined}
    >
      <legend className="font-medium">{fields.newAccountDelivery.question}</legend>
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="deliveryAddressSameAsBilling"
            value="yes"
            checked={formData.deliveryAddressSameAsBilling === "yes"}
            onChange={handleChange}
          />
          {fields.newAccountDelivery.yes}
        </label>
        <label className="inline-flex items-center gap-2">
          <input
            type="radio"
            name="deliveryAddressSameAsBilling"
            value="no"
            checked={formData.deliveryAddressSameAsBilling === "no"}
            onChange={handleChange}
          />
          {fields.newAccountDelivery.no}
        </label>
      </div>
      {errors.deliveryAddressSameAsBilling && (
        <p id="deliveryAddressSameAsBilling-error" className="text-red-600 text-sm mt-1">
          {errors.deliveryAddressSameAsBilling}
        </p>
      )}
      {formData.deliveryAddressSameAsBilling === "yes" && (
        <p className="text-sm font-bold text-gray-700 mt-3">{fields.newAccountDelivery.noNote}</p>
      )}
    </fieldset>
  );

  const renderNewAccountDeliverySection = () => (
    <div className="md:col-span-2 border-t border-gray-200 pt-5 mt-2">
      <h2 className="text-lg font-semibold text-[#170f5f] mb-4">{fields.shipTo.label}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {NEW_ACCOUNT_DELIVERY_FIELDS.map(field => renderNewAccountDeliveryField(field))}
      </div>
    </div>
  );

  return (

   <main className="max-w-4xl mx-auto p-6 bg-white text-black">



<div className="flex flex-col md:flex-row items-center md:justify-between text-center md:text-left gap-2 mb-6">
  <Image
    src="/Medtronic_logo.jpg"
    alt="Medtronic"
    width={160}
    height={48}
    className="h-12 w-auto"
    priority
  />
  <div className="flex items-center gap-3">
    <h1 className="text-xl font-bold">{page.title}</h1>
    <button
      type="button"
      onClick={() => setLocale(prev => (prev === 'en' ? 'fr' : 'en'))}
      className="text-sm border border-[#170f5f] text-[#170f5f] px-3 py-1 rounded hover:bg-[#170f5f] hover:text-white transition"
      aria-label="Toggle language / Changer de langue"
    >
      {locale === 'en' ? 'Français' : 'English'}
    </button>
  </div>
</div>

<div className="flex justify-end mb-4">
  <a
    href={pdfUrl}
    download={pdfFilename}
    className="text-[#170f5f] underline hover:text-[#1f1790]"
  >
    {page.downloadPdf}
  </a>
</div>



      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl"  
             noValidate
             onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
               >
        
        <div className="md:col-span-2 border rounded px-4 py-3 bg-[#f9fafb]">
          <p className="font-semibold mb-2">{fields.requestType.label}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="requestType"
                value="newAccount"
                checked={formData.requestType === "newAccount"}
                onChange={handleChange}
              />
              {fields.requestType.options.newAccount}
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="requestType"
                value="addShipTo"
                checked={formData.requestType === "addShipTo"}
                onChange={handleChange}
              />
              {fields.requestType.options.addShipTo}
            </label>
          </div>

          {formData.requestType === "addShipTo" && (
            <div className="mt-3 space-y-3">
              <p className="text-sm text-gray-700">{fields.requestType.addShipToNote}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1" htmlFor="existingAccountInfo">{withRequiredMark(fields.existingAccountInfo.label, true)}</label>
                  <textarea
                    id="existingAccountInfo"
                    name="existingAccountInfo"
                    rows={2}
                    value={formData.existingAccountInfo}
                    onChange={handleChange}
                    onBlur={() =>
                      setErrors(prev => ({
                        ...prev,
                        existingAccountInfo: validateRequired(
                          formData.existingAccountInfo,
                          true,
                          fields.existingAccountInfo.label
                        ) || undefined,
                      }))
                    }
                    className={`w-full border rounded px-3 py-2 ${errors.existingAccountInfo ? 'border-red-600' : ''}`}
                    aria-invalid={!!errors.existingAccountInfo}
                    aria-describedby="existingAccountInfo-error"
                  />
                  {errors.existingAccountInfo && (
                    <p id="existingAccountInfo-error" className="text-red-600 text-sm mt-1">{errors.existingAccountInfo}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-1" htmlFor="payerAddress">{withRequiredMark(fields.payerAddress.label, true)}</label>
                  <textarea
                    id="payerAddress"
                    name="payerAddress"
                    rows={2}
                    value={formData.payerAddress}
                    onChange={handleChange}
                    onBlur={() =>
                      setErrors(prev => ({
                        ...prev,
                        payerAddress: validateRequired(
                          formData.payerAddress,
                          true,
                          fields.payerAddress.label
                        ) || undefined,
                      }))
                    }
                    className={`w-full border rounded px-3 py-2 ${errors.payerAddress ? 'border-red-600' : ''}`}
                    aria-invalid={!!errors.payerAddress}
                    aria-describedby="payerAddress-error"
                  />
                  {errors.payerAddress && (
                    <p id="payerAddress-error" className="text-red-600 text-sm mt-1">{errors.payerAddress}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

  
        <div>
  <label className="block mb-1" htmlFor="legalName">{withRequiredMark(getLegalNameLabel(), true)}</label>
  <input
    id="legalName"
    name="legalName"
    type="text"
    value={formData.legalName}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        legalName: validateLegalName(formData.legalName) || undefined
      }))
    }
    maxLength={LEGAL_NAME_MAX}
    // El atributo pattern ayuda al navegador; la validación real ya la hacemos arriba
    pattern="[\p{L}\p{M}\d ]+"
    className={`w-full border rounded px-3 py-2 ${errors.legalName ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.legalName}
    aria-describedby="legalName-error"
  />
  {errors.legalName && (
    <p id="legalName-error" className="text-red-600 text-sm mt-1">{errors.legalName}</p>
  )}
</div>

{formData.requestType !== "addShipTo" && (
<div>
  <label className="block mb-1" htmlFor="billTo">{withRequiredMark(fields.billTo.label, true)}</label>
  <textarea
    id="billTo"
    name="billTo"
    rows={2}
    value={formData.billTo}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        billTo: validateRequired(formData.billTo, true, fields.billTo.label) || undefined,
      }))
    }
    className={`w-full border rounded px-3 py-2 ${errors.billTo ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.billTo}
    aria-describedby="billTo-error"
  />
  {errors.billTo && (
    <p id="billTo-error" className="text-red-600 text-sm mt-1">{errors.billTo}</p>
  )}
</div>
)}

        {formData.requestType === "addShipTo" && renderInput(withRequiredMark(fields.shipTo.label, true), 'shipTo', 'text', true)}

  <div>
  <label className="block mb-1" htmlFor="city">{withRequiredMark(fields.city.label, true)}</label>
  <input
    id="city"
    name="city"
    type="text"
    pattern="[A-Za-zÀ-ÖØ-öø-ÿ0-9 .'\-]+"
    value={formData.city}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        city: validateCity(formData.city) || undefined
      }))
    }
    className={`w-full border rounded px-3 py-2 ${errors.city ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.city}
    aria-describedby="city-error"
  />
  {errors.city && (
    <p id="city-error" className="text-red-600 text-sm mt-1">{errors.city}</p>
  )}
</div>




<div>
  <label className="block mb-1" htmlFor="province">{withRequiredMark(fields.province.label, true)}</label>
  <select
    id="province"
    name="province"
    value={formData.province}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        province: validateProvince(formData.province) || undefined
      }))
    }
    className={`w-full border rounded px-3 py-2 ${errors.province ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.province}
    aria-describedby="province-error"
  >
    <option value="">{page.select}</option>
    {options.provinces.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
  {errors.province && (
    <p id="province-error" className="text-red-600 text-sm mt-1">{errors.province}</p>
  )}
</div>

<div>
  <label className="block mb-1" htmlFor="postalCode">{withRequiredMark(fields.postalCode.label, true)}</label>
  <input
    id="postalCode"
    name="postalCode"
    type="text"
    inputMode="text"
    autoCapitalize="characters"
    placeholder={placeholders.postalCode}
    maxLength={7} // 6 caracteres + 1 espacio
    value={formData.postalCode}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        postalCode: validatePostalCode(formData.postalCode) || undefined
      }))
    }
   
    className={`w-full border rounded px-3 py-2 ${errors.postalCode ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.postalCode}
    aria-describedby="postalCode-error"
  />
  {errors.postalCode && (
    <p id="postalCode-error" className="text-red-600 text-sm mt-1">{errors.postalCode}</p>
  )}
</div>


{/* Telephone (required) */}
<div>
  <label className="block mb-1" htmlFor="telephone">{withRequiredMark(fields.telephone.label, true)}</label>
  <input
    id="telephone"
    name="telephone"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    placeholder={placeholders.phone}
    value={formData.telephone}
    onChange={handleChange}
    onBlur={() => setErrors(prev => ({
      ...prev,
      telephone: validatePhoneCA(formData.telephone, true, fields.telephone.label) || undefined
    }))}
    // patrón flexible: +1 opcional, separadores opcionales
    pattern="^(\+?1[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}$"
    className={`w-full border rounded px-3 py-2 ${errors.telephone ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.telephone}
    aria-describedby="telephone-error"
  />
  {errors.telephone && <p id="telephone-error" className="text-red-600 text-sm mt-1">{errors.telephone}</p>}
</div>
        



{/* Fax (optional) */}
<div>
  <label className="block mb-1" htmlFor="fax">{fields.fax.label}</label>
  <input
    id="fax"
    name="fax"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    placeholder={placeholders.phone}
    value={formData.fax}
    onChange={handleChange}
    onBlur={() => setErrors(prev => ({
      ...prev,
      fax: validatePhoneCA(formData.fax ?? "", false, fields.fax.label) || undefined
    }))}
    pattern="^(\+?1[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}$"
    className={`w-full border rounded px-3 py-2 ${errors.fax ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.fax}
    aria-describedby="fax-error"
  />
  {errors.fax && <p id="fax-error" className="text-red-600 text-sm mt-1">{errors.fax}</p>}
</div>



        {renderInput(fields.website.label, 'website')}


        <div>
  <label className="block mb-1" htmlFor="email">{withRequiredMark(fields.email.label, true)}</label>
  <input
    id="email"
    name="email"
    type="email"
    inputMode="email"
    autoComplete="email"
    placeholder={placeholders.email}
    value={formData.email}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        email: validateEmail(formData.email ?? "", true, fields.email.label) || undefined
      }))
    }
    className={`w-full border rounded px-3 py-2 ${errors.email ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.email}
    aria-describedby="email-error"
  />
  {errors.email && (
    <p id="email-error" className="text-red-600 text-sm mt-1">{errors.email}</p>
  )}
</div>


        {formData.requestType === "newAccount" && renderNewAccountDeliveryQuestion()}
        {formData.requestType === "newAccount" &&
          formData.deliveryAddressSameAsBilling === "no" &&
          renderNewAccountDeliverySection()}
        {formData.requestType === "newAccount" && (
          <div className="md:col-span-2 border-t border-gray-200 pt-5 mt-2">
            <h2 className="text-lg font-semibold text-[#170f5f] mb-4">{sections.accountsPayableInformation}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderInput(fields.apContact.label, 'apContact')}



{/* Accounts Payable Phone (required) */}
<div>
  <label className="block mb-1" htmlFor="apPhone">{withRequiredMark(fields.apPhone.label, true)}</label>
  <input
    id="apPhone"
    name="apPhone"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    placeholder={placeholders.phone}
    value={formData.apPhone}
    onChange={handleChange}
    onBlur={() => setErrors(prev => ({
      ...prev,
      apPhone: validatePhoneCA(formData.apPhone, true, fields.apPhone.label) || undefined
    }))}
    pattern="^(\+?1[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}$"
    className={`w-full border rounded px-3 py-2 ${errors.apPhone ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.apPhone}
    aria-describedby="apphone-error"
  />
  {errors.apPhone && <p id="apphone-error" className="text-red-600 text-sm mt-1">{errors.apPhone}</p>}
</div>



 <div>
   <label className="block mb-1" htmlFor="apEmail">{withRequiredMark(fields.apEmail.label, true)}</label>
   <input
     id="apEmail"
     name="apEmail"
     type="email"
     inputMode="email"
     autoComplete="email"
     placeholder={placeholders.apEmail}
     value={formData.apEmail}
     onChange={handleChange}
     onBlur={() =>
       setErrors(prev => ({
         ...prev,
         apEmail: validateEmail(formData.apEmail ?? "", true, fields.apEmail.label) || undefined
       }))
     }
     className={`w-full border rounded px-3 py-2 ${errors.apEmail ? 'border-red-600' : ''}`}
     aria-invalid={!!errors.apEmail}
     aria-describedby="apEmail-error"
   />
   {errors.apEmail && (
     <p id="apEmail-error" className="text-red-600 text-sm mt-1">{errors.apEmail}</p>
   )}
 </div>
            </div>
          </div>
        )}

{formData.requestType === "addShipTo" && renderAdditionalShipToQuestion(1)}
{formData.requestType === "addShipTo" &&
  ADDITIONAL_SHIP_TO_INDEXES
    .filter(index => index <= shipToCount)
    .map(index => renderAdditionalShipToSection(index))}


{formData.requestType === 'newAccount' && (
  <div className="md:col-span-2 mt-6">
    <h2 className="text-xl font-semibold text-[#170f5f] mb-2">{withRequiredMark(sections.paymentTerms, true)}</h2>
    <div
      role="radiogroup"
      aria-labelledby="payment-terms-label"
      aria-invalid={!!errors.paymentTerms}
      aria-describedby={errors.paymentTerms ? "payment-terms-error" : undefined}
      className="flex flex-col gap-2"
    >
      <span id="payment-terms-label" className="sr-only">{fields.paymentTerms.label}</span>

      <label className="inline-flex items-center gap-2">
        <input
          type="radio"
          name="paymentTerms"
          value="creditCard"
          checked={formData.paymentTerms === "creditCard"}
          onChange={handleChange}
          onBlur={() =>
            setErrors(prev => ({
              ...prev,
              paymentTerms: validatePaymentTerms(formData.paymentTerms) || undefined
            }))
          }
        />
        {options.paymentTerms.creditCard}
      </label>

      <label className="inline-flex items-center gap-2">
        <input
          type="radio"
          name="paymentTerms"
          value="net30"
          checked={formData.paymentTerms === "net30"}
          onChange={handleChange}
          onBlur={() =>
            setErrors(prev => ({
              ...prev,
              paymentTerms: validatePaymentTerms(formData.paymentTerms) || undefined
            }))
          }
        />
        {options.paymentTerms.net30}
      </label>
    </div>

    {errors.paymentTerms && (
      <p id="payment-terms-error" className="text-red-600 text-sm mt-1">{errors.paymentTerms}</p>
    )}
  </div>
)}




        {formData.requestType !== "addShipTo" && (
        <>
        <div className="md:col-span-2 mt-8">
          <h2 className="text-xl font-semibold text-[#170f5f] mb-2">{sections.companyInformation}</h2>
        </div>


 <div>
  <label className="block mb-1">{withRequiredMark(fields.typeOfOrganization.label, true)}</label>
  <select
    name="typeOfOrganization"
    value={formData.typeOfOrganization}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        typeOfOrganization: validateRequired(formData.typeOfOrganization, true, fields.typeOfOrganization.label) || undefined,
      }))
    }
    className={`w-full border rounded px-3 py-2 ${errors.typeOfOrganization ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.typeOfOrganization}
    aria-describedby="typeOfOrganization-error"
  >
    {options.typeOfOrganization.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
  {errors.typeOfOrganization && (
    <p id="typeOfOrganization-error" className="text-red-600 text-sm mt-1">{errors.typeOfOrganization}</p>
  )}
</div>

            {renderInput(fields.yearsInBusiness.label, 'yearsInBusiness')}
            <div>
              <label className="block mb-1">{withRequiredMark(fields.typeOfBusiness.label, true)}</label>
              <select
                name="typeOfBusiness"
                value={formData.typeOfBusiness}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    typeOfBusiness: validateTypeOfBusiness(formData.typeOfBusiness) || undefined,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${errors.typeOfBusiness ? 'border-red-600' : ''}`}
                aria-invalid={!!errors.typeOfBusiness}
                aria-describedby="typeOfBusiness-error"
              >
                {options.typeOfBusiness.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.typeOfBusiness && (
                <p id="typeOfBusiness-error" className="text-red-600 text-sm mt-1">{errors.typeOfBusiness}</p>
              )}
            </div>
            {renderInput(fields.annualSales.label, 'annualSales')}
            <div>
              <label className="block mb-1">{withRequiredMark(fields.resell.label, true)}</label>
              <select
                name="resell"
                value={formData.resell}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    resell: validateResell(formData.resell) || undefined,
                  }))
                }
                aria-invalid={!!errors.resell}
                aria-describedby="resell-error"
              >
                {options.resell.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.resell && (
                <p id="resell-error" className="text-red-600 text-sm mt-1">{errors.resell}</p>
              )}
            </div>
            {formData.resell === 'yes' && (
              <fieldset
                className={`border rounded px-3 py-2 ${errors.intendedDistribution ? 'border-red-600' : ''}`}
                aria-invalid={!!errors.intendedDistribution}
                aria-describedby="intendedDistribution-error"
              >
                <legend className="px-1 text-sm font-medium">{withRequiredMark(fields.intendedDistribution.label, true)}</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                  {distributionOptions.map(opt => {
                    const checked = intendedDistribution.includes(opt.value);
                    return (
                      <label key={opt.value} className="inline-flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="intendedDistribution"
                          value={opt.value}
                          checked={checked}
                          onChange={(e) => handleDistributionCheckbox(opt.value, e.target.checked)}
                        />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
                {errors.intendedDistribution && (
                  <p id="intendedDistribution-error" className="text-red-600 text-sm mt-2">{errors.intendedDistribution}</p>
                )}
              </fieldset>
            )}
            <div>
              <label className="block mb-1">{withRequiredMark(fields.products.label, true)}</label>
              <textarea
                name="products"
                value={formData.products}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    products: validateRequired(formData.products, true, fields.products.label) || undefined,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${errors.products ? 'border-red-600' : ''}`}
                rows={2}
                aria-invalid={!!errors.products}
                aria-describedby="products-error"
              />
              {errors.products && (
                <p id="products-error" className="text-red-600 text-sm mt-1">{errors.products}</p>
              )}
            </div>
            <div>
              <label className="block mb-1">{withRequiredMark(fields.annualPurchase.label, true)}</label>
              <select
                name="annualPurchase"
                value={formData.annualPurchase}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    annualPurchase: validateAnnualPurchase(formData.annualPurchase) || undefined,
                  }))
                }
                className="w-full border rounded px-3 py-2"
                aria-invalid={!!errors.annualPurchase}
                aria-describedby="annualPurchase-error"
              >
                {options.annualPurchase.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.annualPurchase && (
                <p id="annualPurchase-error" className="text-red-600 text-sm mt-1">{errors.annualPurchase}</p>
              )}
            </div>
            {formData.paymentTerms === 'net30' && (
              <>
                {renderInput(fields.initialOrder.label, 'initialOrder')}
                <div>
                  <label className="block mb-1">{withRequiredMark(fields.creditAmount.label, true)}</label>
                  <input
                    type="text"
                    name="creditAmount"
                    value={formData.creditAmount}
                    onChange={handleChange}
                    onBlur={() =>
                      setErrors(prev => ({
                        ...prev,
                        creditAmount: validateRequired(formData.creditAmount, true, fields.creditAmount.label) || undefined,
                      }))
                    }
                    className={`w-full border rounded px-3 py-2 ${errors.creditAmount ? 'border-red-600' : ''}`}
                    aria-invalid={!!errors.creditAmount}
                    aria-describedby="creditAmount-error"
                  />
                  {errors.creditAmount && (
                    <p id="creditAmount-error" className="text-red-600 text-sm mt-1">{errors.creditAmount}</p>
                  )}
                </div>

<div className="md:col-span-2 mt-4">
  <h3 className="text-lg font-semibold text-[#170f5f] mb-2">{sections.taxes}</h3>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block mb-1">{withRequiredMark(fields.taxable.label, true)}</label>
      <select
        name="taxable"
        value={formData.taxable}
        onChange={handleChange}
        onBlur={() =>
          setErrors(prev => ({
            ...prev,
            taxable: validateRequired(formData.taxable, true, fields.taxable.label) || undefined,
          }))
        }
        className={`w-full border rounded px-3 py-2 ${errors.taxable ? 'border-red-600' : ''}`}
        aria-invalid={!!errors.taxable}
        aria-describedby="taxable-error"
      >
        {options.taxable.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {errors.taxable && (
        <p id="taxable-error" className="text-red-600 text-sm mt-1">{errors.taxable}</p>
      )}
    </div>

    {formData.taxable === "no" && (
      <>
        <fieldset
          className={`md:col-span-2 border rounded px-3 py-2 ${errors.taxExemptionTypes ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.taxExemptionTypes}
          aria-describedby="taxExemptionTypes-error"
        >
          <legend className="px-1 text-sm font-medium">{withRequiredMark(fields.taxExemptionTypes.label, true)}</legend>
          <div className="grid grid-cols-1 gap-2 mt-1">
            {taxExemptionTypeOptions.map(opt => {
              const checked = taxExemptionTypes.includes(opt.value);
              return (
                <label key={opt.value} className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => handleTaxExemptionTypeCheckbox(opt.value, e.target.checked)}
                    onBlur={() =>
                      setErrors(prev => ({
                        ...prev,
                        taxExemptionTypes: validateTaxExemptionTypes(
                          taxExemptionTypes,
                          formData.paymentTerms === "net30" &&
                            formData.taxable === "no" &&
                            formData.requestType !== "addShipTo"
                        ) || undefined,
                      }))
                    }
                  />
                  {opt.label}
                </label>
              );
            })}
          </div>
          {errors.taxExemptionTypes && (
            <p id="taxExemptionTypes-error" className="text-red-600 text-sm mt-2">{errors.taxExemptionTypes}</p>
          )}
        </fieldset>

        <div>
          <label className="block mb-1" htmlFor="craBusinessNumber">
            {withRequiredMark(fields.craBusinessNumber.label, true)}
          </label>
          <input
            id="craBusinessNumber"
            type="text"
            name="craBusinessNumber"
            value={formData.craBusinessNumber}
            onChange={handleChange}
            onBlur={() =>
              setErrors(prev => ({
                ...prev,
                craBusinessNumber: validateRequired(
                  formData.craBusinessNumber,
                  formData.paymentTerms === "net30" &&
                    formData.taxable === "no" &&
                    formData.requestType !== "addShipTo",
                  fields.craBusinessNumber.label
                ) || undefined,
              }))
            }
            className={`w-full border rounded px-3 py-2 ${errors.craBusinessNumber ? 'border-red-600' : ''}`}
            aria-invalid={!!errors.craBusinessNumber}
            aria-describedby="craBusinessNumber-error"
          />
          {errors.craBusinessNumber && (
            <p id="craBusinessNumber-error" className="text-red-600 text-sm mt-1">{errors.craBusinessNumber}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1" htmlFor="taxExemptFile">
            {withRequiredMark(fields.taxExemptFile.label, true)}
          </label>
          <label
            htmlFor="taxExemptFile"
            className={`block w-full border rounded px-3 py-2 cursor-pointer ${errors.taxExemptFile ? 'border-red-600' : ''}`}
          >
            {taxExemptFile
              ? formatMessage(fields.taxExemptFile.selectedFile, { fileName: taxExemptFile.name })
              : fields.taxExemptFile.selectFile}
          </label>
          <input
            id="taxExemptFile"
            name="taxExemptFile"
            type="file"
            accept="application/pdf"
            onChange={handleChange}
            className="sr-only"
            aria-invalid={!!errors.taxExemptFile}
            aria-describedby="taxExemptFile-error"
          />
          {errors.taxExemptFile && (
            <p id="taxExemptFile-error" className="text-red-600 text-sm mt-1">{errors.taxExemptFile}</p>
          )}
        </div>
      </>
    )}
  </div>
</div>



            <div className="md:col-span-2 mt-6">
    <h2 className="text-xl font-semibold text-[#170f5f] mb-2">{sections.bankReferences}</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bank Name (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="bankName">{withRequiredMark(fields.bankName.label, formData.paymentTerms === "net30")}</label>
        <input
          id="bankName"
          name="bankName"
          type="text"
          value={formData.bankName}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            bankName: validateRequired(formData.bankName, true, fields.bankName.label) || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.bankName ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.bankName}
          aria-describedby="bankName-error"
        />
        {errors.bankName && <p id="bankName-error" className="text-red-600 text-sm mt-1">{errors.bankName}</p>}
      </div>


      {renderInput(fields.bankAddress.label, 'bankAddress')}




      {/* Account Manager (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="accountManager">{withRequiredMark(fields.accountManager.label, formData.paymentTerms === "net30")}</label>
        <input
          id="accountManager"
          name="accountManager"
          type="text"
          value={formData.accountManager}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            accountManager: validateRequired(formData.accountManager, true, fields.accountManager.label) || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.accountManager ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.accountManager}
          aria-describedby="accountManager-error"
        />
        {errors.accountManager && <p id="accountManager-error" className="text-red-600 text-sm mt-1">{errors.accountManager}</p>}
      </div>

      {/* Bank Phone (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="bankPhone">{withRequiredMark(fields.bankPhone.label, formData.paymentTerms === "net30")}</label>
        <input
          id="bankPhone"
          name="bankPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder={placeholders.phone}
          value={formData.bankPhone}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            bankPhone: validatePhoneCA(formData.bankPhone, true, fields.bankPhone.label) || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.bankPhone ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.bankPhone}
          aria-describedby="bankPhone-error"
        />
        {errors.bankPhone && <p id="bankPhone-error" className="text-red-600 text-sm mt-1">{errors.bankPhone}</p>}
      </div>

      {renderInput(fields.bankFax.label, 'bankFax')}




      {/* Bank Email (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="bankEmail">{withRequiredMark(fields.bankEmail.label, formData.paymentTerms === "net30")}</label>
        <input
          id="bankEmail"
          name="bankEmail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={placeholders.bankEmail}
          value={formData.bankEmail}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            bankEmail: validateEmail(formData.bankEmail, true, fields.bankEmail.label) || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.bankEmail ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.bankEmail}
          aria-describedby="bankEmail-error"
        />
        {errors.bankEmail && <p id="bankEmail-error" className="text-red-600 text-sm mt-1">{errors.bankEmail}</p>}
      </div>

      {/* Account Number (optional, digits only) */}
      <div className="md:col-span-2">
        <label className="block mb-1" htmlFor="bankAccountNumber">{fields.bankAccountNumber.label}</label>
        <input
          id="bankAccountNumber"
          name="bankAccountNumber"
          type="text"
          inputMode="numeric"
          placeholder={placeholders.digitsOnly}
          value={formData.bankAccountNumber}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {/* Sin mensaje: lo sanitizamos a dígitos, no hay validación de longitud */}
      </div>
    </div>
  </div>



      {/* Trade References con tipado corregido */}


            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-[#170f5f] mt-10 mb-4">{sections.tradeReferences}</h2>
              <div className="grid grid-cols-1 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded p-4">
                    <h3 className="text-lg font-semibold mb-2">{formatMessage(fields.trade.groupTitle, { idx: i })}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



                    {['Company', 'Account', 'Address', 'Tel', 'Contact', 'Email'].map((field) => {
  const name = `trade${field}${i}` as const;
  const isTel = field === 'Tel';
  const isEmail = field === 'Email';
  const isRequired = tradeIsRequired(i);

  return (
    <div key={field}>
      <label className="block mb-1" htmlFor={name}>{withRequiredMark(tradeLabel(field), isRequired)}</label>
      <input
        id={name}
        type={isEmail ? 'email' : isTel ? 'tel' : 'text'}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        onBlur={() =>
          setErrors(prev => ({
            ...prev,
            [name]: validateTradeField(name) || undefined,
          }))
        }
        placeholder={isTel ? placeholders.phone : undefined}
        inputMode={isTel ? 'tel' : isEmail ? 'email' : undefined}
        className={`w-full border rounded px-3 py-2 ${errors[name] ? 'border-red-600' : ''}`}
        aria-invalid={!!errors[name]}
        aria-describedby={`${name}-error`}
      />
      {errors[name] && (
        <p id={`${name}-error`} className="text-red-600 text-sm mt-1">{errors[name]}</p>
      )}
    </div>
  );
})}






                    </div>
                  </div>
                ))}
              </div>
            </div>


           
          </>
        )}
        </>
        )}

        <div className="md:col-span-2 mt-8">
          <h2 className="text-xl font-semibold text-[#170f5f] mb-4">{sections.customerSegmentation}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">{fields.primarySegment.label}</label>
              <select
                name="primarySegment"
                value={formData.primarySegment}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                {options.segmentation.primary.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">{fields.secondarySegment.label}</label>
              <select
                name="secondarySegment"
                value={formData.secondarySegment}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{page.select}</option>
                {(secondaryOptions[formData.primarySegment] || []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>


    {/* FINAL SECTION */}
        <div className="md:col-span-2 mt-10">
          <h2 className="text-xl font-semibold text-[#170f5f] mb-4">{sections.finalInformation}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">{withRequiredMark(fields.requestorName.label, true)}</label>
              <input
                type="text"
                name="requestorName"
                value={formData.requestorName}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    requestorName: validateRequired(formData.requestorName ?? "", true, fields.requestorName.label) || undefined,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${errors.requestorName ? 'border-red-600' : ''}`}
                aria-invalid={!!errors.requestorName}
                aria-describedby="requestorName-error"
              />
              {errors.requestorName && (
                <p id="requestorName-error" className="text-red-600 text-sm mt-1">{errors.requestorName}</p>
              )}
            </div>
            <div>
              <label className="block mb-1">{withRequiredMark(fields.requestorEmail.label, true)}</label>
              <input
                type="email"
                name="requestorEmail"
                value={formData.requestorEmail}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    requestorEmail: validateEmail(formData.requestorEmail ?? "", true, fields.requestorEmail.label) || undefined,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${errors.requestorEmail ? 'border-red-600' : ''}`}
                aria-invalid={!!errors.requestorEmail}
                aria-describedby="requestorEmail-error"
              />
              {errors.requestorEmail && (
                <p id="requestorEmail-error" className="text-red-600 text-sm mt-1">{errors.requestorEmail}</p>
              )}
            </div>
            <div>
              <label className="block mb-1">{fields.title.label}</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1">{fields.date.label}</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1">{fields.salesRepName.label}</label>
              <input
                type="text"
                name="salesRepName"
                value={formData.salesRepName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}




<button
  type="submit"
  disabled={isSubmitting}
  className="bg-[#170f5f] text-white px-6 py-2 rounded hover:bg-[#1f1790] transition"
>
  {page.submit}
</button>




      
      </form>
    </main>
  )
}
