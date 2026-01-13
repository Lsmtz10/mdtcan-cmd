
'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import emailjs from '@emailjs/browser'

import { useRouter } from 'next/navigation';
import { MESSAGES, Locale } from './locales';


const EMAIL_TARGETS = {
  customerMasterData: [
    "luis.sergio.martinez@medtronic.com",
    "ricardo.a.morcillo@medtronic.com",
  ],
  channelManagement: ["libia.poveda@medtronic.com"],
  creditTeam: ["josmy.cahuamari@medtronic.com"],
  taxesTeam: ["lsmtz10@hotmail.com"],
} satisfies Record<string, string[]>;

const LOW_ANNUAL_PURCHASE_VALUES = new Set<string>([
  "0 - 25,000",
  "25,001 – 50,000",
  "0 - 25 000",
  "25 001 – 50 000",
]);


const getTodayDate = () => {
  const now = new Date();
  // Ajusta por el offset de tu zona horaria y toma solo la parte de fecha local
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0]; // YYYY-MM-DD en hora local
};



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
    shipTo: '',
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
    gstTaxExempt: '',
    pstTaxExempt: '',
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
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    setErrors({});
  }, [locale]);

  function computeEmailRouting(fd: Record<string, string>) {
    let to = [...EMAIL_TARGETS.customerMasterData];
    let cc: string[] = [];
    let textInstruction = "";
    let confirmationVariant: "default" | "resellYes" | "lowPurchase" = "default";

    const isResellYes = fd.resell === "yes";
    const annual = fd.annualPurchase ?? "";
    const isLowAnnual = LOW_ANNUAL_PURCHASE_VALUES.has(annual);
    const isNet30 = fd.paymentTerms === "net30";

    if (isResellYes) {
      to = [...EMAIL_TARGETS.channelManagement];
      cc = [...EMAIL_TARGETS.customerMasterData];
      textInstruction = "CUSTOMER CREATION MUST WAIT UNTIL CHANNEL MANAGEMENT APPROVES ";
      confirmationVariant = "resellYes";
    } else {
      if (isLowAnnual) {
        to = [...EMAIL_TARGETS.customerMasterData];
        cc = [...EMAIL_TARGETS.channelManagement];
        textInstruction = "THIS IS A LOW VOLUME CUSTOMER, SHOULD NOT BE CREATED, CUSTOMER WAS ADVISED TO CONTACT A DISTRIBUTOR";
        confirmationVariant = "lowPurchase";
      } else {
        to = [...EMAIL_TARGETS.customerMasterData];
        cc = [];
        textInstruction = "PROCEED DIRECTLY WITH THE CREATION OF THIS CUSTOMER";
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
      textInstruction,
      confirmationVariant,
    };
  }

  const formatMessage = (template: string, replacements: Record<string, string | number>) =>
    Object.entries(replacements).reduce(
      (acc, [key, value]) => acc.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
      template
    );



  const LEGAL_NAME_MAX = 35;
  // Letras Unicode (incluye acentos) + marcas combinadas + dígitos + espacios
  const LEGAL_NAME_ALLOWED = /^[\p{L}\p{M}\d ]+$/u;
  
  function validateLegalName(value: string): string | null {
    const v = value.trim();
    if (!v) return messages.errors.legalNameRequired;
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


// Letras permitidas por Canada Post (no D, F, I, O, Q, U)
//  const POSTAL_LETTERS = "ABCEGHJKLMNPRSTVXY";

// Regex oficial con **espacio obligatorio** entre bloques
const POSTAL_REGEX = /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVXY] \d[ABCEGHJKLMNPRSTVXY]\d$/;

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

function validateIntendedDistribution(selected: string[], resellValue: string): string | null {
  if (resellValue !== "yes") return null;
  if (!selected.length) return messages.errors.intendedDistributionRequired;
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

  const secondaryOptions = messages.options.segmentation.secondaryByPrimary as Record<
    string,
    ReadonlyArray<{ value: string; label: string }>
  >;

  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "requestType") {
      const nextType = value;
      setFormData(prev => ({
        ...prev,
        requestType: nextType,
        paymentTerms: nextType === "newAccount" ? prev.paymentTerms : "",
      }));
      setErrors(prev => {
        const next = { ...prev };
        next.paymentTerms = undefined;
        next.requestType = undefined;
        next.existingAccountInfo = undefined;
        next.payerAddress = undefined;
        return next;
      });
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

    if (name === "paymentTerms") {
      setFormData(prev => ({ ...prev, paymentTerms: value }));
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
        }
        return next;
      });
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
      const cleaned = value.normalize("NFC").replace(/\s{2,}/g, " ");
      setFormData(prev => ({ ...prev, typeOfBusiness: cleaned }));
      setErrors(prev => ({
        ...prev,
        typeOfBusiness: validateRequired(cleaned, true, messages.fields.typeOfBusiness.label) || undefined,
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

    if (name === "taxable") {
      const required = formData.paymentTerms === "net30";
      setFormData(prev => ({ ...prev, taxable: value }));
      setErrors(prev => ({
        ...prev,
        taxable: validateRequired(value, required, messages.fields.taxable.label) || undefined,
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



  const renderInput = (label: string, name: keyof typeof formData, type = 'text', isTextArea = false, placeholder?: string) => (
    <div>
      <label className="block mb-1">{label}</label>
      {isTextArea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2"
          rows={2}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border rounded px-3 py-2"
        />
      )}
    </div>
  )


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

function buildEmailHtml(fd: FormValues, timestamp: string): string {
  const rows: string[] = [];
  const emailText = messages.email;
  const fieldLabels = messages.fields;
  const requestTypeLabel =
    fd["requestType"] === "addShipTo"
      ? fieldLabels.requestType.options.addShipTo
      : fieldLabels.requestType.options.newAccount;
  const routingLabels = {
    to: locale === "fr" ? "Courriel destinataire (To)" : "Email To",
    cc: locale === "fr" ? "Courriel en copie (Cc)" : "Email Cc",
  };
  const instructionLabel = locale === "fr" ? "Instruction" : "Instruction";
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
    tr(instructionLabel, fd["textInstruction"]),
  );

  rows.push(section(emailText.section_customerInfo));
  rows.push(
    tr(fieldLabels.legalName.label,  fd["legalName"]),
    tr(fieldLabels.city.label,        fd["city"]),
    tr(fieldLabels.province.label,    fd["province"]),
    tr(fieldLabels.postalCode.label, fd["postalCode"]),
    tr(fieldLabels.telephone.label,   fd["telephone"]),
    tr(fieldLabels.fax.label,         fd["fax"]),
    tr(fieldLabels.website.label,     fd["website"]),
    tr(fieldLabels.email.label,       fd["email"]),
  );

  rows.push(section(emailText.section_addresses));
  rows.push(
    tr(fieldLabels.billTo.label, fd["billTo"]),
    tr(fieldLabels.shipTo.label, fd["shipTo"]),
  );

  rows.push(section(emailText.section_accountsPayable));
  rows.push(
    tr(fieldLabels.apContact.label,               fd["apContact"]),
    tr(fieldLabels.apPhone.label,   fd["apPhone"]),
    tr(fieldLabels.apEmail.label,   fd["apEmail"]),
    tr(fieldLabels.paymentTerms.label,            fd["paymentTerms"] === "net30" ? emailText.paymentNet30Short
                                   : fd["paymentTerms"] === "creditCard" ? emailText.paymentCreditCardShort
                                   : fd["paymentTerms"]),
  );

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
      tr(fieldLabels.gstTaxExempt.label,      fd["gstTaxExempt"]),
      tr(fieldLabels.pstTaxExempt.label,      fd["pstTaxExempt"]),
    );
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
    <table style="border-collapse:collapse;width:100%">${rows.join("")}</table>
  </div>`;
}


const handleSubmit = async () => {
  const timestamp = new Date().toISOString();

  const msg = validateLegalName(formData.legalName);
  if (msg) {
    setErrors(prev => ({ ...prev, legalName: msg }));
    alert(messages.alerts.fixErrors);
    return;
  }


  const billToMsg = validateRequired(formData.billTo ?? "", true, messages.fields.billTo.label);
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
  const apMsg  = validatePhoneCA(formData.apPhone, true, messages.fields.apPhone.label);
  const faxMsg = validatePhoneCA(formData.fax ?? "", false, messages.fields.fax.label);
  const apEmailMsg = validateEmail(formData.apEmail ?? "", true, messages.fields.apEmail.label);
  const payMsg = formData.requestType === "newAccount" ? validatePaymentTerms(formData.paymentTerms) : null;
  const existingAccountMsg = formData.requestType === "addShipTo"
    ? validateRequired(formData.existingAccountInfo, true, messages.fields.existingAccountInfo.label)
    : null;
  const payerAddressMsg = formData.requestType === "addShipTo"
    ? validateRequired(formData.payerAddress, true, messages.fields.payerAddress.label)
    : null;
  const resellMsg = validateResell(formData.resell);
  const distributionMsg = validateIntendedDistribution(intendedDistribution, formData.resell);
  const annualPurchaseMsg = validateAnnualPurchase(formData.annualPurchase);
  const typeOrgMsg = validateRequired(formData.typeOfOrganization, true, messages.fields.typeOfOrganization.label);
  const typeBusinessMsg = validateRequired(formData.typeOfBusiness, true, messages.fields.typeOfBusiness.label);
  const productsMsg = validateRequired(formData.products, true, messages.fields.products.label);
  const creditAmountMsg = formData.paymentTerms === "net30"
    ? validateRequired(formData.creditAmount, true, messages.fields.creditAmount.label)
    : null;
  const taxableMsg = formData.paymentTerms === "net30"
    ? validateRequired(formData.taxable, true, messages.fields.taxable.label)
    : null;
  const requestorEmailMsg = validateEmail(formData.requestorEmail ?? "", true, messages.fields.requestorEmail.label);

// Solo si Net 30: valida Bank References
if (formData.paymentTerms === "net30") {
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


if (telMsg || apMsg || faxMsg || apEmailMsg || payMsg  || emailMsg || resellMsg || distributionMsg || annualPurchaseMsg || typeOrgMsg || typeBusinessMsg || productsMsg || creditAmountMsg || taxableMsg || requestorEmailMsg || existingAccountMsg || payerAddressMsg) {
  setErrors(prev => ({
    ...prev,
    telephone: telMsg || undefined,
    apPhone: apMsg || undefined,
    fax: faxMsg || undefined,
    apEmail: apEmailMsg || undefined,
    paymentTerms: payMsg || undefined,
    existingAccountInfo: existingAccountMsg || undefined,
    payerAddress: payerAddressMsg || undefined,
    resell: resellMsg || undefined,
    intendedDistribution: distributionMsg || undefined,
    annualPurchase: annualPurchaseMsg || undefined,
    typeOfOrganization: typeOrgMsg || undefined,
    typeOfBusiness: typeBusinessMsg || undefined,
    products: productsMsg || undefined,
    creditAmount: creditAmountMsg || undefined,
    taxable: taxableMsg || undefined,
    requestorEmail: requestorEmailMsg || undefined,
    email: emailMsg || undefined,
  }));
  alert(messages.alerts.fixErrors);
  return;
}




// --- Trade References: validar SOLO si Net 30 ---
if (formData.paymentTerms === "net30") {
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



const routing = computeEmailRouting(formData);
const finalForm = {
  ...formData,
  formEmailTo: routing.to,
  formEmailCc: routing.cc,
  textInstruction: routing.textInstruction,
};

// Fallback en texto (manténlo por compatibilidad con tu template actual)
const formattedData = Object.entries(finalForm)
  .map(([key, value]) => `${key}: ${value}`)
  .join('\n');

// Construye el HTML con etiquetas amigables y secciones condicionales
const formHtml = buildEmailHtml(finalForm, timestamp);

try {
  await emailjs.send(
    'service_i6is1vl',     // Service ID
    'template_yuvc7fc',    // Template ID
    {
      formHtml,            // <-- usa esto en tu plantilla
      formData: formattedData, // <-- respaldo de texto
      timestamp: timestamp,
      formEmailTo: finalForm.formEmailTo,
      formEmailCc: finalForm.formEmailCc,
      textInstruction: finalForm.textInstruction,
    },
    'BhNrfAyGnu7vx_rYL'    // Public Key
  );

  router.push(`/confirmation?variant=${routing.confirmationVariant}&locale=${locale}`);

  
    
} catch (error: unknown) {
  let errorMessage: string = messages.alerts.unknownError;

  if (
    typeof error === 'object' &&
    error !== null &&
    ('text' in error || 'message' in error)
  ) {
    errorMessage = (error as { text?: string; message?: string }).text
      ?? (error as { text?: string; message?: string }).message
      ?? messages.alerts.unknownError;
  }

  console.error('Email sending error:', errorMessage);
  alert(formatMessage(messages.alerts.emailSendError, { errorMessage }));
}

};




  const { fields, placeholders, sections, options, page } = messages;
  const distributionOptions = [
    { value: CANADA_WIDE_OPTION, label: options.intendedDistribution.canadaWide },
    ...options.provinces,
  ];
  const pdfFilename = locale === 'fr'
    ? "Credit Application Form - Fr version - Jan25.pdf"
    : "Credit Application Form - En version - Jan25.pdf";
  const pdfUrl = encodeURI(`/${pdfFilename}`);

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
                  <label className="block mb-1" htmlFor="existingAccountInfo">{fields.existingAccountInfo.label}</label>
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
                  <label className="block mb-1" htmlFor="payerAddress">{fields.payerAddress.label}</label>
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
  <label className="block mb-1" htmlFor="legalName">{fields.legalName.label}</label>
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

  <div>
  <label className="block mb-1" htmlFor="city">{fields.city.label}</label>
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
  <label className="block mb-1" htmlFor="province">{fields.province.label}</label>
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
  <label className="block mb-1" htmlFor="postalCode">{fields.postalCode.label}</label>
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
  <label className="block mb-1" htmlFor="telephone">{fields.telephone.label}</label>
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
  <label className="block mb-1" htmlFor="email">{fields.email.label}</label>
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




<div>
  <label className="block mb-1" htmlFor="billTo">{fields.billTo.label}</label>
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




        {renderInput(fields.shipTo.label, 'shipTo', 'text', true)}
        {renderInput(fields.apContact.label, 'apContact')}



{/* Accounts Payable Phone (required) */}
<div>
  <label className="block mb-1" htmlFor="apPhone">{fields.apPhone.label}</label>
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
   <label className="block mb-1" htmlFor="apEmail">{fields.apEmail.label}</label>
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


{formData.requestType === 'newAccount' && (
  <div className="md:col-span-2 mt-6">
    <h2 className="text-xl font-semibold text-[#170f5f] mb-2">{sections.paymentTerms}</h2>
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




        <div className="md:col-span-2 mt-8">
          <h2 className="text-xl font-semibold text-[#170f5f] mb-2">{sections.companyInformation}</h2>
        </div>


 <div>
  <label className="block mb-1">{fields.typeOfOrganization.label}</label>
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
              <label className="block mb-1">{fields.typeOfBusiness.label}</label>
              <input
                type="text"
                name="typeOfBusiness"
                value={formData.typeOfBusiness}
                onChange={handleChange}
                onBlur={() =>
                  setErrors(prev => ({
                    ...prev,
                    typeOfBusiness: validateRequired(formData.typeOfBusiness, true, fields.typeOfBusiness.label) || undefined,
                  }))
                }
                className={`w-full border rounded px-3 py-2 ${errors.typeOfBusiness ? 'border-red-600' : ''}`}
                aria-invalid={!!errors.typeOfBusiness}
                aria-describedby="typeOfBusiness-error"
              />
              {errors.typeOfBusiness && (
                <p id="typeOfBusiness-error" className="text-red-600 text-sm mt-1">{errors.typeOfBusiness}</p>
              )}
            </div>
            {renderInput(fields.annualSales.label, 'annualSales')}
            <div>
              <label className="block mb-1">{fields.resell.label}</label>
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
                <legend className="px-1 text-sm font-medium">{fields.intendedDistribution.label}</legend>
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
              <label className="block mb-1">{fields.products.label}</label>
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
              <label className="block mb-1">{fields.annualPurchase.label}</label>
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
                  <label className="block mb-1">{fields.creditAmount.label}</label>
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

<div>
  <label className="block mb-1">{fields.taxable.label}</label>
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

<div className="mt-4">
  <label className="block mb-1">
    {fields.gstTaxExempt.label}
  </label>
  <input
    type="text"
    name="gstTaxExempt"
    value={formData.gstTaxExempt}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2"
  />
</div>

<div className="mt-4">
  <label className="block mb-1">
    {fields.pstTaxExempt.label}
  </label>
  <input
    type="text"
    name="pstTaxExempt"
    value={formData.pstTaxExempt}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2"
  />
</div>



            <div className="md:col-span-2 mt-6">
    <h2 className="text-xl font-semibold text-[#170f5f] mb-2">{sections.bankReferences}</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bank Name (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="bankName">{fields.bankName.label}</label>
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
        <label className="block mb-1" htmlFor="accountManager">{fields.accountManager.label}</label>
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
        <label className="block mb-1" htmlFor="bankPhone">{fields.bankPhone.label}</label>
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
        <label className="block mb-1" htmlFor="bankEmail">{fields.bankEmail.label}</label>
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

  return (
    <div key={field}>
      <label className="block mb-1" htmlFor={name}>{tradeLabel(field)}</label>
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
              <label className="block mb-1">{fields.requestorName.label}</label>
              <input
                type="text"
                name="requestorName"
                value={formData.requestorName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1">{fields.requestorEmail.label}</label>
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
  
  className="bg-[#170f5f] text-white px-6 py-2 rounded hover:bg-[#1f1790] transition"
>
  {page.submit}
</button>




      
      </form>
    </main>
  )
}
