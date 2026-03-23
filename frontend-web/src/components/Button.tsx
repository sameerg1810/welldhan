import React from "react";
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";

type VariantType = "primary" | "secondary" | "outline" | "text";

type Props = Omit<MuiButtonProps, "color"> & {
  variantType?: VariantType;
};

const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ variantType = "primary", children, ...rest }, ref) => {
    const mapped: Partial<MuiButtonProps> = (() => {
      switch (variantType) {
        case "primary":
          return { variant: "contained", color: "primary" as const };
        case "secondary":
          return { variant: "contained", color: "secondary" as const };
        case "outline":
          return { variant: "outlined", color: "primary" as const };
        case "text":
          return { variant: "text", color: "primary" as const };
        default:
          return { variant: "contained", color: "primary" as const };
      }
    })();

    // Spread rest first so mapped values (from variantType) take precedence.
    return (
      // Cast ref to any to satisfy MUI's polymorphic overloads (button vs anchor).
      <MuiButton ref={ref as any} {...rest} {...mapped}>
        {children}
      </MuiButton>
    );
  },
);

Button.displayName = "Button";

export default Button;
