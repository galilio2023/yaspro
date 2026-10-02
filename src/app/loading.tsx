import { GenericStudioSkeleton, LoadingFallbackStatus } from "@/components/ui/skeletons";

export default function Loading() {
  return (
    <>
      <LoadingFallbackStatus label="Loading studio content..." />
      <GenericStudioSkeleton />
    </>
  );
}
