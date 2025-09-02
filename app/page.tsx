'use client'

import React, { useState } from 'react';

import emailjs from '@emailjs/browser'

import { useRouter } from 'next/navigation';


const getTodayDate = () => {
  const now = new Date();
  // Ajusta por el offset de tu zona horaria y toma solo la parte de fecha local
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().split('T')[0]; // YYYY-MM-DD en hora local
};



export default function Home() {
  const [formData, setFormData] = useState<Record<string, string>>({

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
    paymentTerms: '',
    typeOfOrganization: '',
    yearsInBusiness: '',
    typeOfBusiness: '',
    annualSales: '',
    resell: '',
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


  const [errors, setErrors] = useState<Record<string, string | undefined>>({});








  const LEGAL_NAME_MAX = 35;
  // Letras Unicode (incluye acentos) + marcas combinadas + dígitos + espacios
  const LEGAL_NAME_ALLOWED = /^[\p{L}\p{M}\d ]+$/u;
  
  function validateLegalName(value: string): string | null {
    const v = value.trim();
    if (!v) return "Legal Name is required.";
    if (v.length > LEGAL_NAME_MAX) return `Max length is ${LEGAL_NAME_MAX} characters.`;
    if (!LEGAL_NAME_ALLOWED.test(v)) return "Only letters, numbers, and spaces are allowed.";
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
  if (!v) return "City is required.";
  if (!CITY_ALLOWED.test(v)) {
    return "Only letters, numbers, spaces, hyphens (-), apostrophes (’ or '), and periods (.) are allowed.";
  }
  return null;
}


// justo debajo de 'use client' y de tus imports, SIN export
const PROVINCES_CA = [
  "Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
  "Nova Scotia","Ontario","Prince Edward Island","Quebec","Saskatchewan",
] as const;

const PROVINCES_SET = new Set<string>(PROVINCES_CA);

function validateProvince(value: string): string | null {
  if (!value) return "Province is required.";
  if (!PROVINCES_SET.has(value)) return "Select a valid province.";
  return null;
}


// Letras permitidas por Canada Post (no D, F, I, O, Q, U)
const POSTAL_LETTERS = "ABCEGHJKLMNPRSTVXY";

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
  if (!v) return "Postal Code is required.";
  if (!POSTAL_REGEX.test(v)) {
    return "Format must be ANA NAN (e.g., K1A 0B1). Only letters ABCEGHJKLMNPRSTVXY are valid.";
  }
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
    return required ? `${fieldLabel} is required.` : null;
  }
  // Quita 1 inicial si sobrara por copy/paste
  const core = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;
  if (core.length !== 10) return `${fieldLabel} must have 10 digits.`;
  // (Opcional) Reglas NANP más estrictas:
  // if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(core)) return `${fieldLabel} is not a valid Canadian number.`;
  return null;
}


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string, required: boolean, label: string): string | null {
  const v = value.trim();
  if (!v) return required ? `${label} is required.` : null;
  if (!EMAIL_REGEX.test(v)) return `Enter a valid email address.`;
  return null;
}

const PAYMENT_TERMS = ["creditCard", "net30"] as const;
const PAYMENT_TERMS_SET = new Set<string>(PAYMENT_TERMS);

function validatePaymentTerms(value: string): string | null {
  if (!value) return "Payment Terms selection is required.";
  if (!PAYMENT_TERMS_SET.has(value)) return "Select a valid option.";
  return null;
}


function validateRequired(value: string, required: boolean, label: string): string | null {
  const v = (value ?? "").trim();
  if (required && !v) return `${label} is required.`;
  return null;
}


const TRADE_FIELDS = ['Company','Account','Address','Tel','Contact','Email'] as const;

