export interface PlatformPaymentSettings {
  beneficiaryName: string;
  bankName: string;
  iban: string;
  swift: string;
  depositPercent: number; // e.g. 50
  conciergePhone: string; // e.g. "+971 55 401 0465"
  conciergeEmail: string; // e.g. "operations@yaspro.ae"
  turnaroundBufferMinutes: number; // e.g. 30
  vatRatePercent: number; // e.g. 5
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformPaymentSettings = {
  beneficiaryName: "YAS PRO MEDIA PRODUCTION LLC",
  bankName: "Emirates NBD — Business Bay, Dubai",
  iban: "AE24 0260 0010 2345 6789 001",
  swift: "EBBDAEADXXX",
  depositPercent: 50,
  conciergePhone: "+971 55 401 0465",
  conciergeEmail: "operations@yaspro.ae",
  turnaroundBufferMinutes: 30,
  vatRatePercent: 5,
};
