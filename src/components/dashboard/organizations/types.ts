export type OrganizationFormValues = {
  name: string;
  slug: string;
  logo: string;
};

export type SlugAvailabilityState = {
  status: "idle" | "checking" | "available" | "taken" | "error";
  slug: string;
  message: string | null;
  suggestion: string | null;
};
