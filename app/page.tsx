'use client'

import { useState } from 'react'

export default function Home() {

const [formData, setFormData] = useState({
  legalName: '', city: '', province: '', postalCode: '', telephone: '', fax: '', website: '', email: '', billTo: '', shipTo: '', apContact: '', apPhone: '', apEmail: '',
  paymentTerms: '',
  orgType: '', yearsInBusiness: '', typeOfBusiness: '', annualSales: '', resell: '', creditAmount: '', products: '', initialOrder: '', annualPurchase: '', taxable: '', gstExempt: '', pstExempt: '',
  bankName: '', bankAddress: '', accountManager: '', bankPhone: '', bankFax: '', accountNumber: '', bankEmail: '',
  tradeCompany1: '', tradeAccount1: '', tradeAddress1: '', tradeTel1: '', tradeContact1: '', tradeEmail1: '',
  tradeCompany2: '', tradeAccount2: '', tradeAddress2: '', tradeTel2: '', tradeContact2: '', tradeEmail2: '',
  primarySegment: '', secondarySegment: '',
  salesRepName: '', requestorName: '', title: '', date: '',
})

const secondaryOptions: { [key: string]: string[] } = {
  hospital: ['Public Hospital', 'University Hospital/Medical Center', 'Blood Service / Private Lab', 'Emergency Medical', 'Surgical Center'],
  alternate: ['Dentist Office', 'Pharmacy', 'Veterinary Office', 'Diagnostic Imaging Center', 'Sleep Clinic', 'Respiratory Services'],
  continuing: ['Extended Care Facility', 'Home Health Care Provider', 'Transitional Care (Rehab)', 'Physician Office / Clinic', 'Public Clinic', 'School', 'Government', 'Health Miscellaneous', 'University Hospital/Medical Center'],
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target
  setFormData(prev => ({ ...prev, [name]: value }))
}

return (
  <main className="min-h-screen bg-[#f5f5f5] p-6 text-black/80">
    <h1 className="text-3xl font-semibold text-[#170f5f] mb-6">Customer Profile – Canada</h1>

    <form className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">



        <div>
          <label className="block mb-1">Legal Name</label>
          <input type="text" name="legalName" value={formData.legalName} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">City</label>
          <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">Province</label>
          <input type="text" name="province" value={formData.province} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">Postal Code</label>
          <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">Telephone #</label>
          <input type="text" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">Fax #</label>
          <input type="text" name="fax" value={formData.fax} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Website</label>
          <input type="text" name="website" value={formData.website} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Bill To Address</label>
          <textarea name="billTo" value={formData.billTo} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2}></textarea>
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">Ship To Address</label>
          <textarea name="shipTo" value={formData.shipTo} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2}></textarea>
        </div>

        <div>
          <label className="block mb-1">Accounts Payable Contact</label>
          <input type="text" name="apContact" value={formData.apContact} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div>
          <label className="block mb-1">A/P Phone</label>
          <input type="text" name="apPhone" value={formData.apPhone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>

        <div className="md:col-span-2">
          <label className="block mb-1">A/P Email</label>
          <input type="email" name="apEmail" value={formData.apEmail} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>


<div className="md:col-span-2 mt-8">
  <h2 className="text-xl font-semibold text-[#170f5f] mb-4">Payment Terms</h2>

  <div className="flex flex-col gap-3">
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
</div>



{formData.paymentTerms === 'net30' && (
  <>
    {/* TERMS OF SALE */}
    <div className="md:col-span-2 mt-10">
      <h2 className="text-xl font-semibold text-[#170f5f] mb-2">Terms of Sale</h2>
      <p className="text-sm text-black/70">
        NET 30 DAYS FROM DATE OF INVOICE. Failure to adhere to our terms may result in a shipping hold on future orders. The net due date is calculated from the date of the invoice. I hereby certify that the information set forth here, together with all other information submitted in connection with this application is true and correct. I agree to pay all costs of collection, including actual out-of-pocket expenses and a collection fee of 25% if collected through a collection agency or attorney. I/we hereby take notice that Medtronic of Canada Ltd will rely on this information in extending credit to me/us. I/we hereby notice that Medtronic of Canada will be using the attached and signed credit application to obtain bank reference information, including account balances and other credit information and may be referring to a consumer/commercial credit report respecting us/me containing personal information and/or credit information. In connection with my/our application for credit, I/we hereby take notice that Medtronic of Canada Ltd will have access to this application, which may contain personal and identifying information as defined in Canadian Privacy Legislation. I/we have read and understood the Terms of Sale and agree that such terms apply to all transactions with Medtronic of Canada Ltd.
      </p>
    </div>

    {/* COMPANY INFORMATION */}
    <div className="md:col-span-2 mt-8">
      <h2 className="text-xl font-semibold text-[#170f5f] mb-4">Company Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Type of Organization</label>
          <select name="orgType" value={formData.orgType} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            <option value="corporation">Corporation</option>
            <option value="partnership">Partnership</option>
            <option value="proprietorship">Proprietorship</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Years in Business</label>
          <input type="text" name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Type of Business</label>
          <input type="text" name="typeOfBusiness" value={formData.typeOfBusiness} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Annual Sales</label>
          <input type="text" name="annualSales" value={formData.annualSales} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Will the product be resold or distributed?</label>
          <input type="text" name="resell" value={formData.resell} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Credit Amount Requested</label>
          <input type="text" name="creditAmount" value={formData.creditAmount} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1">Products Interested in Purchasing</label>
          <textarea name="products" value={formData.products} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={2}></textarea>
        </div>
        <div>
          <label className="block mb-1">Estimated Initial Order</label>
          <input type="text" name="initialOrder" value={formData.initialOrder} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Expected Annual Purchase</label>
          <input type="text" name="annualPurchase" value={formData.annualPurchase} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Taxable</label>
          <select name="taxable" value={formData.taxable} onChange={handleChange} className="w-full border rounded px-3 py-2">
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">GST Exempt Certificate #</label>
          <input type="text" name="gstExempt" value={formData.gstExempt} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">PST Exempt Certificate #</label>
          <input type="text" name="pstExempt" value={formData.pstExempt} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
    </div>

    {/* BANK REFERENCE */}
    <div className="md:col-span-2 mt-10">
      <h2 className="text-xl font-semibold text-[#170f5f] mb-4">Bank Reference</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block mb-1">Bank Name</label>
          <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Address</label>
          <input type="text" name="bankAddress" value={formData.bankAddress} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Account Manager</label>
          <input type="text" name="accountManager" value={formData.accountManager} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Tel #</label>
          <input type="text" name="bankPhone" value={formData.bankPhone} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Fax #</label>
          <input type="text" name="bankFax" value={formData.bankFax} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block mb-1">Account Number</label>
          <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block mb-1">Email Address</label>
          <input type="email" name="bankEmail" value={formData.bankEmail} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        </div>
      </div>
    </div>

     {/* TRADE REFERENCES */}
    <div className="md:col-span-2 mt-10">
      <h2 className="text-xl font-semibold text-[#170f5f] mb-4">Trade References</h2>

      {[1, 2].map(i => (
        <div key={i} className="border p-4 rounded mb-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Company Name</label>
              <input type="text" name={`tradeCompany${i}`} value={formData[`tradeCompany${i}`] || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Account No.</label>
              <input type="text" name={`tradeAccount${i}`} value={formData[`tradeAccount${i}`] || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Address</label>
              <input type="text" name={`tradeAddress${i}`} value={formData[`tradeAddress${i}`] || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Tel #</label>
              <input type="text" name={`tradeTel${i}`} value={formData[`tradeTel${i}`] || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Contact Name</label>
              <input type="text" name={`tradeContact${i}`} value={formData[`tradeContact${i}`] || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1">Email</label>
              <input type="email" name={`tradeEmail${i}`} value={formData[`tradeEmail${i}`] || ''} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
)}



{/* CUSTOMER SEGMENTATION */}
<div className="md:col-span-2 mt-10">
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
        {(secondaryOptions[formData.primarySegment] || []).map((opt) => (
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
            <input type="text" name="requestorName" value={formData.requestorName} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1">Sales Rep Name</label>
            <input type="text" name="salesRepName" value={formData.salesRepName} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
        </div>
        <button type="submit" className="mt-6 px-6 py-2 bg-blue-600 text-white rounded">Submit</button>
      </div>
    </form>
  </main>
)}
