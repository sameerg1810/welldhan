import React from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material"; // FIX 1 — removed unused Button and SvgIcon imports
import { CheckCircle } from "@mui/icons-material";
import { motion } from "framer-motion";

const THEME = {
  accent: "#4ade80",
  gold: "#d4a843",
  background: "#060d08",
  surface: "#0f1813",
  text: "#f5f8f1",
  textMuted: "#cbd5d0",
  secondary: "#2d7a47",
};

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
  ctaLabel: string;
  onClick: () => void;
  borderColor: string;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  icon,
  title,
  description,
  highlights,
  ctaLabel,
  onClick,
  borderColor,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      whileHover={{ y: -8 }}
    >
      <Card
        sx={{
          backgroundColor: THEME.surface,
          border: `2px solid ${THEME.secondary}`,
          borderRadius: "12px",
          p: 4,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          cursor: "pointer",
          "&:hover": {
            borderColor,
            boxShadow: `0 20px 60px ${borderColor}30`,
          },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            mb: 3,
            fontSize: "48px",
            color: borderColor,
            display: "flex",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          sx={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px",
            fontWeight: 700,
            color: THEME.text,
            mb: 1.5,
            textAlign: "center",
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          sx={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: THEME.textMuted,
            mb: 3,
            lineHeight: 1.6,
            textAlign: "center",
            flex: 1,
          }}
        >
          {description}
        </Typography>

        {/* Highlights */}
        <List
          disablePadding
          sx={{
            mb: 3,
            "& .MuiListItem-root": {
              paddingX: 0,
              paddingY: 0.75,
            },
          }}
        >
          {highlights.map((highlight, i) => (
            <ListItem key={i} disableGutters>
              <ListItemIcon sx={{ minWidth: 32, color: borderColor }}>
                <CheckCircle sx={{ fontSize: "18px" }} />
              </ListItemIcon>
              <ListItemText
                primary={highlight}
                primaryTypographyProps={{
                  sx: {
                    // FIX 2 — changed sx={{ to sx: {
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: THEME.text,
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* CTA Button */}
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: borderColor,
            color: THEME.background,
            border: "none",
            borderRadius: "6px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {ctaLabel}
        </motion.button>
      </Card>
    </motion.div>
  );
};

export default RoleCard;
