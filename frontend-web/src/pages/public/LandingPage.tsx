import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  Chip,
  Drawer,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Home,
  Star,
  Favorite,
  Menu as MenuIcon,
  Close as CloseIcon,
  Instagram,
  WhatsApp,
} from "@mui/icons-material";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useAuthStore } from "../../store/authStore";

// ============================================================================
// THEME COLORS
// ============================================================================
const THEME = {
  primary: "#1a4d2e",
  secondary: "#2d7a47",
  accent: "#4ade80",
  gold: "#d4a843",
  background: "#060d08",
  surface: "#0f1813",
  text: "#f5f8f1",
  textMuted: "#cbd5d0",
};

// ============================================================================
// ANIMATED TYPING COMPONENT
// ============================================================================
const TypingText: React.FC<{ text: string; delay?: number }> = ({
  text,
  delay = 0,
}) => {
  const letters = text.split("");
  return (
    <motion.span>
      {letters.map((letter, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + i * 0.05 }}
        >
          {letter}
        </motion.span>
      ))}
    </motion.span>
  );
};

// ============================================================================
// CUSTOM CURSOR
// ============================================================================
const CustomCursor: React.FC = () => {
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX - 6);
      cursorY.set(e.clientY - 6);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [cursorX, cursorY]);

  return (
    <motion.div
      style={{
        x: cursorX,
        y: cursorY,
        position: "fixed",
        width: "12px",
        height: "12px",
        backgroundColor: THEME.accent,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9999,
        boxShadow: `0 0 20px ${THEME.accent}`,
      }}
    />
  );
};

