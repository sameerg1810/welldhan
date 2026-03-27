import React, { useRef, useEffect } from "react";
import { Box, TextField, Stack } from "@mui/material";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  length?: number;
}

const THEME = {
  accent: "#4ade80",
  gold: "#d4a843",
  background: "#060d08",
  surface: "#0f1813",
  text: "#f5f8f1",
  textMuted: "#cbd5d0",
};

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  length = 6,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(length).fill(null),
  );
  const values = value.padEnd(length, "").split("").slice(0, length);

  useEffect(() => {
    if (value.length > 0 && inputRefs.current[value.length]) {
      inputRefs.current[value.length]?.focus(); // FIX 1 — added optional chaining
    }
  }, [value.length]);

  const handleInput = (index: number, digit: string) => {
    if (!/^\d*$/.test(digit)) return;

    const newValues = [...values];
    newValues[index] = digit;
    const newValue = newValues.join("");

    onChange(newValue);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newValue.length === length && onComplete) {
      onComplete(newValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValues = [...values];

      if (values[index]) {
        newValues[index] = "";
      } else if (index > 0) {
        newValues[index - 1] = "";
        inputRefs.current[index - 1]?.focus();
      }

      onChange(newValues.join(""));
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    onChange(pastedData);

    if (pastedData.length === length && onComplete) {
      onComplete(pastedData);
    }
  };

  return (
    <Stack direction="row" spacing={1.5} justifyContent="center">
      {Array.from({ length }).map((_, index) => (
        <TextField
          key={index}
          inputRef={(ref) => {
            inputRefs.current[index] = ref as HTMLInputElement; // FIX 2 — wrapped in block body
          }}
          type="text"
          inputMode="numeric"
          value={values[index] || ""}
          onChange={(e) => handleInput(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          autoComplete="off"
          inputProps={{ maxLength: 1 }} // FIX 3 — maxLength inside inputProps, not direct prop
          sx={{
            width: "50px",
            height: "50px",
            "& .MuiOutlinedInput-root": {
              fontSize: "24px",
              fontWeight: 700,
              color: THEME.text,
              backgroundColor: THEME.surface,
              "& fieldset": {
                // FIX 4 — target fieldset for border
                borderColor: THEME.textMuted,
              },
              "&:hover fieldset": {
                // FIX 5 — hover on fieldset
                borderColor: THEME.accent,
              },
              "&.Mui-focused fieldset": {
                // FIX 6 — focused on fieldset
                borderColor: THEME.accent,
                boxShadow: `0 0 0 3px rgba(74, 222, 128, 0.1)`,
              },
            },
            "& input": {
              textAlign: "center",
              padding: 0,
              caretColor: THEME.accent,
              color: THEME.text,
              fontSize: "20px",
              fontWeight: 700,
            },
          }}
        />
      ))}
    </Stack>
  );
};

export default OtpInput;
