'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type LocaleKey = 'en' | 'fr';
type VariantKey = 'default' | 'resellYes' | 'lowPurchase';

const CONFIRM_MESSAGES: Record<LocaleKey, Record<VariantKey, string>> = {
  en: {
    default:
      'We have received your request. If the information is complete and correct, your account will be activated within 48 hours. For questions or follow-up, please contact us at rs.cancustomermaster@medtronic.com.',
    resellYes: 'Your request will be assessed; our team will contact you.  For questions, please contact us at rs.cancustomermaster@medtronic.com.',
    lowPurchase:
      'Based on the information provided, your expected annual purchase is below $50,000. To ensure timely service and appropriate support, we kindly ask you to access Medtronic products through our authorized distribution partners. For questions or follow-up, please contact us at rs.cancustomermaster@medtronic.com.',
  },
  fr: {
    default:
      'Nous avons reçu votre demande. Si les informations sont complètes et exactes, votre compte sera activé dans les 48 heures. Pour toute question ou suivi, veuillez nous contacter à rs.cancustomermaster@medtronic.com.',
    resellYes: 'Votre demande sera évaluée; notre équipe vous contactera.  Pour toute question ou suivi, veuillez nous contacter à rs.cancustomermaster@medtronic.com.',
    lowPurchase:
      'Selon les informations fournies, votre achat annuel estimé est inférieur à 50 000 $. Pour assurer un service rapide et un soutien approprié, nous vous invitons à accéder aux produits Medtronic par l’intermédiaire de nos partenaires de distribution autorisés.   Pour toute question ou suivi, veuillez nous contacter à rs.cancustomermaster@medtronic.com.',
  },
};

const TITLES: Record<LocaleKey, string> = {
  en: 'Thank you!',
  fr: 'Merci !',
};

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const localeParam = (searchParams.get('locale') || 'en') as LocaleKey;
  const locale: LocaleKey = localeParam === 'fr' ? 'fr' : 'en';
  const variantParam = searchParams.get('variant') as VariantKey | null;
  const variant: VariantKey =
    variantParam === 'resellYes' || variantParam === 'lowPurchase' ? variantParam : 'default';

  const message = CONFIRM_MESSAGES[locale][variant];

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-xl text-center p-8">
        <h1 className="text-2xl font-semibold text-black mb-4">{TITLES[locale]}</h1>
        <p className="text-gray-800 text-lg whitespace-pre-line">{message}</p>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
