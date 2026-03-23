import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";

type Props = TextFieldProps & {
  label?: string;
};

export default function Input(props: Props) {
  return <TextField fullWidth {...props} />;
}
