import React from "react";
import MuiCard from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardActions from "@mui/material/CardActions";

type Props = {
  title?: React.ReactNode;
  children?: React.ReactNode;
  actions?: React.ReactNode;
  sx?: object;
};

export default function Card({ title, children, actions, sx }: Props) {
  return (
    <MuiCard sx={{ borderRadius: 8, boxShadow: 2, ...sx }}>
      {title && <CardHeader title={title} />}
      <CardContent>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  );
}