// ============================================================================
// STICKY NAVBAR
// ============================================================================
const Navbar: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const { scrollY } = useScroll();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navOpacity = useTransform(scrollY, [0, 80], [0, 0.95]);

  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setDrawerOpen(false);
  };

  return (
    <>
      <motion.nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          backgroundColor: "transparent",
          backdropFilter: "none",
          backgroundOpacity: navOpacity,
          transition: "all 0.3s ease",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Box sx={{ paddingY: 2 }}>
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              color: THEME.gold,
              fontSize: { xs: "20px", md: "28px" },
            }}
          >
            WELLDHAN
          </Typography>
        </Box>

        {/* Desktop Nav */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 4 }}>
          {["home", "features", "packages", "community"].map((item) => (
            <motion.button
              key={item}
              onClick={() => handleScroll(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: "none",
                border: "none",
                color: THEME.text,
                fontFamily: "'DM Sans', sans-serif",
                cursor: "pointer",
                fontSize: "14px",
                textTransform: "capitalize",
                transition: "color 0.3s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = THEME.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = THEME.text)}
            >
              {item}
            </motion.button>
          ))}
        </Box>

        {/* Desktop Buttons */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: "none",
              border: "none",
              color: THEME.text,
              fontFamily: "'DM Sans', sans-serif",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = THEME.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = THEME.text)}
          >
            Login
          </motion.button>
          <motion.button
            onClick={() => navigate("/signup")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              background: THEME.gold,
              border: "none",
              color: THEME.background,
              padding: "8px 24px",
              borderRadius: "4px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Get Started
          </motion.button>
        </Box>

        {/* Mobile Menu */}
        <IconButton
          sx={{ display: { xs: "flex", md: "none" }, color: THEME.gold }}
          onClick={() => setDrawerOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </motion.nav>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            backgroundColor: THEME.surface,
            color: THEME.text,
            width: "80vw",
            maxWidth: "320px",
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: THEME.gold, mb: 2 }}
          >
            <CloseIcon />
          </IconButton>
          <Stack spacing={2}>
            {["Home", "Features", "Packages", "Community"].map((item) => (
              <Button
                key={item}
                fullWidth
                onClick={() => handleScroll(item.toLowerCase())}
                sx={{
                  color: THEME.text,
                  justifyContent: "flex-start",
                  textTransform: "none",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {item}
              </Button>
            ))}
            <Button
              fullWidth
              onClick={() => {
                navigate("/login");
                setDrawerOpen(false);
              }}
              variant="outlined"
              sx={{ borderColor: THEME.gold, color: THEME.gold }}
            >
              Login
            </Button>
            <Button
              fullWidth
              onClick={() => {
                navigate("/signup");
                setDrawerOpen(false);
              }}
              sx={{ backgroundColor: THEME.gold, color: THEME.background }}
            >
              Get Started
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </>
  );
};

// ============================================================================
// SECTION 1: HERO
// ============================================================================
const HeroSection: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <Box
      id="home"
      sx={{
        minHeight: "100vh",
        background: `radial-gradient(circle at center, ${THEME.primary}33 0%, ${THEME.background} 100%)`,
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        pt: 12,
      }}
    >
      {/* Animated background circles */}
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          style={{
            position: "absolute",
            width: `${300 + i * 100}px`,
            height: `${300 + i * 100}px`,
            background: `radial-gradient(circle, ${THEME.accent}${15 - i * 5} 0%, transparent 70%)`,
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
          animate={{ rotate: 360 }}
          transition={{
            duration: 60 + i * 20,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <Container maxWidth="lg">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ textAlign: "center", position: "relative", zIndex: 10 }}
        >
          {/* Eyebrow */}
          <motion.div variants={itemVariants}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: THEME.gold,
                mb: 3,
              }}
            >
              <TypingText text="Welcome to WELLDHAN" delay={0.5} />
            </Typography>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={itemVariants}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: { xs: "48px", md: "72px", lg: "84px" },
                fontWeight: 900,
                fontStyle: "italic",
                lineHeight: 1.2,
                mb: 2,
                color: THEME.text,
              }}
            >
              Your Community's
            </Typography>
            <Box
              sx={{
                background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.accent})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontSize: { xs: "48px", md: "72px", lg: "84px" },
                fontFamily: "'Playfair Display', serif",
                fontWeight: 900,
                fontStyle: "italic",
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              Wellness Journey
            </Box>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: { xs: "48px", md: "72px", lg: "84px" },
                fontWeight: 900,
                fontStyle: "italic",
                lineHeight: 1.2,
                color: THEME.text,
              }}
            >
              Starts Here
            </Typography>
          </motion.div>

          {/* Subheadline */}
          <motion.div variants={itemVariants}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: { xs: "16px", md: "18px" },
                color: THEME.textMuted,
                mt: 4,
                mb: 4,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Expert trainers · Organic food · Delivered to your door · Gated
              communities across Hyderabad
            </Typography>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "center", mb: 6 }}
            >
              <motion.button
                onClick={() => navigate("/signup")}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: THEME.gold,
                  color: THEME.background,
                  border: "none",
                  padding: "14px 32px",
                  borderRadius: "4px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: `0 8px 24px rgba(212, 168, 67, 0.3)`,
                }}
              >
                Get Started Free
              </motion.button>

              <motion.button
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  backgroundColor: "transparent",
                  color: THEME.accent,
                  border: `2px solid ${THEME.accent}`,
                  padding: "12px 32px",
                  borderRadius: "4px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  cursor: "pointer",
                }}
              >
                Watch How It Works
              </motion.button>
            </Stack>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                mt: 6,
              }}
            >
              {[
                "200+ Families",
                "4 Sports",
                "100% Organic",
                "₹0 Platform Fee",
              ].map((stat, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "20px",
                      color: THEME.gold,
                      fontWeight: 700,
                    }}
                  >
                    {stat}
                  </Typography>
                  {i < 3 && (
                    <Box
                      sx={{
                        width: "1px",
                        height: "30px",
                        backgroundColor: `${THEME.accent}40`,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ marginTop: "60px" }}
          >
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                color: THEME.textMuted,
              }}
            >
              Scroll to explore
            </Typography>
            <Box sx={{ fontSize: "24px", mt: 1 }}>↓</Box>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 2: ROTATING QUOTES
// ============================================================================
const QuotesSection: React.FC = () => {
  const quotes = [
    "True wellness is not just exercise — it's nourishment, community, and consistency.",
    "Every great journey begins with a single step. Let your community be your strength.",
    "Organic food is not a luxury. It is a right for every family.",
    "When a community trains together, it thrives together.",
    "The best investment you can make is in the health of your family.",
    "Strength is built in gyms. Character is built in communities.",
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  return (
    <Box
      sx={{
        py: 10,
        background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.primary}20 100%)`,
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center", position: "relative" }}
        >
          {/* Large quotation marks background */}
          <Typography
            sx={{
              fontSize: "180px",
              color: `${THEME.accent}15`,
              position: "absolute",
              top: "-40px",
              left: "50%",
              transform: "translateX(-50%)",
              fontFamily: "'Playfair Display', serif",
              lineHeight: 0.8,
              fontWeight: 700,
            }}
          >
            "
          </Typography>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuote}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: { xs: "28px", md: "36px" },
                  fontStyle: "italic",
                  color: THEME.text,
                  mb: 3,
                  lineHeight: 1.6,
                }}
              >
                {quotes[currentQuote]}
              </Typography>
            </motion.div>
          </AnimatePresence>

          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "16px",
              color: THEME.gold,
            }}
          >
            — WELLDHAN Philosophy
          </Typography>

          {/* Dot indicators */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: "center", mt: 4 }}
          >
            {quotes.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  width: currentQuote === i ? "24px" : "8px",
                  backgroundColor:
                    currentQuote === i ? THEME.gold : THEME.accent,
                }}
                transition={{ duration: 0.3 }}
                style={{
                  height: "8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setCurrentQuote(i)}
              />
            ))}
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 3: FEATURES / WHAT WE OFFER
// ============================================================================
const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: "Badminton Training",
      description:
        "State-level coaches. Proper court access. Morning and evening batches for all ages.",
      price: "From ₹1,200/month",
      icon: "🏸",
      fromLeft: true,
    },
    {
      title: "Karate & Self Defence",
      description:
        "Black belt certified masters. Belt grading system. Junior and adult batches. Build discipline and confidence.",
      price: "From ₹1,500/month",
      icon: "🥋",
      fromLeft: false,
    },
    {
      title: "Yoga & Wellness",
      description:
        "Iyengar certified instructors. Morning sunrise sessions. Stress relief. Suitable for all age groups.",
      price: "From ₹2,500/month",
      icon: "🧘",
      fromLeft: true,
    },
    {
      title: "Swimming",
      description:
        "FINA certified coaches. Structured progression. Kids and adults. Pool access included.",
      price: "From ₹2,000/month",
      icon: "🏊",
      fromLeft: false,
    },
  ];

  return (
    <Box id="features" sx={{ py: 12, background: THEME.background }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "36px", md: "48px" },
              fontWeight: 700,
              textAlign: "center",
              color: THEME.text,
              mb: 2,
            }}
          >
            Everything your family needs
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "18px",
              textAlign: "center",
              color: THEME.textMuted,
              mb: 8,
            }}
          >
            One platform. Four sports. Daily organic food. One community.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {features.map((feature, i) => (
            <Grid item xs={12} sm={6} key={i}>
              <motion.div
                initial={{ opacity: 0, x: feature.fromLeft ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                whileHover={{
                  y: -8,
                  boxShadow: `0 20px 60px rgba(74,222,128,0.2)`,
                }}
              >
                <Card
                  sx={{
                    backgroundColor: THEME.surface,
                    border: `2px solid ${THEME.secondary}`,
                    borderRadius: "8px",
                    p: 4,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: THEME.accent,
                      boxShadow: `0 20px 60px rgba(74,222,128,0.2)`,
                    },
                  }}
                >
                  <Typography sx={{ fontSize: "48px", mb: 2 }}>
                    {feature.icon}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "22px",
                      fontWeight: 700,
                      color: THEME.text,
                      mb: 2,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "16px",
                      color: THEME.textMuted,
                      mb: 4,
                      flex: 1,
                    }}
                  >
                    {feature.description}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Chip
                      label={feature.price}
                      sx={{
                        backgroundColor: `${THEME.gold}20`,
                        color: THEME.gold,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 4: ORGANIC FOOD
// ============================================================================
const FoodSection: React.FC = () => {
  const foodItems = [
    {
      name: "🥦 Organic Broccoli",
      price: "₹85/kg",
      farm: "Srinivas Farms, Medak",
    },
    {
      name: "🫒 Cold Pressed Coconut Oil",
      price: "₹180/bottle",
      farm: "Kerala Natural",
    },
    { name: "🍅 Country Tomatoes", price: "₹52/kg", farm: "Green Valley Farm" },
  ];

  const features = [
    "10kg organic vegetables daily",
    "Cold pressed oils at MRP rates",
    "Farm-direct sourcing",
    "Toggle ON/OFF any item from the app",
    "Pause deliveries when you travel",
    "No wastage guarantee",
  ];

  return (
    <Box
      sx={{
        py: 12,
        background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.primary}15 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={6} alignItems="center">
          {/* Left: Text Content */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: { xs: "36px", md: "44px" },
                  fontWeight: 700,
                  color: THEME.text,
                  mb: 2,
                }}
              >
                Farm to Doorstep. Every Morning.
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  fontStyle: "italic",
                  color: THEME.gold,
                  mb: 3,
                }}
              >
                Because your family deserves food without compromise
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "16px",
                  color: THEME.textMuted,
                  mb: 4,
                  lineHeight: 1.8,
                }}
              >
                We source directly from verified organic farmers around
                Hyderabad. Cold pressed oils at MRP. No pesticides. No
                middlemen. Just pure, honest food — delivered to your flat by
                7:00 AM every morning.
              </Typography>

              <Stack spacing={1.5}>
                {features.map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: "24px",
                          height: "24px",
                          backgroundColor: THEME.accent,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Typography
                          sx={{
                            color: THEME.background,
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                        >
                          ✓
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "16px",
                          color: THEME.text,
                        }}
                      >
                        {feature}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          </Grid>

          {/* Right: Stacked Food Cards */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              style={{ position: "relative", height: "450px" }}
            >
              {foodItems.map((item, i) => (
                <motion.div
                  key={i}
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    position: "absolute",
                    top: `${i * 80}px`,
                    left: `${i * 40}px`,
                    right: 0,
                  }}
                >
                  <Card
                    sx={{
                      backgroundColor: THEME.surface,
                      border: `2px solid ${THEME.secondary}`,
                      p: 3,
                      borderRadius: "8px",
                      backdropFilter: "blur(10px)",
                      backgroundImage: `radial-gradient(circle at top-right, ${THEME.accent}10, transparent)`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: THEME.text,
                        mb: 1,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "24px",
                        color: THEME.gold,
                        fontWeight: 700,
                        mb: 1,
                      }}
                    >
                      {item.price}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        color: THEME.textMuted,
                      }}
                    >
                      {item.farm}
                    </Typography>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 5: HOW IT WORKS
// ============================================================================
const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      number: "1",
      title: "Join Your Community",
      icon: <Home sx={{ fontSize: "48px", color: THEME.gold }} />,
      description:
        "Sign up with your flat number and email. We verify your residency in Lansum Elegante or your gated community.",
    },
    {
      number: "2",
      title: "Choose Your Plan",
      icon: <Star sx={{ fontSize: "48px", color: THEME.gold }} />,
      description:
        "Pick your sports package and food plan. Mix and match — family or individual. Change anytime.",
    },
    {
      number: "3",
      title: "Train, Eat, Thrive",
      icon: <Favorite sx={{ fontSize: "48px", color: THEME.gold }} />,
      description:
        "Book sessions in the app. Your organic basket arrives at 7 AM. Pay once a month via UPI. Zero hassle.",
    },
  ];

  return (
    <Box sx={{ py: 12, background: THEME.background }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "36px", md: "48px" },
              fontWeight: 700,
              textAlign: "center",
              color: THEME.text,
              mb: 10,
            }}
          >
            Up and running in 3 steps
          </Typography>
        </motion.div>

        {/* Desktop Timeline */}
        <Box
          sx={{ display: { xs: "none", md: "block" }, position: "relative" }}
        >
          {/* Connecting Line */}
          <Box
            sx={{
              position: "absolute",
              top: "60px",
              left: "10%",
              right: "10%",
              height: "2px",
              background: `linear-gradient(90deg, transparent, ${THEME.accent}, transparent)`,
              zIndex: 0,
            }}
          />

          <Grid container spacing={4}>
            {steps.map((step, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  style={{
                    position: "relative",
                    zIndex: 1,
                    textAlign: "center",
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: THEME.surface,
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      border: `3px solid ${THEME.gold}`,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "48px",
                      fontWeight: 700,
                      color: THEME.gold,
                      mb: 2,
                    }}
                  >
                    {step.number}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "24px",
                      fontWeight: 700,
                      color: THEME.text,
                      mb: 2,
                    }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "16px",
                      color: THEME.textMuted,
                      lineHeight: 1.6,
                    }}
                  >
                    {step.description}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Mobile Vertical Timeline */}
        <Box sx={{ display: { xs: "block", md: "none" } }}>
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              style={{
                display: "flex",
                gap: "20px",
                marginBottom: "40px",
                position: "relative",
                paddingLeft: "60px",
              }}
            >
              {i < steps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    left: "20px",
                    top: "80px",
                    width: "2px",
                    height: "60px",
                    background: `linear-gradient(180deg, ${THEME.accent}, transparent)`,
                  }}
                />
              )}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  backgroundColor: THEME.surface,
                  border: `2px solid ${THEME.gold}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: THEME.gold,
                }}
              >
                {step.number}
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "20px",
                    fontWeight: 700,
                    color: THEME.text,
                    mb: 1,
                  }}
                >
                  {step.title}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: THEME.textMuted,
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </Typography>
              </Box>
            </motion.div>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 6: PRICING
