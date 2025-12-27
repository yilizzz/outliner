import React from "react";
import { LoaderPinwheel } from "lucide-react";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex justify-center items-center h-screen ${className}`}
        {...props}
      >
        <LoaderPinwheel className="animate-spin text-dark-blue" size={24} />
      </div>
    );
  }
);

Loader.displayName = "Loader";
