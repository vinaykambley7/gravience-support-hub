export const PORTAL_NAME = "Aadhaar Training";
export const PORTAL_SUBTITLE = "Grievance & Support Portal";

export const TELANGANA_DISTRICTS = [
  "Adilabad",
  "Bhadradri Kothagudem",
  "Hanamkonda",
  "Hyderabad",
  "Jagtial",
  "Jangaon",
  "Jayashankar Bhupalpally",
  "Jogulamba Gadwal",
  "Kamareddy",
  "Karimnagar",
  "Khammam",
  "Komaram Bheem Asifabad",
  "Mahabubabad",
  "Mahbubnagar",
  "Mancherial",
  "Medak",
  "Medchal-Malkajgiri",
  "Mulugu",
  "Nagarkurnool",
  "Nalgonda",
  "Narayanpet",
  "Nirmal",
  "Nizamabad",
  "Peddapalli",
  "Rajanna Sircilla",
  "Rangareddy",
  "Sangareddy",
  "Siddipet",
  "Suryapet",
  "Vikarabad",
  "Wanaparthy",
  "Warangal",
  "Yadadri Bhuvanagiri",
] as const;

export const GRIEVANCE_CATEGORIES = [
  "Training Content",
  "Trainer Related",
  "Certification / Exam",
  "Login / Credentials Issue",
  "Biometric Device Issue",
  "Training Schedule",
  "Training Material Not Received",
  "Venue / Infrastructure",
  "Fee / Payment",
  "Attendance / Records",
  "Technical Issue",
  "Other",
] as const;

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const STATUSES = [
  "Submitted",
  "Under Review",
  "In Progress",
  "Resolved",
  "Closed",
] as const;

export type GrievanceStatus = (typeof STATUSES)[number];
export type GrievancePriority = (typeof PRIORITIES)[number];

export const NEXT_STATUS: Record<GrievanceStatus, GrievanceStatus[]> = {
  Submitted: ["Under Review", "In Progress"],
  "Under Review": ["In Progress", "Resolved"],
  "In Progress": ["Resolved", "Under Review"],
  Resolved: ["Closed", "In Progress"],
  Closed: [],
};

export const FALLBACK_PUBLIC_BASE_URL = "http://localhost:3000";