// ============================================================================
const PricingSection: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const packages = [
    {
      name: "Single Sport",
      price: "₹1,200",
      period: "/ month",
      features: [
        "1 sport",
        "3 sessions/week",
        "App access",
        "Community events",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Wellness Family",
      price: "₹16,000",
      period: "/ month",
      features: [
        "All 4 sports",
        "4 family members",
        "10kg organic vegetables daily",
        "Cold pressed oils",
        "Priority booking",
        "Trainer chat",
      ],
      badge: "Most Popular",
      cta: "Join Now",
      highlighted: true,
    },
    {
      name: "Elite Family",
      price: "₹22,000",
      period: "/ month",
      features: [
        "Everything in Wellness +",
        "Personal trainer 2x/week",
        "Dietitian consultation",
        "Custom meal plan",
        "First priority slots",
      ],
      cta: "Go Elite",
      highlighted: false,
    },
  ];

  return (
    <Box
      id="packages"
      sx={{
        py: 12,
        background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.primary}20 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "36px", md: "48px" },
              fontWeight: 700,
              textAlign: "center",
              color: THEME.text,
              mb: 2,
            }}
          >
            Simple, honest pricing
          </Typography>
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "18px",
              textAlign: "center",
              color: THEME.textMuted,
              mb: 8,
            }}
          >
            No hidden fees. No lock-ins. Cancel anytime.
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {packages.map((pkg, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    backgroundColor: THEME.surface,
                    border: pkg.highlighted
                      ? `3px solid ${THEME.gold}`
                      : `2px solid ${THEME.secondary}`,
                    borderRadius: "12px",
                    p: 4,
                    height: "100%",
                    position: "relative",
                    transform: pkg.highlighted ? "scale(1.05)" : "scale(1)",
                    boxShadow: pkg.highlighted
                      ? `0 20px 60px rgba(212,168,67,0.2)`
                      : "none",
                    background: pkg.highlighted
                      ? `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.primary}30 100%)`
                      : THEME.surface,
                  }}
                >
                  {pkg.badge && (
                    <Chip
                      label={pkg.badge}
                      sx={{
                        position: "absolute",
                        top: "-12px",
                        left: "20px",
                        backgroundColor: THEME.gold,
                        color: THEME.background,
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 700,
                      }}
                    />
                  )}

                  <Typography
                    sx={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: "28px",
                      fontWeight: 700,
                      color: THEME.text,
                      mb: 2,
                      mt: pkg.badge ? 2 : 0,
                    }}
                  >
                    {pkg.name}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      sx={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: "44px",
                        fontWeight: 700,
                        color: THEME.gold,
                      }}
                    >
                      {pkg.price}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px",
                        color: THEME.textMuted,
                      }}
                    >
                      {pkg.period}
                    </Typography>
                  </Box>

                  <Stack spacing={1} sx={{ mb: 4 }}>
                    {pkg.features.map((feature, fi) => (
                      <Box
                        key={fi}
                        sx={{
                          display: "flex",
                          gap: 1,
                          alignItems: "flex-start",
                        }}
                      >
                        <Typography
                          sx={{ color: THEME.accent, fontWeight: "bold" }}
                        >
                          ✓
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            color: THEME.text,
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <motion.button
                    onClick={() => navigate("/signup")}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      width: "100%",
                      padding: "12px",
                      backgroundColor: pkg.highlighted
                        ? THEME.gold
                        : `${THEME.accent}20`,
                      color: pkg.highlighted ? THEME.background : THEME.accent,
                      border: "none",
                      borderRadius: "6px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                      fontSize: "16px",
                      cursor: "pointer",
                    }}
                  >
                    {pkg.cta}
                  </motion.button>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 7: TESTIMONIALS
// ============================================================================
const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      quote:
        "My kids actually look forward to Monday mornings now — karate at 5 PM is their favourite part of the day. And the organic vegetables? We've stopped buying from the supermarket entirely.",
      name: "Ravi Shankar",
      role: "Flat A-101 · Wellness Family Plan",
      initials: "RS",
    },
    {
      quote:
        "As someone who works from home, the morning yoga session has completely changed my productivity. Coach Priya is exceptional. The food delivery means one less errand per day.",
      name: "Sunitha Reddy",
      role: "Flat B-204 · Yoga + Food Plan",
      initials: "SR",
    },
    {
      quote:
        "We switched from a standalone gym and honestly there's no comparison. The community feeling, the trainers who know your child by name — WELLDHAN is not just a service, it's a lifestyle.",
      name: "Venkat Naidu",
      role: "Flat C-301 · Elite Family Plan",
      initials: "VN",
    },
  ];

  return (
    <Box sx={{ py: 12, background: THEME.background }}>
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "36px", md: "48px" },
              fontWeight: 700,
              textAlign: "center",
              color: THEME.text,
              mb: 10,
            }}
          >
            What our families say
          </Typography>
        </motion.div>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card
                  sx={{
                    backgroundColor: THEME.surface,
                    border: `2px solid ${THEME.secondary}`,
                    borderRadius: "12px",
                    p: 4,
                    height: "100%",
                    position: "relative",
                  }}
                >
                  {/* Quote mark background */}
                  <Typography
                    sx={{
                      fontSize: "120px",
                      color: `${THEME.gold}15`,
                      position: "absolute",
                      top: "-10px",
                      right: "10px",
                      fontFamily: "'Playfair Display', serif",
                      lineHeight: 0.8,
                    }}
                  >
                    "
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "16px",
                      color: THEME.text,
                      mb: 4,
                      lineHeight: 1.8,
                      fontStyle: "italic",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {testimonial.quote}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      mt: "auto",
                    }}
                  >
                    <Box
                      sx={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        backgroundColor: THEME.primary,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        color: THEME.gold,
                        fontSize: "18px",
                      }}
                    >
                      {testimonial.initials}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          color: THEME.text,
                          fontSize: "16px",
                        }}
                      >
                        {testimonial.name}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          color: THEME.textMuted,
                        }}
                      >
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 8: COMMUNITY LOCATIONS
// ============================================================================
const CommunitySection: React.FC = () => {
  const locations = [
    { name: "Lansum Elegante · Gachibowli", live: true },
    { name: "My Home Avatar · Kokapet", live: false },
    { name: "Aparna Serene Park · Kondapur", live: false },
    { name: "PBEL City · Peerancheru", live: false },
    { name: "Rainbow Vistas · Moosapet", live: false },
  ];

  return (
    <Box
      id="community"
      sx={{
        py: 12,
        background: `linear-gradient(135deg, ${THEME.surface} 0%, ${THEME.primary}15 100%)`,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "36px", md: "48px" },
              fontWeight: 700,
              textAlign: "center",
              color: THEME.text,
              mb: 10,
            }}
          >
            Currently serving Hyderabad
          </Typography>
        </motion.div>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 3,
            mb: 8,
          }}
        >
          {locations.map((location, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Chip
                label={location.name}
                icon={
                  location.live ? (
                    <Star sx={{ color: `${THEME.accent} !important` }} />
                  ) : undefined
                }
                sx={{
                  backgroundColor: location.live
                    ? `${THEME.accent}20`
                    : THEME.surface,
                  color: location.live ? THEME.accent : THEME.textMuted,
                  border: location.live
                    ? `2px solid ${THEME.accent}`
                    : `1px solid ${THEME.secondary}`,
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: "16px",
                  padding: "24px 20px",
                }}
              />
            </motion.div>
          ))}
        </Box>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{ textAlign: "center" }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "16px",
              color: THEME.textMuted,
              mb: 3,
            }}
          >
            Is your community next? Get in touch with us
          </Typography>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              backgroundColor: THEME.gold,
              color: THEME.background,
              border: "none",
              padding: "12px 32px",
              borderRadius: "4px",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Contact Us →
          </motion.button>
        </motion.div>
      </Container>
    </Box>
  );
};

