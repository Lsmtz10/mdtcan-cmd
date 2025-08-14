'use client'

import React, { useState } from 'react';

import emailjs from '@emailjs/browser'

import { useRouter } from 'next/navigation';


const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // formato: yyyy-mm-dd
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
    accountNumber: '',
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
  

  const [errors, setErrors] = useState<{ legalName?: string }>({});

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




      <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
        
   

  
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

        {renderInput('City', 'city')}

<div>
  <label className="block mb-1">Province</label>
  <select
    name="province"
    value={formData.province}
    onChange={handleChange}
    className="w-full border rounded px-3 py-2"
  >
    <option value="">Select</option>
    <option value="Alberta">Alberta</option>
    <option value="British Columbia">British Columbia</option>
    <option value="Manitoba">Manitoba</option>
    <option value="New Brunswick">New Brunswick</option>
    <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
    <option value="Nova Scotia">Nova Scotia</option>
    <option value="Ontario">Ontario</option>
    <option value="Prince Edward Island">Prince Edward Island</option>
    <option value="Quebec">Quebec</option>
    <option value="Saskatchewan">Saskatchewan</option>
  </select>
</div>


        {renderInput('Postal Code', 'postalCode')}
        {renderInput('Telephone #', 'telephone')}
        {renderInput('Fax #', 'fax')}
        {renderInput('Website', 'website')}
        {renderInput('Email', 'email', 'email')}
        {renderInput('Bill To Address', 'billTo', 'text', true)}
        {renderInput('Ship To Address', 'shipTo', 'text', true)}
        {renderInput('Accounts Payable Contact', 'apContact')}
        {renderInput('A/P Phone', 'apPhone')}
        {renderInput('A/P Email', 'apEmail', 'email')}

        <div className="md:col-span-2 mt-8">
          <h2 className="text-xl font-semibold text-[#170f5f] mb-2">Payment Terms</h2>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentTerms"
              value="creditCard"
              checked={formData.paymentTerms === 'creditCard'}
              onChange={handleChange}
              className="mr-2"
            />
            Credit Card (Pay upon order)
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentTerms"
              value="net30"
              checked={formData.paymentTerms === 'net30'}
              onChange={handleChange}
              className="mr-2"
            />
            Net 30 Terms
          </label>
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

            <div className="md:col-span-2 mt-8">
              <h2 className="text-xl font-semibold text-[#170f5f] mb-2">Bank References</h2>
            </div>
            {renderInput('Bank Name', 'bankName')}
            {renderInput('Bank Address', 'bankAddress')}
            {renderInput('Account Manager', 'accountManager')}
            {renderInput('Bank Phone', 'bankPhone')}
            {renderInput('Bank Fax', 'bankFax')}
            {renderInput('Account Number', 'accountNumber')}
            {renderInput('Bank Email', 'bankEmail', 'email')}

      {/* Trade References con tipado corregido */}


            <div className="md:col-span-2">
              <h2 className="text-xl font-semibold text-[#170f5f] mt-10 mb-4">Trade References</h2>
              <div className="grid grid-cols-1 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded p-4">
                    <h3 className="text-lg font-semibold mb-2">Trade Reference {i}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['Company', 'Account', 'Address', 'Tel', 'Contact', 'Email'].map((field) => (
                        <div key={field}>
                          <label className="block mb-1">{field === 'Tel' ? 'Telephone' : field === 'Contact' ? 'Contact Person' : field === 'Account' ? 'Account No.' : field + ' Name'}</label>
                          <input
                            type={field === 'Email' ? 'email' : 'text'}
                            name={`trade${field}${i}`}
                            value={(formData as Record<string, string>)[`trade${field}${i}`] || ''}
                            onChange={handleChange}
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                      ))}
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
  type="button"
  onClick={handleSubmit}
  className="bg-[#170f5f] text-white px-6 py-2 rounded hover:bg-[#1f1790] transition"
>
  Submit
</button>




      
      </form>
    </main>
  )
}
