import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Header from "./Header";
import Footer from "./Footer";
import Typography from "@mui/material/Typography";

type Props = {
  title?: string;
  children?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | false;
};

export default function ScreenLayout({
  title,
  children,
  maxWidth = "lg",
}: Props) {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <Header />
      <Container maxWidth={maxWidth} sx={{ py: 3 }}>
        {title && (
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
            {title}
          </Typography>
        )}
        {children}
      </Container>
      <Container maxWidth={maxWidth}>
        <Footer />
      </Container>
    </Box>
  );
}