// ============================================================================
// SECTION 9: FINAL CTA
// ============================================================================
const FinalCtaSection: React.FC<{ navigate: (path: string) => void }> = ({
  navigate,
}) => {
  const stats = [
    { value: 200, label: "Families" },
    { value: 4, label: "Cities" },
    { value: 12, label: "Trainers" },
    { value: 100, label: "% Organic" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${THEME.primary}40 0%, ${THEME.background} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 8,
      }}
    >
      <Container maxWidth="md">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          style={{ textAlign: "center" }}
        >
          <Typography
            sx={{
              fontFamily: "'Playfair Display', serif",
              fontSize: { xs: "40px", md: "56px", lg: "64px" },
              fontWeight: 900,
              color: THEME.text,
              mb: 3,
              lineHeight: 1.3,
            }}
          >
            Ready to transform your community?
          </Typography>

          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "18px",
              color: THEME.textMuted,
              mb: 8,
            }}
          >
            Join 200+ families already living better with WELLDHAN
          </Typography>

          {/* Animated Counter Stats */}
          <Grid container spacing={4} sx={{ mb: 8 }}>
            {stats.map((stat, i) => (
              <Grid item xs={6} sm={3} key={i}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <AnimatedCounter value={stat.value} />
                  <Typography
                    sx={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "14px",
                      color: THEME.textMuted,
                      mt: 1,
                    }}
                  >
                    {stat.label}
                  </Typography>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* CTA Buttons */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ justifyContent: "center", mb: 6 }}
          >
            <motion.button
              onClick={() => navigate("/signup")}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: THEME.gold,
                color: THEME.background,
                border: "none",
                padding: "14px 32px",
                borderRadius: "4px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                cursor: "pointer",
                boxShadow: `0 8px 24px rgba(212, 168, 67, 0.3)`,
              }}
            >
              Start Free Today
            </motion.button>

            <motion.button
              onClick={() =>
                window.open(
                  "https://wa.me/919876543210?text=Hi+WELLDHAN+Team",
                  "_blank",
                )
              }
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundColor: "transparent",
                color: THEME.accent,
                border: `2px solid ${THEME.accent}`,
                padding: "12px 32px",
                borderRadius: "4px",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Talk to Us on WhatsApp
            </motion.button>
          </Stack>
        </motion.div>
      </Container>
    </Box>
  );
};

