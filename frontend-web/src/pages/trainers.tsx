import React, { useEffect, useState } from "react";
import ScreenLayout from "../components/ScreenLayout";
import api from "../api/client";
import {
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  CircularProgress,
  Alert,
  Typography,
} from "@mui/material";
import Rating from "@mui/material/Rating";

export default function TrainersPage() {
  const [loading, setLoading] = useState(true);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await api.trainers.list();
        setTrainers(data || []);
        setError(null);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load trainers",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ScreenLayout title="Trainers">
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {trainers.length === 0 && !loading ? (
        <Typography>No trainers found.</Typography>
      ) : (
        <List>
          {trainers.map((t) => (
            <ListItem key={t.id || t._id}>
              <ListItemAvatar>
                <Avatar src={t.image_url || ""}>{(t.name || "")[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t.name}
                secondary={`${t.sport} • ${t.experience_years} yrs`}
              />
              <Rating value={t.rating || 0} readOnly precision={0.1} />
            </ListItem>
          ))}
        </List>
      )}
    </ScreenLayout>
  );
}
