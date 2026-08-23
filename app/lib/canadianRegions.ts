export const CANADIAN_REGIONS = [
  { value: "Alberta", en: "Alberta", fr: "Alberta" },
  { value: "British Columbia", en: "British Columbia", fr: "Colombie-Britannique" },
  { value: "Manitoba", en: "Manitoba", fr: "Manitoba" },
  { value: "New Brunswick", en: "New Brunswick", fr: "Nouveau-Brunswick" },
  {
    value: "Newfoundland and Labrador",
    en: "Newfoundland and Labrador",
    fr: "Terre-Neuve-et-Labrador",
  },
  {
    value: "Northwest Territories",
    en: "Northwest Territories",
    fr: "Territoires du Nord-Ouest",
  },
  { value: "Nova Scotia", en: "Nova Scotia", fr: "Nouvelle-Écosse" },
  { value: "Nunavut", en: "Nunavut", fr: "Nunavut" },
  { value: "Ontario", en: "Ontario", fr: "Ontario" },
  {
    value: "Prince Edward Island",
    en: "Prince Edward Island",
    fr: "Île-du-Prince-Édouard",
  },
  { value: "Quebec", en: "Quebec", fr: "Québec" },
  { value: "Saskatchewan", en: "Saskatchewan", fr: "Saskatchewan" },
  { value: "Yukon", en: "Yukon", fr: "Yukon" },
] as const;

export type CanadianRegionValue = (typeof CANADIAN_REGIONS)[number]["value"];

export const CANADIAN_REGION_VALUES: readonly CanadianRegionValue[] = CANADIAN_REGIONS.map(
  ({ value }) => value
);

type CanadianRegionOption = Readonly<{ value: CanadianRegionValue; label: string }>;

export const CANADIAN_REGION_OPTIONS_EN: readonly CanadianRegionOption[] = CANADIAN_REGIONS.map(
  ({ value, en }) => ({ value, label: en })
);

export const CANADIAN_REGION_OPTIONS_FR: readonly CanadianRegionOption[] = CANADIAN_REGIONS.map(
  ({ value, fr }) => ({ value, label: fr })
);
