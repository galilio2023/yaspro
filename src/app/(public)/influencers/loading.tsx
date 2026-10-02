import { TalentNetworkSkeleton, LoadingFallbackStatus } from "@/components/ui/skeletons";

export default function InfluencersLoading() {
  return (
    <>
      <LoadingFallbackStatus label="Loading creator network..." />
      <TalentNetworkSkeleton />
    </>
  );
}
