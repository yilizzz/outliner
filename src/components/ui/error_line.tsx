import React from "react";
import { Bug } from "lucide-react";

interface ErrorLineProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ErrorLine = React.forwardRef<HTMLDivElement, ErrorLineProps>(
  ({ className = "", children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className="w-full p-3 mb-3 text-sm text-dark-red bg-light-red rounded-lg flex gap-2 items-center"
        {...props}
      >
        <Bug />
        {children}
      </p>
    );
  }
);

ErrorLine.displayName = "ErrorLine";
