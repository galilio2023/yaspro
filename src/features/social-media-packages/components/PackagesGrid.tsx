"use client";

import React, { useState } from "react";
import { SOCIAL_MEDIA_PACKAGES, SocialMediaPackage } from "../data/packages";
import { PackageCard } from "./PackageCard";
import { BillingToggle } from "./BillingToggle";
import { PackageOrderModal } from "./PackageOrderModal";

export function PackagesGrid() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("yearly");
  const [activePackage, setActivePackage] = useState<SocialMediaPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPackage = (pkg: SocialMediaPackage) => {
    setActivePackage(pkg);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActivePackage(null);
  };

  return (
    <div className="w-full space-y-12 sm:space-y-16">
      {/* Billing Switcher */}
      <BillingToggle
        billingInterval={billingInterval}
        onChange={setBillingInterval}
      />

      {/* 4 Tier Pricing Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-6 items-stretch">
        {SOCIAL_MEDIA_PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            billingInterval={billingInterval}
            onSelect={handleSelectPackage}
          />
        ))}
      </div>

      {/* Subscription / Inquiry Modal */}
      <PackageOrderModal
        pkg={activePackage}
        billingInterval={billingInterval}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
