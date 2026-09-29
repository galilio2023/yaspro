"use client";

import { cn } from "@/lib/utils";
import React, { createContext, useState, useContext, useRef, useCallback } from "react";

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only perform 3D tilt calculation when hovering and on pointer devices that support hover
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = (e.clientX - left - width / 2) / 25;
      const y = (e.clientY - top - height / 2) / 25;
      el.style.transform = `rotateY(${x}deg) rotateX(${-y}deg)`;
    });
  }, []);

  const handleMouseEnter = useCallback(() => setIsMouseEntered(true), []);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsMouseEntered(false);
    if (containerRef.current) {
      containerRef.current.style.transform = "rotateY(0deg) rotateX(0deg)";
    }
  }, []);

  return (
    <MouseEnterContext.Provider value={[isMouseEntered, setIsMouseEntered]}>
      <div className={cn("w-full h-full [perspective:1000px]", containerClassName)}>
        <div
          ref={containerRef}
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={cn(
            "relative w-full h-full transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d]",
            className
          )}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}) => {
  const Comp = Tag as React.ComponentType<React.HTMLAttributes<HTMLElement>> | "div";
  return (
    <Comp
      className={cn(
        "h-full w-full [transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </Comp>
  );
};

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: {
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
  [key: string]: unknown;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isMouseEntered] = useMouseEnter();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (isMouseEntered) {
      el.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      el.style.transform = "none";
    }
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  const Comp = Tag as React.ComponentType<Record<string, unknown>> | "div";

  return (
    <Comp
      ref={ref}
      className={cn(
        "transition-transform duration-200 ease-out",
        className
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
};

export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a CardContainer");
  }
  return context;
};
