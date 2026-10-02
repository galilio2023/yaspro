import { StudioBookingSkeleton, LoadingFallbackStatus } from "@/components/ui/skeletons";

export default function StudioBookingLoading() {
  return (
    <>
      <LoadingFallbackStatus label="Loading soundstage booking..." />
      <StudioBookingSkeleton />
    </>
  );
}
