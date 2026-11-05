export const ROLES = [
  "Merchant",
  "Partner",
  "Customer",
  "Finance Contact",
  "Support Lead",
];

export const SEGMENTS = ["Individual", "Startup", "SME", "Enterprise"];

export const STATUSES = ["Active", "Inactive", "Pending"];

export const LOCATIONS = [
  { city: "Bengaluru", state: "Karnataka" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Delhi", state: "Delhi" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Pune", state: "Maharashtra" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Ahmedabad", state: "Gujarat" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Kochi", state: "Kerala" },
];

export const CITY_TO_STATE = Object.fromEntries(
  LOCATIONS.map(({ city, state }) => [city, state])
);

export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];

export const DEFAULT_PAGE_SIZE = 25;
