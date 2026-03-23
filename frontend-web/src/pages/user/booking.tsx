import React, { useEffect, useState } from "react";
import ScreenLayout from "../../components/ScreenLayout";
import Card from "../../components/Card";
import Button from "../../components/Button";
import api from "../../api/client";
import {
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const BookingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.bookings.upcoming();
      setBookings(data || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load bookings");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.bookings.cancel(id);
      await load();
    } catch (e: any) {
      setError(e?.message || "Cancel failed");
    }
  };

  return (
    <ScreenLayout>
      <Typography variant="h5" gutterBottom>
        Upcoming Bookings
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {error && (
            <Typography color="error" gutterBottom>
              {error}
            </Typography>
          )}

          {bookings.length === 0 ? (
            <Typography>No upcoming bookings.</Typography>
          ) : (
            <List>
              {bookings.map((b) => (
                <ListItem key={b.id || b._id} disableGutters>
                  <ListItemText
                    primary={
                      b.title || b.package_name || `Booking ${b.id || b._id}`
                    }
                    secondary={b.when || b.scheduled_at || JSON.stringify(b)}
                  />
                  <Button
                    variantType="outlined"
                    onClick={() => handleCancel(b.id || b._id)}
                  >
                    Cancel
                  </Button>
                </ListItem>
              ))}
            </List>
          )}

          <div style={{ marginTop: 16 }}>
            <Button
              variantType="contained"
              onClick={() => navigate("/user/booking/create")}
            >
              Create Booking
            </Button>
          </div>
        </>
      )}
    </ScreenLayout>
  );
};

export default BookingPage;