function tradeGroupHasAny(i: number): boolean {
  return TRADE_FIELDS.some(f => ((formData[`trade${f}${i}`] ?? '').trim() !== ''));
}
function tradeIsRequired(i: number): boolean {
  // 1 y 2 obligatorios; 3 solo si el usuario empezó a llenarlo
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

  switch (field) {
    case 'Tel':
      return validatePhoneCA(raw, required, `Trade Ref ${idx} Telephone`);
    case 'Email':
      return validateEmail(raw, required, `Trade Ref ${idx} Email`);
    case 'Account': {
      const digits = onlyDigits(raw);
      // si el usuario metió letras, las limpiamos en el handleChange
      return required && !digits ? `Trade Ref ${idx} Account No. is required.` : null;
    }
    case 'Company':
      return validateRequired(raw, required, `Trade Ref ${idx} Company`);
    case 'Address':
      return validateRequired(raw, required, `Trade Ref ${idx} Address`);
    case 'Contact':
      return validateRequired(raw, required, `Trade Ref ${idx} Contact Person`);
    default:
      return null;
  }
}



function tradeLabel(field: string): string {
  switch (field) {
    case 'Tel':     return 'Telephone';
    case 'Contact': return 'Contact Person';
    case 'Account': return 'Account No.';
    case 'Email':   return 'Email';
    case 'Address': return 'Address';
    default:        return 'Company Name'; // 'Company'
  }
}









