"use client";

import { cn } from "@/lib/utils";

export const ParallaxScroll = ({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) => {
  return (
    <div className={cn("columns-2 md:columns-3 lg:columns-4 gap-3 p-4 pt-2", className)}>
      {images.map((src, idx) => (
        <div key={idx} className="mb-3 break-inside-avoid">
          <img
            src={src}
            className="w-full rounded-lg block"
            loading="lazy"
            decoding="async"
            alt="thumbnail"
          />
        </div>
      ))}
    </div>
  );
};
