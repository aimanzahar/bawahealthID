import { Id } from "../../convex/_generated/dataModel";

/**
 * Hospital type enumeration
 */
export type HospitalType = "government" | "private" | "clinic" | "specialist";

/**
 * Hospital data structure matching the Convex schema
 */
export interface Hospital {
  _id: Id<"hospitals">;
  _creationTime: number;
  name: string;
  type: HospitalType;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phoneNumber?: string;
  emergencyNumber?: string;
  website?: string;
  email?: string;
  operatingHours?: string;
  is24Hours: boolean;
  hasEmergency: boolean;
  specialties?: string[];
  facilities?: string[];
  rating?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Hospital with calculated distance from user location
 */
export interface HospitalWithDistance extends Hospital {
  distance: number; // in kilometers
}

/**
 * Filter options for hospital search
 */
export interface HospitalFilterOptions {
  type?: HospitalType | "all";
  emergencyOnly?: boolean;
  searchQuery?: string;
}

/**
 * Sort options for hospital list
 */
export type HospitalSortOption = "distance" | "name" | "rating";

/**
 * Map marker data for hospitals
 */
export interface HospitalMarker {
  hospital: HospitalWithDistance;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  pinColor: string;
}

/**
 * Get marker color based on hospital type
 */
export function getHospitalMarkerColor(type: HospitalType): string {
  switch (type) {
    case "government":
      return "#2196F3"; // Blue
    case "private":
      return "#4CAF50"; // Green
    case "clinic":
      return "#FF9800"; // Orange
    case "specialist":
      return "#9C27B0"; // Purple
    default:
      return "#6366f1"; // Primary color
  }
}

/**
 * Get badge style based on hospital type
 */
export function getHospitalTypeBadgeStyle(type: HospitalType): {
  backgroundColor: string;
  textColor: string;
} {
  switch (type) {
    case "government":
      return { backgroundColor: "#E3F2FD", textColor: "#1565C0" };
    case "private":
      return { backgroundColor: "#E8F5E9", textColor: "#2E7D32" };
    case "clinic":
      return { backgroundColor: "#FFF3E0", textColor: "#EF6C00" };
    case "specialist":
      return { backgroundColor: "#F3E5F5", textColor: "#7B1FA2" };
    default:
      return { backgroundColor: "#F3F4F6", textColor: "#6B7280" };
  }
}

/**
 * Get display label for hospital type
 */
export function getHospitalTypeLabel(type: HospitalType): string {
  switch (type) {
    case "government":
      return "Government";
    case "private":
      return "Private";
    case "clinic":
      return "Clinic";
    case "specialist":
      return "Specialist";
    default:
      return type;
  }
}