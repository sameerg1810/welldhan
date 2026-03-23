import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Footer() {
  return (
    <Box
      component="footer"
      sx={{ borderTop: 1, borderColor: "divider", mt: 6, py: 4 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            WELLDHAN
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Book classes, manage households, and stay active.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box>
            <Typography variant="subtitle2">Company</Typography>
            <Link href="#" color="inherit">
              About
            </Link>
            <br />
            <Link href="#" color="inherit">
              Careers
            </Link>
          </Box>
          <Box>
            <Typography variant="subtitle2">Support</Typography>
            <Link href="#" color="inherit">
              Help
            </Link>
            <br />
            <Link href="#" color="inherit">
              Contact
            </Link>
          </Box>
        </Box>
      </Box>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} WELLDHAN — All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
