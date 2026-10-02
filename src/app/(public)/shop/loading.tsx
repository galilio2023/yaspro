import { GearShopSkeleton, LoadingFallbackStatus } from "@/components/ui/skeletons";

export default function ShopLoading() {
  return (
    <>
      <LoadingFallbackStatus label="Loading gear rental catalog..." />
      <GearShopSkeleton />
    </>
  );
}
