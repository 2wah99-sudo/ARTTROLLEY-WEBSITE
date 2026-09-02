import * as React from "react";
import { cn } from "@/lib/utils";

export interface GooeyLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The primary color for the goo effect. Defaults to shadcn's primary color. */
  primaryColor?: string;
  /** The secondary color for the goo effect. Defaults to shadcn's secondary color. */
  secondaryColor?: string;
  /** The color for the bottom border. Defaults to shadcn's border color. */
  borderColor?: string;
}

const GooeyLoader = React.forwardRef<HTMLDivElement, GooeyLoaderProps>(
  ({ className, primaryColor, secondaryColor, borderColor, ...props }, ref) => {
    const style = {
      "--gooey-primary-color": primaryColor || "hsl(var(--primary))",
      "--gooey-secondary-color": secondaryColor || "hsl(var(--secondary))",
      "--gooey-border-color": borderColor || "hsl(var(--border))",
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn("relative flex items-center justify-center text-sm", className)}
        style={style}
        role="status"
        aria-label="Loading"
        {...props}
      >
        <svg className="absolute w-0 h-0">
          <defs>
            <filter id="gooey-loader-filter">
              <feGaussianBlur in="SourceGraphic" stdDeviation={12} result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 48 -7"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>

        <div className="gooey-loader" />
      </div>
    );
  }
);
GooeyLoader.displayName = "GooeyLoader";

export { GooeyLoader };
