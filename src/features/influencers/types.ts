export interface CreatorCountryReach {
  country: string;
  flag: string;
  percentage: number;
}

export interface CreatorDemographics {
  topCountries: CreatorCountryReach[];
  primaryAgeGroup: string;
  genderSplit: { male: number; female: number };
  monthlyImpressions: string;
  engagementRate: string;
}

export interface InfluencerItem {
  id: string;
  slug: string;
  name: string;
  arabicName?: string;
  nationality: string;
  flag: string;
  totalFollowers: string;
  rawFollowers: number; // in millions
  role: string;
  arabicRole?: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  bio: string;
  arabicBio?: string;
  collaborations?: string[];
  arabicCollaborations?: string[];
  signatureProductions?: string[];
  arabicSignatureProductions?: string[];
  demographics?: CreatorDemographics;
  avatar?: string;
  mawthooqStatus?: string;
  mawthooqLicenseId?: string;
}
