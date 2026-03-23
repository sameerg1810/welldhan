import React from "react";
import { Link } from "react-router-dom";
import { ScreenLayout, Card, Button } from "../components";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Home() {
  return (
    <ScreenLayout>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 360px" },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, mb: 2 }}>
            Book classes. Train together. Stay healthy.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Discover local trainers, schedule slots, manage household meal plans
            and payments — all in one place.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Link to="/auth/register">
              <Button variantType="primary">Get Started</Button>
            </Link>
            <Link to="/auth/login">
              <Button variantType="outline">Login</Button>
            </Link>
          </Box>

          <Box sx={{ mt: 5, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Card>
              <Typography variant="h6">Live Classes</Typography>
              <Typography variant="body2" color="text.secondary">
                Join scheduled sessions with certified trainers.
              </Typography>
            </Card>
            <Card>
              <Typography variant="h6">Household Meals</Typography>
              <Typography variant="body2" color="text.secondary">
                Order or manage meal subscriptions for your family.
              </Typography>
            </Card>
            <Card>
              <Typography variant="h6">Track Payments</Typography>
              <Typography variant="body2" color="text.secondary">
                Simple, secure payments and receipts.
              </Typography>
            </Card>
          </Box>
        </Box>

        <Box>
          <Card title="Quick Actions">
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                component={Link}
                to="/user/booking"
                variantType="contained"
              >
                Book a Session
              </Button>
              <Button component={Link} to="/user/members" variantType="text">
                Manage Members
              </Button>
              <Button component={Link} to="/packages" variantType="outline">
                View Packages
              </Button>
            </Box>
          </Card>
        </Box>
      </Box>
    </ScreenLayout>
  );
}
