import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Link as RouterLink } from "react-router-dom";

export default function Header() {
  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: 1, borderColor: "divider" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "text.primary",
              fontWeight: 800,
            }}
          >
            WELLDHAN
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
          <Button component={RouterLink} to="/user/home">
            Home
          </Button>
          <Button component={RouterLink} to="/user/booking">
            Book
          </Button>
          <Button component={RouterLink} to="/packages">
            Packages
          </Button>
          <Button component={RouterLink} to="/trainers">
            Trainers
          </Button>
          <Button component={RouterLink} to="/auth/login" variant="outlined">
            Login
          </Button>
        </Box>

        <IconButton
          edge="end"
          color="inherit"
          sx={{ display: { md: "none" } }}
          aria-label="menu"
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