// ============================================================================
// ANIMATED COUNTER
// ============================================================================
const AnimatedCounter: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    let animationFrame: number;
    let currentValue = 0;
    const increment = value / 60; // Animate over ~1 second at 60fps

    const animate = () => {
      currentValue += increment;
      if (currentValue < value) {
        setDisplayValue(Math.floor(currentValue));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <motion.div>
      <Typography
        sx={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "36px",
          fontWeight: "700",
          color: THEME.gold,
        }}
      >
        {displayValue}
      </Typography>
    </motion.div>
  );
};

// ============================================================================
// FOOTER
// ============================================================================
const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: THEME.surface,
        borderTop: `1px solid ${THEME.secondary}`,
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 4 }}>
          {/* Column 1: Logo */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              sx={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "24px",
                fontWeight: 700,
                color: THEME.gold,
                mb: 2,
              }}
            >
              WELLDHAN
            </Typography>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: THEME.textMuted,
                mb: 2,
              }}
            >
              Your community's wellness journey starts here.
            </Typography>
            <Stack direction="row" spacing={2}>
              <IconButton size="small" sx={{ color: THEME.gold }}>
                <Instagram />
              </IconButton>
              <IconButton size="small" sx={{ color: THEME.gold }}>
                <WhatsApp />
              </IconButton>
            </Stack>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: THEME.text,
                mb: 2,
              }}
            >
              Quick Links
            </Typography>
            <Stack spacing={1}>
              {["Home", "Packages", "About", "Login", "Sign Up"].map((link) => (
                <Typography
                  key={link}
                  sx={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: THEME.textMuted,
                    cursor: "pointer",
                    "&:hover": { color: THEME.gold },
                  }}
                >
                  {link}
                </Typography>
              ))}
            </Stack>
          </Grid>

          {/* Column 3: Contact */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: THEME.text,
                mb: 2,
              }}
            >
              Contact
            </Typography>
            <Stack spacing={1}>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: THEME.textMuted,
                }}
              >
                hello@welldhan.com
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: THEME.textMuted,
                }}
              >
                +91 98765 43210
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: THEME.textMuted,
                }}
              >
                Gachibowli, Hyderabad
              </Typography>
            </Stack>
          </Grid>

          {/* Column 4: Download App */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              sx={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: THEME.text,
                mb: 2,
              }}
            >
              Download App
            </Typography>
            <Stack spacing={1}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: THEME.accent,
                  color: THEME.accent,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                App Store
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: THEME.accent,
                  color: THEME.accent,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Play Store
              </Button>
            </Stack>
          </Grid>
        </Grid>

        <Box
          sx={{
            borderTop: `1px solid ${THEME.secondary}`,
            pt: 4,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              color: THEME.textMuted,
            }}
          >
            © 2025 WELLDHAN · Built with ❤️ in Hyderabad · All rights reserved
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

// ============================================================================
// MAIN LANDING PAGE COMPONENT
// ============================================================================
export default function LandingPage() {
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (token) {
      navigate("/dashboard", { replace: true });
    }
  }, [token, navigate]);

  if (token) {
    return null; // Will redirect in effect
  }

  return (
    <Box sx={{ backgroundColor: THEME.background, color: THEME.text }}>
      <CustomCursor />
      <Navbar navigate={navigate} />
      <HeroSection navigate={navigate} />
      <QuotesSection />
      <FeaturesSection />
      <FoodSection />
      <HowItWorksSection />
      <PricingSection navigate={navigate} />
      <TestimonialsSection />
      <CommunitySection />
      <FinalCtaSection navigate={navigate} />
      <Footer />
    </Box>
  );
}
