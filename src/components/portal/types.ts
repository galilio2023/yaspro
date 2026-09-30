export type PortalNavIconKey =
  | "dashboard"
  | "bookings"
  | "invoices"
  | "settings"
  | "support"
  | "dailies"
  | "rfps"
  | "stages"
  | "telemetry";

export interface PortalNavItem {
  href: string;
  label: string;
  icon: PortalNavIconKey;
}
