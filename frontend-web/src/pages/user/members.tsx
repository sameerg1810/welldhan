import React, { useEffect, useState } from "react";
import ScreenLayout from "../../components/ScreenLayout";
import Button from "../../components/Button";
import api from "../../api/client";
import {
  List,
  ListItem,
  ListItemText,
  TextField,
  CircularProgress,
  Typography,
} from "@mui/material";

const MembersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.households.members.list();
      setMembers(data || []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Failed to load members");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) return setError("Enter a name");
    try {
      await api.households.members.create({ name });
      setName("");
      await load();
    } catch (e: any) {
      setError(e?.message || "Add failed");
    }
  };

  return (
    <ScreenLayout>
      <Typography variant="h5" gutterBottom>
        Household Members
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {error && <Typography color="error">{error}</Typography>}
          <List>
            {members.map((m) => (
              <ListItem key={m.id || m._id} disableGutters>
                <ListItemText primary={m.name} secondary={m.relation || ""} />
              </ListItem>
            ))}
          </List>

          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
            />
            <Button variantType="contained" onClick={handleAdd}>
              Add
            </Button>
          </div>
        </>
      )}
    </ScreenLayout>
  );
};

export default MembersPage;
