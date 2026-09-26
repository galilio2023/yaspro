import * as React from "react";
import { cn } from "@/lib/utils";

export interface OrbitingCirclesProps
  extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}

export function OrbitingCircles({
  className,
  children,
  reverse = false,
  duration = 20,
  delay = 10,
  radius = 50,
  path = true,
  ...props
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-white/10 stroke-1"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
          />
        </svg>
      )}

      <div
        style={
          {
            "--duration": duration,
            "--radius": radius,
            "--delay": -delay,
          } as React.CSSProperties
        }
        className={cn(
          "absolute flex size-full transform-gpu items-center justify-center rounded-full border border-transparent [animation-delay:calc(var(--delay)*1000ms)]",
          reverse ? "[animation-direction:reverse]" : "",
          className
        )}
        {...props}
      >
        <div
          style={
            {
              "--duration": duration,
              "--radius": radius,
              "--angle": 0,
            } as React.CSSProperties
          }
          className="animate-orbit absolute flex items-center justify-center"
        >
          {children}
        </div>
      </div>
    </>
  );
}
