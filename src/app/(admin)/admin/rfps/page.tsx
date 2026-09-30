import React from "react";
import { getCmsEnterpriseRfps } from "@/lib/cms-actions";
import { RfpsManager } from "@/features/admin";

export const metadata = {
  title: "Enterprise RFPs CMS | Yas Productions",
};

export default async function AdminRfpsPage() {
  const initialRfps = await getCmsEnterpriseRfps();
  return <RfpsManager initialRfps={initialRfps} />;
}
