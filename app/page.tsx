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
    gstExempt: '',
    pstExempt: '',
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
  
  const secondaryOptions: { [key: string]: string[] } = {
    hospital: [
      'Public Hospital',
      'University Hospital/Medical Center',
      'Blood Service / Private Lab',
      'Emergency Medical',
      'Surgical Center',
    ],
    alternate: [
      'Dentist Office',
      'Pharmacy',
      'Veterinary Office',
      'Diagnostic Imaging Center',
      'Sleep Clinic',
      'Respiratory Services',
    ],
    continuing: [
      'Extended Care Facility',
      'Home Health Care Provider',
      'Transitional Care (Rehab)',
      'Physician Office / Clinic',
      'Public Clinic',
      'School',
      'Government',
      'Health Miscellaneous',
      'University Hospital/Medical Center',
    ],
  }

  


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
        {renderInput('Legal Name', 'legalName')}
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
            {renderInput('Taxable', 'taxable')}
            {renderInput('GST Exempt Certificate #', 'gstExempt')}
            {renderInput('PST Exempt Certificate #', 'pstExempt')}
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
