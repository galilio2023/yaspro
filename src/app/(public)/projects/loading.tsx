import { ProjectsSkeleton, LoadingFallbackStatus } from "@/components/ui/skeletons";

export default function ProjectsLoading() {
  return (
    <>
      <LoadingFallbackStatus label="Loading productions and showcase..." />
      <ProjectsSkeleton />
    </>
  );
}
