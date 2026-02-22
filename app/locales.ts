export const MESSAGES = {
  en: {
    meta: {
      title: "Customer Application Form",
      description: "Medtronic Canada",
    },

    page: {
      title: "Customer Application Form - Canada", // NOT IN PDF (custom title)
      submit: "Submit", // NOT IN PDF
      select: "Select", // NOT IN PDF
      downloadPdf: "Download this form in PDF", // NOT IN PDF
    },

    sections: {
      paymentTerms: "Payment Terms",
      companyInformation: "Company Information",
      taxes: "Taxes",
      bankReferences: "Bank References",
      tradeReferences: "Trade References",
      customerSegmentation: "Customer Segmentation",
      finalInformation: "Final Information", // NOT IN PDF
    },

    fields: {
      // Customer profile
      legalName: { label: "Legal Name" },
      city: { label: "City" },
      province: { label: "Province" },
      postalCode: { label: "Postal Code" },
      telephone: { label: "Telephone" },
      fax: { label: "Fax (optional)" }, // NOT IN PDF (PDF just has "Fax #")
      website: { label: "Website" },
      email: { label: "Email" }, // PDF uses "Email Address"
      billTo: { label: "Bill To Address" },
      shipTo: { label: "Ship To Address" },
      requestType: {
        label: "I want to request:",
        options: {
          newAccount: "New account",
          addShipTo: "Add a ship-to to an existing account",
        },
        addShipToNote:
          "The following information is required to accurately link the new Ship-to to an existing account in our records",
      },
      existingAccountInfo: { label: "Existing account number and/or payer name" },
      payerAddress: { label: "Payer address" },

      // Accounts payable (not present as-is in PDF)
      apContact: { label: "Accounts Payable Contact" }, // NOT IN PDF
      apPhone: { label: "Accounts Payable Phone" }, // NOT IN PDF (PDF has Tel #/Ext)
      apEmail: { label: "Accounts Payable Email" }, // NOT IN PDF (PDF has Email Address under Accounts Payable)

      // Payment terms
      paymentTerms: { label: "Payment Terms" },

      // Company information
      typeOfOrganization: { label: "Type of Organization" },
      yearsInBusiness: { label: "Years in Business" },
      typeOfBusiness: { label: "Type of Business" },
      annualSales: { label: "Annual Sales" },
      resell: { label: "Will the product be resold or distributed?" },
      intendedDistribution: { label: "Intended geographical distribution" },
      creditAmount: { label: "Credit Amount Requested" },
      products: { label: "Products Interested in Purchasing" },
      initialOrder: { label: "Estimated Initial Order" },
      annualPurchase: { label: "Expected Annual Purchase" },
      taxable: { label: "Taxable" },
      taxExemptionTypes: { label: "Select applicable tax exemption type(s)" },
      craBusinessNumber: { label: "CRA Business Number or GST/HST/PST number" },
      taxExemptFile: {
        label: "Tax Exemption supporting  document (PDF, max 3 MB)",
        selectFile: "Click here to select file",
        selectedFile: "Selected file: {fileName}",
      },

      // Bank references
      bankName: { label: "Bank Name" },
      bankAddress: { label: "Bank Address" }, // NOT IN PDF (PDF label is just "Address")
      accountManager: { label: "Account Manager" },
      bankPhone: { label: "Telephone" }, // PDF: "Tel #"
      bankFax: { label: "Fax" }, // PDF: "Fax#"
      bankAccountNumber: { label: "Account Number (optional)" }, // NOT IN PDF (PDF: "Account No.")
      bankEmail: { label: "Email" }, // PDF: "Email Address"

      // Trade references (labels are rendered dynamically)
      trade: {
        groupTitle: "Trade Reference {idx}", // NOT IN PDF
        company: { label: "Company Name" },
        account: { label: "Account No." },
        address: { label: "Address" },
        tel: { label: "Telephone" },
        contact: { label: "Contact Person" }, // NOT IN PDF (PDF: "Contact Name")
        email: { label: "Email" }, // NOT IN PDF (PDF: "Email Address")
      },

      // Segmentation
      primarySegment: { label: "Primary Segment" }, // NOT IN PDF (PDF: "Primary (Choose one)")
      secondarySegment: { label: "Secondary Segment" }, // NOT IN PDF

      // Final information
      salesRepName: { label: "Sales Rep Name" },
      requestorName: { label: "Requestor Name" }, // NOT IN PDF
      requestorEmail: { label: "Requester Email" }, // NOT IN PDF
      title: { label: "Title" },
      date: { label: "Date" },
    },

    placeholders: {
      postalCode: "A1A 1A1", // NOT IN PDF
      phone: "(123) 456-7890", // NOT IN PDF
      email: "user@domain.com", // NOT IN PDF
      apEmail: "ap@company.com", // NOT IN PDF
      bankEmail: "manager@bank.com", // NOT IN PDF
      digitsOnly: "digits only", // NOT IN PDF
    },

    options: {
      paymentTerms: {
        creditCard: "Credit Card (Pay upon order)",
        net30: "Net 30 Terms",
      },

      typeOfOrganization: [
        { value: "", label: "Select" }, // NOT IN PDF
        { value: "Corporation", label: "Corporation" },
        { value: "Partnership", label: "Partnership" },
        { value: "Proprietorship", label: "Proprietorship" },
      ],

      annualPurchase: [
        { value: "", label: "Select a range" }, // NOT IN PDF
        { value: "0 - 25,000", label: "0 - 25,000" },
        { value: "25,001 – 50,000", label: "25,001 – 50,000" },
        { value: "50,001 – 100,000", label: "50,001 – 100,000" },
        { value: "100,001 or above", label: "100,001 or above" },
      ],

      resell: [
        { value: "", label: "Select an answer" }, // NOT IN PDF
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],

      intendedDistribution: {
        canadaWide: "Canada wide",
      },

      taxable: [
        { value: "", label: "Select" }, // NOT IN PDF
        { value: "yes", label: "Yes" },
        { value: "no", label: "No" },
      ],
      taxExemptionTypes: {
        gst: "GST",
        hst: "HST",
        pst: "PST",
      },

      // NOT IN PDF: province dropdown is not in the PDF (PDF just says "Province:")
      provinces: [
        { value: "Alberta", label: "Alberta" },
        { value: "British Columbia", label: "British Columbia" },
        { value: "Manitoba", label: "Manitoba" },
        { value: "New Brunswick", label: "New Brunswick" },
        { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
        { value: "Nova Scotia", label: "Nova Scotia" },
        { value: "Ontario", label: "Ontario" },
        { value: "Prince Edward Island", label: "Prince Edward Island" },
        { value: "Quebec", label: "Quebec" },
        { value: "Saskatchewan", label: "Saskatchewan" },
      ],

      segmentation: {
        primary: [
          { value: "", label: "Select" }, // NOT IN PDF
          { value: "hospital", label: "Hospital" },
          { value: "alternateSite", label: "Alternate Site" },
          { value: "continuingCare", label: "Continuing Care" },
        ],

        // NOTE: these are the CURRENT option values used in page.tsx (English strings)
        // and are translated only for display.
        secondaryByPrimary: {
          hospital: [
            { value: "Public Hospital", label: "Public Hospital" },
            { value: "Blood Service/Private Lab", label: "Blood Service/Private Lab" },
            { value: "Dentist Office", label: "Dentist Office" },
            { value: "Pharmacy", label: "Pharmacy" },
            { value: "Veterinary Office", label: "Veterinary Office" },
            { value: "Diagnostic Imaging Center", label: "Diagnostic Imaging Center" },
            { value: "Emergency Medical", label: "Emergency Medical" },
            { value: "Extended Care Facility", label: "Extended Care Facility" },
            { value: "Government", label: "Government" },
            { value: "Health Miscellaneous", label: "Health Miscellaneous" },
            { value: "Home Health Care Provider", label: "Home Health Care Provider" },
            { value: "Public Clinic", label: "Public Clinic" },
            { value: "Physician Office / Clinic", label: "Physician Office / Clinic" },
            { value: "Respiratory Services", label: "Respiratory Services" },
            { value: "School", label: "School" },
            { value: "Sleep Clinic", label: "Sleep Clinic" }, // NOT IN PDF as a standalone value (PDF shows "Sleep Clinic Surgical Center")
            { value: "Surgical Center", label: "Surgical Center" }, // NOT IN FR PDF and not standalone in EN PDF
            { value: "Transitional Care (Rehab)", label: "Transitional Care (Rehab)" },
            { value: "University Hospital/Medical Center", label: "University Hospital/Medical Center" },
          ],

          alternateSite: [
            { value: "Blood Service/Private Lab", label: "Blood Service/Private Lab" },
            { value: "Dentist Office", label: "Dentist Office" },
            { value: "Pharmacy", label: "Pharmacy" },
            { value: "Veterinary Office", label: "Veterinary Office" },
            { value: "Diagnostic Imaging Center", label: "Diagnostic Imaging Center" },
            { value: "Emergency Medical", label: "Emergency Medical" },
            { value: "Government", label: "Government" },
            { value: "Health Miscellaneous", label: "Health Miscellaneous" },
            { value: "Home Health Care Provider", label: "Home Health Care Provider" },
            { value: "Public Clinic", label: "Public Clinic" },
            { value: "Physician Office / Clinic", label: "Physician Office / Clinic" },
            { value: "Respiratory Services", label: "Respiratory Services" },
            { value: "School", label: "School" },
            { value: "Sleep Clinic", label: "Sleep Clinic" }, // see note above
            { value: "Surgical Center", label: "Surgical Center" }, // see note above
          ],

          continuingCare: [
            { value: "Extended Care Facility", label: "Extended Care Facility" },
            { value: "Home Health Care Provider", label: "Home Health Care Provider" },
            { value: "Transitional Care (Rehab)", label: "Transitional Care (Rehab)" },
          ],
        },
      },
    },

    errors: {
      // templates: {label}, {max}, {idx}
      requiredSuffix: "is required.",
      invalidOption: "Select a valid option.",
      invalidProvince: "Select a valid province.",
      invalidEmail: "Enter a valid email address.",
      maxLength: "Max length is {max} characters.",
      legalNameRequired: "Legal Name is required.",
      cityRequired: "City is required.",
      provinceRequired: "Province is required.",
      postalCodeRequired: "Postal Code is required.",
      paymentTermsRequired: "Payment Terms selection is required.",
      onlyLettersNumbersSpaces: "Only letters, numbers, and spaces are allowed.",
      cityAllowedChars:
        "Only letters, numbers, spaces, hyphens (-), apostrophes (’ or '), and periods (.) are allowed.",
      postalCodeFormat:
        "Format must be ANA NAN (e.g., K1A 0B1). Only letters ABCEGHJKLMNPRSTVXY are valid.",
      phone10Digits: "{label} must have 10 digits.",
      tradeRefAccountRequired: "Trade Ref {idx} Account No. is required.",
      tradeRefContactRequired: "Trade Ref {idx} Contact Person is required.",
      intendedDistributionRequired: "Select at least one distribution option.",
      taxExemptionTypesRequired: "Select 1 or more options: GST, HST, PST.",
      taxExemptFileRequired: "Tax exempt certificate PDF is required.",
      taxExemptFileType: "File must be a PDF.",
      taxExemptFileSize: "File must be 3 MB or less.",
    },

    alerts: {
      fixErrors: "Please correct the errors before submitting.",
      emailSendError: "Error sending email: {errorMessage}",
      unknownError: "Unknown error",
    },

    email: {
      subject: "Customer Application Form – Canada", // NOT IN PDF
      section_requestSummary: "Request Summary", // NOT IN PDF
      section_requestDetails: "Request Details",
      submittedAt: "Submitted At", // NOT IN PDF
      section_customerInfo: "Customer Information", // NOT IN PDF
      section_addresses: "Addresses", // NOT IN PDF
      section_accountsPayable: "Accounts Payable", // NOT IN PDF
      section_paymentTerms: "Payment Terms",
      paymentNet30Short: "Net 30", // NOT IN PDF (short label)
      paymentCreditCardShort: "Credit Card", // NOT IN PDF (short label)
      section_companyInformation: "Company Information",
      section_bankReferences: "Bank References",
      section_tradeReferences: "Trade References",
      tradeRefShort: "Trade Reference {idx}", // NOT IN PDF
    },
  },

  fr: {
    meta: {
      title: "Formulaire de demande client",
      description: "Medtronic Canada",
    },

    page: {
      title: "Formulaire de demande client - Canada", // NOT IN PDF (custom title)
      submit: "Soumettre", // NOT IN PDF
      select: "Sélectionner", // NOT IN PDF
      downloadPdf: "Télécharger ce formulaire en PDF", // NOT IN PDF
    },

    sections: {
      paymentTerms: "Termes de paiement",
      taxes: "Taxes",
      companyInformation: "Informations sur la société",
      bankReferences: "Référence bancaire",
      tradeReferences: "Références commerciales",
      customerSegmentation: "Segmentation de la clientèle",
      finalInformation: "Renseignements finaux", // NOT IN PDF
    },

    fields: {
      // Customer profile
      legalName: { label: "Nom légal" },
      city: { label: "Ville" },
      province: { label: "Province" },
      postalCode: { label: "Code postal" },
      telephone: { label: "Numéro de téléphone" },
      fax: { label: "Numéro de fax (facultatif)" }, // NOT IN PDF (the "(optional)" is custom)
      website: { label: "Site Web" },
      email: { label: "Adresse courriel" },
      billTo: { label: "Adresse de facturation" },
      shipTo: { label: "Adresse de livraison" },
      requestType: {
        label: "Je veux demander :",
        options: {
          newAccount: "Nouveau compte",
          addShipTo: "Ajouter une adresse de livraison à un compte existant",
        },
        addShipToNote:
          "Les renseignements suivants sont requis pour lier correctement la nouvelle adresse de livraison au compte existant dans nos dossiers",
      },
      existingAccountInfo: { label: "Numéro de compte existant et/ou nom du payeur" },
      payerAddress: { label: "Adresse du payeur" },

      // Accounts payable (not present as-is in PDF)
      apContact: { label: "Contact des comptes payables" }, // NOT IN PDF
      apPhone: { label: "Téléphone des comptes payables" }, // NOT IN PDF (PDF has "Numéro de Téléphone/Ext")
      apEmail: { label: "Courriel des comptes payables" }, // NOT IN PDF

      // Payment terms
      paymentTerms: { label: "Termes de paiement" },

      // Company information
      typeOfOrganization: { label: "Type d’entreprise" },
      yearsInBusiness: { label: "Nombre d’année en affaire" },
      typeOfBusiness: { label: "Genre d’industrie" },
      annualSales: { label: "Ventes annuelles" },
      resell: { label: "Les produits sont pour vente ou distribution" },
      intendedDistribution: { label: "Répartition géographique prévue" },
      creditAmount: { label: "Marge de crédit désirée" },
      products: { label: "Produit(s) que vous désirez acheter" },
      initialOrder: { label: "Estimée de la première commande" },
      annualPurchase: { label: "Estimée d’achats annuels" },
      taxable: { label: "Taxable" },
      taxExemptionTypes: { label: "Sélectionnez le(s) type(s) de taxe applicable(s)" },
      craBusinessNumber: { label: "Numéro d'entreprise ARC ou numéro TPS/TVH/TVP" },
      taxExemptFile: {
        label: "Certificat d'exemption (PDF, 3 MB max)",
        selectFile: "Cliquez ici pour sélectionner un fichier",
        selectedFile: "Fichier sélectionné : {fileName}",
      },

      // Bank references
      bankName: { label: "Nom de la banque" },
      bankAddress: { label: "Adresse de la banque" }, // NOT IN PDF (PDF label is just "Adresse")
      accountManager: { label: "Gestionnaire de compte" },
      bankPhone: { label: "No. de Tél" },
      bankFax: { label: "No. de Fax" },
      bankAccountNumber: { label: "No. de compte (facultatif)" }, // NOT IN PDF (optional is custom)
      bankEmail: { label: "Adresse courriel" },

      // Trade references
      trade: {
        groupTitle: "Référence commerciale {idx}", // NOT IN PDF (custom header)
        company: { label: "Nom de l'entreprise" },
        account: { label: "No. de compte" },
        address: { label: "Adresse" },
        tel: { label: "No. de Tél" },
        contact: { label: "Nom du contact" },
        email: { label: "Adresse courriel" },
      },

      // Segmentation
      primarySegment: { label: "Segment principal" }, // NOT IN PDF (PDF: "Principal (1 seul choix)")
      secondarySegment: { label: "Segment secondaire" }, // NOT IN PDF

      // Final information
      salesRepName: { label: "Représentant de vente" },
      requestorName: { label: "Nom du demandeur" }, // NOT IN PDF
      requestorEmail: { label: "Courriel du demandeur" }, // NOT IN PDF
      title: { label: "Titre" },
      date: { label: "Date" },
    },

    placeholders: {
      postalCode: "A1A 1A1", // NOT IN PDF
      phone: "(123) 456-7890", // NOT IN PDF
      email: "utilisateur@domaine.com", // NOT IN PDF
      apEmail: "ap@entreprise.com", // NOT IN PDF
      bankEmail: "gestionnaire@banque.com", // NOT IN PDF
      digitsOnly: "chiffres seulement", // NOT IN PDF
    },

    options: {
      paymentTerms: {
        creditCard: "Carte de crédit (Payer à la commande)",
        net30: "30 jours suivant la date de facturation",
      },

      typeOfOrganization: [
        { value: "", label: "Sélectionner" }, // NOT IN PDF
        { value: "Corporation", label: "Corporation" },
        { value: "Partnership", label: "Partenariat" },
        { value: "Proprietorship", label: "Propriétaire" },
      ],

      annualPurchase: [
        { value: "", label: "Sélectionner une plage" }, // NOT IN PDF
        { value: "0 - 25 000", label: "0 - 25 000" },
        { value: "25 001 – 50 000", label: "25 001 – 50 000" },
        { value: "50 001 – 100 000", label: "50 001 – 100 000" },
        { value: "100 001 ou plus", label: "100 001 ou plus" },
      ],

      resell: [
        { value: "", label: "Sélectionner une réponse" }, // NOT IN PDF
        { value: "yes", label: "Oui" },
        { value: "no", label: "Non" },
      ],

      intendedDistribution: {
        canadaWide: "Partout au Canada",
      },

      taxable: [
        { value: "", label: "Sélectionner" }, // NOT IN PDF
        { value: "yes", label: "Oui" },
        { value: "no", label: "Non" },
      ],
      taxExemptionTypes: {
        gst: "GST",
        hst: "HST",
        pst: "PST",
      },

      // NOT IN PDF: province dropdown is not in the PDF (PDF just says "Province:")
      // Values kept in English to match existing validateProvince() logic.
      provinces: [
        { value: "Alberta", label: "Alberta" },
        { value: "British Columbia", label: "Colombie-Britannique" },
        { value: "Manitoba", label: "Manitoba" },
        { value: "New Brunswick", label: "Nouveau-Brunswick" },
        { value: "Newfoundland and Labrador", label: "Terre-Neuve-et-Labrador" },
        { value: "Nova Scotia", label: "Nouvelle-Écosse" },
        { value: "Ontario", label: "Ontario" },
        { value: "Prince Edward Island", label: "Île-du-Prince-Édouard" },
        { value: "Quebec", label: "Québec" },
        { value: "Saskatchewan", label: "Saskatchewan" },
      ],

      segmentation: {
        primary: [
          { value: "", label: "Sélectionner" }, // NOT IN PDF
          { value: "hospital", label: "Hôpital" },
          { value: "alternateSite", label: "Autre site" },
          { value: "continuingCare", label: "Soins continus" },
        ],

        secondaryByPrimary: {
          hospital: [
            { value: "Public Hospital", label: "Hôpital public" },
            { value: "Blood Service/Private Lab", label: "Prélèvement sanguin/lab privé" },
            { value: "Dentist Office", label: "Cabinet dentaire" },
            { value: "Pharmacy", label: "Pharmacie" },
            { value: "Veterinary Office", label: "Cabinet vétérinaire" },
            { value: "Diagnostic Imaging Center", label: "Centre d’imagerie diagnostique" },
            { value: "Emergency Medical", label: "Médecine d’urgence" },
            { value: "Extended Care Facility", label: "Centre de soins prolongés" },
            { value: "Government", label: "Gouvernement" },
            { value: "Health Miscellaneous", label: "Services de santé divers" },
            { value: "Home Health Care Provider", label: "Fournisseur de soins à domicile" },
            { value: "Public Clinic", label: "Clinique publique" },
            { value: "Physician Office / Clinic", label: "Cabinet de médecin ou clinique" },
            { value: "Respiratory Services", label: "Services d’inhalothérapie" },
            { value: "School", label: "École" },
            { value: "Sleep Clinic", label: "Clinique du sommeil" }, // NOT IN EN PDF as standalone value
            { value: "Surgical Center", label: "Centre chirurgical" }, // NOT IN FR PDF (best-guess)
            { value: "Transitional Care (Rehab)", label: "Soins transitoires (réadaptation)" },
            { value: "University Hospital/Medical Center", label: "Hôpital ou centre de santé universitaire" },
          ],

          alternateSite: [
            { value: "Blood Service/Private Lab", label: "Prélèvement sanguin/lab privé" },
            { value: "Dentist Office", label: "Cabinet dentaire" },
            { value: "Pharmacy", label: "Pharmacie" },
            { value: "Veterinary Office", label: "Cabinet vétérinaire" },
            { value: "Diagnostic Imaging Center", label: "Centre d’imagerie diagnostique" },
            { value: "Emergency Medical", label: "Médecine d’urgence" },
            { value: "Government", label: "Gouvernement" },
            { value: "Health Miscellaneous", label: "Services de santé divers" },
            { value: "Home Health Care Provider", label: "Fournisseur de soins à domicile" },
            { value: "Public Clinic", label: "Clinique publique" },
            { value: "Physician Office / Clinic", label: "Cabinet de médecin ou clinique" },
            { value: "Respiratory Services", label: "Services d’inhalothérapie" },
            { value: "School", label: "École" },
            { value: "Sleep Clinic", label: "Clinique du sommeil" },
            { value: "Surgical Center", label: "Centre chirurgical" }, // NOT IN FR PDF (best-guess)
          ],

          continuingCare: [
            { value: "Extended Care Facility", label: "Centre de soins prolongés" },
            { value: "Home Health Care Provider", label: "Fournisseur de soins à domicile" },
            { value: "Transitional Care (Rehab)", label: "Soins transitoires (réadaptation)" },
          ],
        },
      },
    },

    errors: {
      // templates: {label}, {max}, {idx}
      requiredSuffix: "est requis.",
      invalidOption: "Sélectionnez une option valide.",
      invalidProvince: "Sélectionnez une province valide.",
      invalidEmail: "Entrez une adresse courriel valide.",
      maxLength: "La longueur maximale est de {max} caractères.",
      legalNameRequired: "Nom légal est requis.",
      cityRequired: "Ville est requis.",
      provinceRequired: "Province est requis.",
      postalCodeRequired: "Code postal est requis.",
      paymentTermsRequired: "La sélection des termes de paiement est requise.",
      onlyLettersNumbersSpaces: "Seules les lettres, les chiffres et les espaces sont autorisés.",
      cityAllowedChars:
        "Seules les lettres, les chiffres, les espaces, les traits d’union (-), les apostrophes (’ ou '), et les points (.) sont autorisés.",
      postalCodeFormat:
        "Le format doit être ANA NAN (ex., K1A 0B1). Seules les lettres ABCEGHJKLMNPRSTVXY sont valides.",
      phone10Digits: "{label} doit comporter 10 chiffres.",
      tradeRefAccountRequired: "Référence commerciale {idx} : No. de compte est requis.",
      tradeRefContactRequired: "Référence commerciale {idx} : Nom du contact est requis.",
      intendedDistributionRequired: "Sélectionnez au moins une option de distribution.",
      taxExemptionTypesRequired: "Sélectionnez au moins 1 option : GST, HST, PST.",
      taxExemptFileRequired: "Le certificat d'exemption (PDF) est requis.",
      taxExemptFileType: "Le fichier doit etre un PDF.",
      taxExemptFileSize: "Le fichier doit faire 3 MB ou moins.",
    },

    alerts: {
      fixErrors: "Veuillez corriger les erreurs avant de soumettre.",
      emailSendError: "Erreur lors de l’envoi du courriel : {errorMessage}",
      unknownError: "Erreur inconnue",
    },

    email: {
      subject: "Formulaire de demande client – Canada", // NOT IN PDF
      section_requestSummary: "Résumé de la demande", // NOT IN PDF
      section_requestDetails: "Détails de la demande",
      submittedAt: "Soumis le", // NOT IN PDF
      section_customerInfo: "Informations client", // NOT IN PDF
      section_addresses: "Adresses", // NOT IN PDF
      section_accountsPayable: "Comptes payables", // NOT IN PDF
      section_paymentTerms: "Termes de paiement",
      paymentNet30Short: "Net 30", // NOT IN PDF (short label)
      paymentCreditCardShort: "Carte de crédit", // NOT IN PDF (short label)
      section_companyInformation: "Informations sur la société",
      section_bankReferences: "Référence bancaire",
      section_tradeReferences: "Références commerciales",
      tradeRefShort: "Référence commerciale {idx}", // NOT IN PDF
    },
  },
} as const;

export type Locale = keyof typeof MESSAGES;

// These keys/labels are not present in the PDFs (they are custom UI text, placeholders, or validation/email messages).
export const NOT_IN_PDF_KEYS = [
  "page.title",
  "page.submit",
  "page.select",
  "sections.finalInformation",
  "sections.taxes",
  "fields.fax.label",
  "fields.apContact.label",
  "fields.apPhone.label",
  "fields.apEmail.label",
  "fields.bankAddress.label",
  "fields.bankAccountNumber.label",
  "fields.trade.groupTitle",
  "fields.trade.contact.label",
  "fields.trade.email.label",
  "fields.taxExemptionTypes.label",
  "fields.craBusinessNumber.label",
  "fields.taxExemptFile.label",
  "fields.primarySegment.label",
  "fields.secondarySegment.label",
  "fields.intendedDistribution.label",
  "fields.requestorName.label",
  "placeholders.*",
  "errors.*",
  "alerts.*",
  "email.*",
  "options.provinces",
  "options.taxExemptionTypes",
  "options.segmentation.secondaryByPrimary.*.SurgicalCenter",
] as const;
