import React, { useEffect, useState } from "react";
import ScreenLayout from "../../components/ScreenLayout";
import api from "../../api/client";
import {
  TextField,
  Button as MuiButton,
  CircularProgress,
  Alert,
  Typography,
  Box,
} from "@mui/material";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [household, setHousehold] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [flatNumber, setFlatNumber] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.households.me();
        setHousehold(data);
        setFlatNumber(data?.flat_number || "");
        setError(null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      await api.households.updateMe({ flat_number: flatNumber });
      const updated = await api.households.me();
      setHousehold(updated);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout title="Profile">
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {household && (
        <Box sx={{ display: "grid", gap: 2 }}>
          <Typography variant="h6">{household.primary_name}</Typography>
          <Typography variant="body2">Flat: {household.flat_number}</Typography>
          <Typography variant="body2">
            Phone: {household.primary_phone}
          </Typography>
          <Typography variant="body2">
            Email: {household.primary_email}
          </Typography>
          <TextField
            label="Flat Number"
            value={flatNumber}
            onChange={(e) => setFlatNumber(e.target.value)}
          />
          <MuiButton variant="contained" onClick={save}>
            Save
          </MuiButton>
        </Box>
      )}
    </ScreenLayout>
  );
}
