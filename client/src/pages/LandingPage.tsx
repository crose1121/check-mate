import { Box, Button, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import checkMateLogo from "../assets/CheckMateLogo.png";

export default function LandingPage() {
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();

  const cosmicButtonBaseSx = {
    width: "50%",
    py: "0.85rem",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.95rem",
    fontWeight: 600,
    border: "1px solid transparent",
    background:
      "linear-gradient(135deg, #764ba2 0%, #f093fb 55%, #f5576c 100%)",
    color: "#111",
    boxShadow: "none",
    position: "relative",
    overflow: "hidden",
    transition:
      "transform 0.25s ease, box-shadow 0.35s ease, filter 0.35s ease, color 1s ease, font-weight 1s ease, border-color 1s ease, border-width 1s ease",
    "&::after": {
      content: '""',
      position: "absolute",
      inset: "-40%",
      // background:
      // "radial-gradient(circle, rgba(240,147,251,0.55) 0%, rgba(102,126,234,0.25) 45%, transparent 70%)",
      opacity: 0,
      transition: "opacity 0.5s ease",
      pointerEvents: "none",
    },
    "&:hover": {
      borderColor: "#facc15",
      borderWidth: "2px",
      background:
        "linear-gradient(135deg, #6c4498 0%, #e884f2 55%, #e94f63 100%)",
      color: "#111",
      fontWeight: 800,
      boxShadow:
        "0 0 0 1px rgba(250,204,21,0.6), 0 0 16px rgba(250,204,21,0.55), 0 0 32px rgba(240,147,251,0.75), 0 0 54px rgba(102,126,234,0.65)",
      filter: "saturate(1.25) brightness(1.08)",
      transform: "translateY(-2px) scale(1.02)",
      "&::after": {
        opacity: 1,
      },
    },
  } as const;

  const handleContinueAsGuest = () => {
    setUser({
      id: "guest-user",
      email: "guest@checkmate.local",
      createdAt: new Date().toISOString(),
    });
    setToken("guest-session");
    navigate("/tasks");
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: "2rem",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: "920px",
          minHeight: "420px",
          p: "4.5rem",
          border: "1px solid #111",
          borderRadius: "12px",
          background:
            "linear-gradient(135deg, rgba(118, 75, 162, 0.5) 0%, rgba(245, 87, 108, 0.5) 100%)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
          overflow: "hidden",
          "@media (max-width: 600px)": {
            p: "1.75rem",
            minHeight: "320px",
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: "1.5rem",
            width: "100%",
            height: "100%",
            minHeight: "330px",
            "@media (max-width: 900px)": {
              gridTemplateColumns: "1fr",
              minHeight: "auto",
            },
          }}
        >
          <Stack
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between",
              height: "100%",
              minHeight: "330px",
            }}
          >
            <Button
              type="button"
              variant="contained"
              onClick={() => navigate("/login")}
              sx={{
                ...cosmicButtonBaseSx,
              }}
            >
              Login
            </Button>

            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate("/register")}
              sx={{
                ...cosmicButtonBaseSx,
              }}
            >
              Register
            </Button>

            <Button
              type="button"
              variant="text"
              onClick={handleContinueAsGuest}
              sx={{
                ...cosmicButtonBaseSx,
              }}
            >
              Continue as a guest
            </Button>
          </Stack>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "330px",
              "@media (max-width: 900px)": {
                order: 3,
                minHeight: "180px",
              },
            }}
          >
            <Box
              component="img"
              src={checkMateLogo}
              alt="CheckMate logo"
              sx={{
                height: "75%",
                maxHeight: "250px",
                width: "auto",
                aspectRatio: "1 / 1",
                filter: "drop-shadow(0 0 14px rgba(250, 204, 21, 0.5))",
              }}
            />
          </Box>

          <Box
            sx={{
              border: "1px solid rgba(17, 17, 17, 0.35)",
              borderRadius: "10px",
              background: "rgba(17, 17, 17, 0.15)",
              p: "1.25rem",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "330px",
            }}
          >
            <Box
              sx={{
                height: "120px",
                borderRadius: "8px",
                background:
                  "radial-gradient(circle at 20% 30%, rgba(240,147,251,0.45), transparent 55%), radial-gradient(circle at 80% 70%, rgba(102,126,234,0.45), transparent 55%), rgba(17,17,17,0.25)",
                border: "1px solid rgba(17, 17, 17, 0.35)",
              }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
              }}
            >
              <Box
                sx={{
                  height: "64px",
                  borderRadius: "8px",
                  background: "rgba(17,17,17,0.2)",
                  border: "1px solid rgba(17,17,17,0.35)",
                }}
              />
              <Box
                sx={{
                  height: "64px",
                  borderRadius: "8px",
                  background: "rgba(17,17,17,0.2)",
                  border: "1px solid rgba(17,17,17,0.35)",
                }}
              />
              <Box
                sx={{
                  gridColumn: "1 / span 2",
                  height: "64px",
                  borderRadius: "8px",
                  background: "rgba(17,17,17,0.2)",
                  border: "1px solid rgba(17,17,17,0.35)",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
