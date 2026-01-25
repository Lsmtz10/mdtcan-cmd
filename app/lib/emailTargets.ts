export const EMAIL_TARGETS = {
  customerMasterData: [
    "luis.sergio.martinez@medtronic.com",
    "ricardo.a.morcillo@medtronic.com",
  ],
  channelManagement: ["libia.poveda@medtronic.com"],
  creditTeam: ["josmy.cahuamari@medtronic.com"],
  taxesTeam: ["lsmtz10@hotmail.com"],
} satisfies Record<string, string[]>;

export const LOW_ANNUAL_PURCHASE_VALUES = new Set<string>([
  "0 - 25,000",
  "25,001 – 50,000",
  "0 - 25 000",
  "25 001 – 50 000",
]);
