import React, { useEffect, useState } from "react";
import ScreenLayout from "../components/ScreenLayout";
import api from "../api/client";
import { Grid, CircularProgress, Typography, Alert } from "@mui/material";
import Card from "../components/Card";
import Button from "../components/Button";

export default function PackagesPage() {
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await api.packages.list();
        if (!mounted) return;
        setPackages(data || []);
        setError(null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load packages",
        );
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScreenLayout title="Packages">
      {loading ? <CircularProgress /> : null}
      {error && <Alert severity="error">{error}</Alert>}

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {packages.length === 0 && !loading && !error ? (
          <Typography>No packages available at the moment.</Typography>
        ) : (
          packages.map((p) => (
            <Grid item xs={12} md={6} lg={4} key={p.id || p._id}>
              <Card title={p.name} className="p-4">
                <Typography variant="body2" color="text.secondary">
                  {p.description}
                </Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  ₹{p.price} • {p.duration_days} days
                </Typography>
                <div style={{ marginTop: 12 }}>
                  <Button variantType="primary">Choose</Button>
                </div>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </ScreenLayout>
  );
}