function handlePhoneFieldChange(
  field: "telephone" | "apPhone" | "fax",
  required: boolean,
  value: string
) {
  const normalized = normalizePhoneCA(value);
  setFormData(prev => ({ ...prev, [field]: normalized }));
  const msg = validatePhoneCA(normalized, required, field === "fax" ? "Fax" : field === "telephone" ? "Telephone" : "Accounts Payable Phone");
  setErrors(prev => ({ ...prev, [field]: msg || undefined }));
}





  const secondaryOptions: { [key: string]: string[] } = {
    hospital: [
      'Public Hospital',
    ],
    alternate: [
      'Blood Service / Private Lab',
      'Dentist Office',
      'Pharmacy',
      'Veterinary Office',


    ],
    continuing: [
      'Diagnostic Imaging Center',
      'Emergency Medical',
      'Extended Care Facility',
      'Government',
      'Health Miscellaneous',
      'Home Health Care Provider',
      'Public Clinic',
      'Physician Office / Clinic',
      'Respiratory Services',
      'School',
      'Sleep Clinic',
      'Surgical Center',
      'Transitional Care (Rehab)',
      'University Hospital/Medical Center',

    ],
  }

  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

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
        billTo: validateRequired(v, true, "Bill To Address") || undefined,
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
        email: validateEmail(cleaned, false, "Email") || undefined   // false => opcional
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
        apEmail: validateEmail(cleaned, true, "Accounts Payable Email") || undefined
      }));
      return;
    }
       
    if (name === "paymentTerms") {
      setFormData(prev => ({ ...prev, paymentTerms: value }));
      setErrors(prev => ({ ...prev, paymentTerms: validatePaymentTerms(value) || undefined }));
      return;
    }
    
             // LAS SIGUIENTES VALIDACIONES SOLO SE USAN PARA PAYMENT TERMS NET 30

    if (name === "bankName") {
      const cleaned = value.normalize("NFC").replace(/\s{2,}/g, " ");
      const required = formData.paymentTerms === "net30";
      setFormData(prev => ({ ...prev, bankName: cleaned }));
      setErrors(prev => ({ ...prev, bankName: validateRequired(cleaned, required, "Bank Name") || undefined }));
      return;
    }
    
    if (name === "accountManager") {
      const cleaned = value.normalize("NFC").replace(/\s{2,}/g, " ");
      const required = formData.paymentTerms === "net30";
      setFormData(prev => ({ ...prev, accountManager: cleaned }));
      setErrors(prev => ({ ...prev, accountManager: validateRequired(cleaned, required, "Account Manager") || undefined }));
      return;
    }
    
    if (name === "bankPhone") {
      const required = formData.paymentTerms === "net30";
      const normalized = normalizePhoneCA(value); // el mismo que usas para Telephone/AP Phone
      setFormData(prev => ({ ...prev, bankPhone: normalized }));
      setErrors(prev => ({ ...prev, bankPhone: validatePhoneCA(normalized, required, "Bank Phone") || undefined }));
      return;
    }
    
    if (name === "bankEmail") {
      const required = formData.paymentTerms === "net30";
      const cleaned = value.normalize("NFC").replace(/\s/g, "");
      setFormData(prev => ({ ...prev, bankEmail: cleaned }));
      setErrors(prev => ({ ...prev, bankEmail: validateEmail(cleaned, required, "Bank Email") || undefined }));
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



  const renderInput = (label: string, name: keyof typeof formData, type = 'text', isTextArea = false) => (
    <div>
      <label className="block mb-1">{label}</label>
      {isTextArea ? (
        <textarea
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
          rows={2}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
      )}
    </div>
  )


const router = useRouter();


const handleSubmit = async () => {
  const timestamp = new Date().toISOString();

  const msg = validateLegalName(formData.legalName);
  if (msg) {
    setErrors(prev => ({ ...prev, legalName: msg }));
    alert("Please correct the errors before submitting.");
    return;
  }


  const billToMsg = validateRequired(formData.billTo ?? "", true, "Bill To Address");
  if (billToMsg) {
    setErrors(prev => ({ ...prev, billTo: billToMsg }));
    alert("Please correct the errors before submitting.");
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
    alert("Please correct the errors before submitting.");
    return;
  }
  
  const pcMsg = validatePostalCode(formData.postalCode);
  if (pcMsg) {
    setErrors(prev => ({ ...prev, postalCode: pcMsg }));
    alert("Please correct the errors before submitting.");
    return;
  }


  const emailMsg = validateEmail(formData.email ?? "", true, "Email");  
  const telMsg = validatePhoneCA(formData.telephone, true, "Telephone");
  const apMsg  = validatePhoneCA(formData.apPhone, true, "Accounts Payable Phone");
  const faxMsg = validatePhoneCA(formData.fax ?? "", false, "Fax");
  const apEmailMsg = validateEmail(formData.apEmail ?? "", true, "Accounts Payable Email");
  const payMsg = validatePaymentTerms(formData.paymentTerms);

// Solo si Net 30: valida Bank References
if (formData.paymentTerms === "net30") {
  const bankNameMsg = validateRequired(formData.bankName, true, "Bank Name");
  const acctMgrMsg  = validateRequired(formData.accountManager, true, "Account Manager");
  const bankPhoneMsg = validatePhoneCA(formData.bankPhone, true, "Bank Phone");
  const bankEmailMsg = validateEmail(formData.bankEmail, true, "Bank Email");

  // Sanitiza Account Number a dígitos antes de enviar
  const sanitizedAcc = onlyDigits(formData.bankAccountNumber || "");
  if (sanitizedAcc !== (formData.bankAccountNumber || "")) {
    setFormData(prev => ({ ...prev, bankAccountNumber: sanitizedAcc }));
  }

  if (bankNameMsg || acctMgrMsg || bankPhoneMsg || bankEmailMsg) {
    setErrors(prev => ({
      ...prev,
      bankName: bankNameMsg || undefined,
      accountManager: acctMgrMsg || undefined,
      bankPhone: bankPhoneMsg || undefined,
      bankEmail: bankEmailMsg || undefined,
    }));
    alert("Please correct the errors before submitting.");
    return;
  }
}


if (telMsg || apMsg || faxMsg || apEmailMsg || payMsg  || emailMsg) {
  setErrors(prev => ({
    ...prev,
    telephone: telMsg || undefined,
    apPhone: apMsg || undefined,
    fax: faxMsg || undefined,
    apEmail: apEmailMsg || undefined,
    paymentTerms: payMsg || undefined,
    email: emailMsg || undefined,
  }));
  alert("Please correct the errors before submitting.");
  return;
}


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
  alert("Please correct the errors before submitting.");
  return;
}





  const formattedData = Object.entries(formData)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

  try {
     await emailjs.send(
      'service_i6is1vl',           // tu Service ID
      'template_yuvc7fc',           // tu Template ID
      {
        formData: formattedData,
        timestamp: timestamp,
      },
      'BhNrfAyGnu7vx_rYL'          // tu Public Key

    );

    router.push('/confirmation');

    
} catch (error: unknown) {
  let errorMessage = 'Unknown error';

  if (
    typeof error === 'object' &&
    error !== null &&
    ('text' in error || 'message' in error)
  ) {
    errorMessage = (error as { text?: string; message?: string }).text
      ?? (error as { text?: string; message?: string }).message
      ?? 'Unknown error';
  }

  console.error('Email sending error:', errorMessage);
  alert(`Error sending email: ${errorMessage}`);
}

};




  return (

   <main className="max-w-4xl mx-auto p-6 bg-white text-black">



<div className="flex flex-col md:flex-row items-center md:justify-between text-center md:text-left gap-2 mb-6">
  <img src="/Medtronic_logo.jpg" alt="Medtronic" className="h-12" />
  <h1 className="text-xl font-bold">Customer Application Form - Canada</h1>
</div>




      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl"  
             noValidate
             onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
               >
        
   

  
        <div>
  <label className="block mb-1" htmlFor="legalName">Legal Name</label>
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
  <label className="block mb-1" htmlFor="city">City</label>
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
  <label className="block mb-1" htmlFor="province">Province</label>
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
    <option value="">Select</option>
    {PROVINCES_CA.map(p => (
      <option key={p} value={p}>{p}</option>
    ))}
  </select>
  {errors.province && (
    <p id="province-error" className="text-red-600 text-sm mt-1">{errors.province}</p>
  )}
</div>

<div>
  <label className="block mb-1" htmlFor="postalCode">Postal Code</label>
  <input
    id="postalCode"
    name="postalCode"
    type="text"
    inputMode="text"
    autoCapitalize="characters"
    placeholder="A1A 1A1"
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
  <label className="block mb-1" htmlFor="telephone">Telephone</label>
  <input
    id="telephone"
    name="telephone"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    placeholder="(123) 456-7890"
    value={formData.telephone}
    onChange={handleChange}
    onBlur={() => setErrors(prev => ({
      ...prev,
      telephone: validatePhoneCA(formData.telephone, true, "Telephone") || undefined
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
  <label className="block mb-1" htmlFor="fax">Fax (optional)</label>
  <input
    id="fax"
    name="fax"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    placeholder="(123) 456-7890"
    value={formData.fax}
    onChange={handleChange}
    onBlur={() => setErrors(prev => ({
      ...prev,
      fax: validatePhoneCA(formData.fax ?? "", false, "Fax") || undefined
    }))}
    pattern="^(\+?1[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}$"
    className={`w-full border rounded px-3 py-2 ${errors.fax ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.fax}
    aria-describedby="fax-error"
  />
  {errors.fax && <p id="fax-error" className="text-red-600 text-sm mt-1">{errors.fax}</p>}
</div>



        {renderInput('Website', 'website')}


        <div>
  <label className="block mb-1" htmlFor="email">Email</label>
  <input
    id="email"
    name="email"
    type="email"
    inputMode="email"
    autoComplete="email"
    placeholder="user@domain.com"
    value={formData.email}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        email: validateEmail(formData.email ?? "", true, "Email") || undefined
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
  <label className="block mb-1" htmlFor="billTo">Bill To Address</label>
  <textarea
    id="billTo"
    name="billTo"
    rows={2}
    value={formData.billTo}
    onChange={handleChange}
    onBlur={() =>
      setErrors(prev => ({
        ...prev,
        billTo: validateRequired(formData.billTo, true, "Bill To Address") || undefined,
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




        {renderInput('Ship To Address', 'shipTo', 'text', true)}
        {renderInput('Accounts Payable Contact', 'apContact')}



{/* Accounts Payable Phone (required) */}
<div>
  <label className="block mb-1" htmlFor="apPhone">Accounts Payable Phone</label>
  <input
    id="apPhone"
    name="apPhone"
    type="tel"
    inputMode="tel"
    autoComplete="tel"
    placeholder="(123) 456-7890"
    value={formData.apPhone}
    onChange={handleChange}
    onBlur={() => setErrors(prev => ({
      ...prev,
      apPhone: validatePhoneCA(formData.apPhone, true, "Accounts Payable Phone") || undefined
    }))}
    pattern="^(\+?1[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}$"
    className={`w-full border rounded px-3 py-2 ${errors.apPhone ? 'border-red-600' : ''}`}
    aria-invalid={!!errors.apPhone}
    aria-describedby="apphone-error"
  />
  {errors.apPhone && <p id="apphone-error" className="text-red-600 text-sm mt-1">{errors.apPhone}</p>}
</div>



 <div>
   <label className="block mb-1" htmlFor="apEmail">Accounts Payable Email</label>
   <input
     id="apEmail"
     name="apEmail"
     type="email"
     inputMode="email"
     autoComplete="email"
     placeholder="ap@company.com"
     value={formData.apEmail}
     onChange={handleChange}
     onBlur={() =>
       setErrors(prev => ({
         ...prev,
         apEmail: validateEmail(formData.apEmail ?? "", true, "Accounts Payable Email") || undefined
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


 <div className="md:col-span-2 mt-6">
  <h2 className="text-xl font-semibold text-[#170f5f] mb-2">Payment Terms</h2>
  <div role="radiogroup" aria-labelledby="payment-terms-label" className="flex flex-col gap-2">
    <span id="payment-terms-label" className="sr-only">Payment Terms</span>

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
        aria-invalid={!!errors.paymentTerms}
      />
      Credit Card (Pay upon order)
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
        aria-invalid={!!errors.paymentTerms}
      />
      Net 30 Terms
    </label>
  </div>

  {errors.paymentTerms && (
    <p className="text-red-600 text-sm mt-1">{errors.paymentTerms}</p>
  )}
</div>




        {formData.paymentTerms === 'net30' && (
          <>
            <div className="md:col-span-2 mt-8">
              <h2 className="text-xl font-semibold text-[#170f5f] mb-2">Company Information</h2>
            </div>


 <div>
  <label className="block mb-1">Type of Organization</label>
  <select
    name="typeOfOrganization"
    value={formData.typeOfOrganization}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">Select</option>
    <option value="Corporation">Corporation</option>
    <option value="Partnership">Partnership</option>
    <option value="Proprietorship">Proprietorship</option>
  </select>
</div>

            {renderInput('Years in Business', 'yearsInBusiness')}
            {renderInput('Type of Business', 'typeOfBusiness')}
            {renderInput('Annual Sales', 'annualSales')}
            {renderInput('Will the product be resold or distributed?', 'resell')}
            {renderInput('Credit Amount Requested', 'creditAmount')}
            {renderInput('Products Interested in Purchasing', 'products', 'text', true)}
            {renderInput('Estimated Initial Order', 'initialOrder')}
            {renderInput('Expected Annual Purchase', 'annualPurchase')}


<div>
  <label className="block mb-1">Taxable</label>
  <select
    name="taxable"
    value={formData.taxable}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">Select</option>
    <option value="yes">Yes</option>
    <option value="no">No</option>
  </select>
</div>

<div className="mt-4">
  <label className="block mb-1">
    If GST non-taxable, provide Tax Exempt Certificate #:
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
    If PST non-taxable, provide Tax Exempt Certificate #:
  </label>
  <input
    type="text"
    name="pstTaxExempt"
    value={formData.pstTaxExempt}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2"
  />
</div>



            {formData.paymentTerms === "net30" && (
  <div className="md:col-span-2 mt-6">
    <h2 className="text-xl font-semibold text-[#170f5f] mb-2">Bank References</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Bank Name (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="bankName">Bank Name</label>
        <input
          id="bankName"
          name="bankName"
          type="text"
          value={formData.bankName}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            bankName: validateRequired(formData.bankName, true, "Bank Name") || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.bankName ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.bankName}
          aria-describedby="bankName-error"
        />
        {errors.bankName && <p id="bankName-error" className="text-red-600 text-sm mt-1">{errors.bankName}</p>}
      </div>


      {renderInput('Bank Address', 'bankAddress')}




      {/* Account Manager (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="accountManager">Account Manager</label>
        <input
          id="accountManager"
          name="accountManager"
          type="text"
          value={formData.accountManager}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            accountManager: validateRequired(formData.accountManager, true, "Account Manager") || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.accountManager ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.accountManager}
          aria-describedby="accountManager-error"
        />
        {errors.accountManager && <p id="accountManager-error" className="text-red-600 text-sm mt-1">{errors.accountManager}</p>}
      </div>

      {/* Bank Phone (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="bankPhone">Bank Phone</label>
        <input
          id="bankPhone"
          name="bankPhone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="(123) 456-7890"
          value={formData.bankPhone}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            bankPhone: validatePhoneCA(formData.bankPhone, true, "Bank Phone") || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.bankPhone ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.bankPhone}
          aria-describedby="bankPhone-error"
        />
        {errors.bankPhone && <p id="bankPhone-error" className="text-red-600 text-sm mt-1">{errors.bankPhone}</p>}
      </div>

      {renderInput('Bank Fax', 'bankFax')}




      {/* Bank Email (required if Net 30) */}
      <div>
        <label className="block mb-1" htmlFor="bankEmail">Bank Email</label>
        <input
          id="bankEmail"
          name="bankEmail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="manager@bank.com"
          value={formData.bankEmail}
          onChange={handleChange}
          onBlur={() => setErrors(prev => ({
            ...prev,
            bankEmail: validateEmail(formData.bankEmail, true, "Bank Email") || undefined
          }))}
          className={`w-full border rounded px-3 py-2 ${errors.bankEmail ? 'border-red-600' : ''}`}
          aria-invalid={!!errors.bankEmail}
          aria-describedby="bankEmail-error"
        />
        {errors.bankEmail && <p id="bankEmail-error" className="text-red-600 text-sm mt-1">{errors.bankEmail}</p>}
      </div>

      {/* Account Number (optional, digits only) */}
      <div className="md:col-span-2">
        <label className="block mb-1" htmlFor="bankAccountNumber">Account Number (optional)</label>
        <input
          id="bankAccountNumber"
          name="bankAccountNumber"
          type="text"
          inputMode="numeric"
          placeholder="digits only"
          value={formData.bankAccountNumber}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2"
        />
        {/* Sin mensaje: lo sanitizamos a dígitos, no hay validación de longitud */}
      </div>
    </div>
  </div>
)}







      {/* Trade References con tipado corregido */}


            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-[#170f5f] mt-10 mb-4">Trade References</h2>
              <div className="grid grid-cols-1 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded p-4">
                    <h3 className="text-lg font-semibold mb-2">Trade Reference {i}</h3>
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
        placeholder={isTel ? '(123) 456-7890' : undefined}
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
          <h2 className="text-xl font-semibold text-[#170f5f] mb-4">Customer Segmentation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Primary Segment</label>
              <select
                name="primarySegment"
                value={formData.primarySegment}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                <option value="hospital">Hospital</option>
                <option value="alternate">Alternate Site</option>
                <option value="continuing">Continuing Care</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Secondary Segment</label>
              <select
                name="secondarySegment"
                value={formData.secondarySegment}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select</option>
                {(secondaryOptions[formData.primarySegment] || []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>


    {/* FINAL SECTION */}
        <div className="md:col-span-2 mt-10">
          <h2 className="text-xl font-semibold text-[#170f5f] mb-4">Final Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Requestor Name</label>
              <input
                type="text"
                name="requestorName"
                value={formData.requestorName}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1">Sales Rep Name</label>
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
  Submit
</button>




      
      </form>
    </main>
  )
}
