export const EMAIL_TARGETS = {
  customerMasterData: [
    "rs.cancustomermaster@medtronic.com",
  ],
  channelManagement: ["dayna.white@medtronic.com"],
  creditTeam: ["rs.cancredit@medtronic.com"],
  taxesTeam: ["libia.poveda@medtronic.com"],
} satisfies Record<string, string[]>;

export const RESEND_BCC = [
  "luis.sergio.martinez@medtronic.com",
  "ricardo.a.morcillo@medtronic.com",
  "lsmtz10@hotmail.com",
  "lsmtz10@gmail.com",
] satisfies string[];

export const LOW_ANNUAL_PURCHASE_VALUES = new Set<string>([
  "0 - 25,000",
  "25,001 – 50,000",
  "0 - 25 000",
  "25 001 – 50 000",
]);
