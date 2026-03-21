import { useState } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import AppTitle from "../components/AppTitle";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  const cosmicButtonBaseSx = {
    py: "0.85rem",
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.95rem",
    fontWeight: 600,
    border: "2px solid transparent",
    background:
      "linear-gradient(135deg, #764ba2 0%, #f093fb 55%, #f5576c 100%)",
    color: "#111",
    boxShadow: "none",
    position: "relative",
    overflow: "hidden",
    // transition:
    //   "transform 0.25s ease, box-shadow 0.35s ease, filter 0.35s ease, color 1s ease, font-weight 1s ease, border-color 1s ease, border-width 1s ease",
    // "&::after": {
    //   content: '""',
    //   position: "absolute",
    //   inset: "-40%",
    //   background:
    //     "radial-gradient(circle, rgba(240,147,251,0.55) 0%, rgba(102,126,234,0.25) 45%, transparent 70%)",
    //   opacity: 0,
    //   transition: "opacity 0.5s ease",
    //   pointerEvents: "none",
    // },
    "&:hover": {
      borderColor: "#facc15",
      background:
        "linear-gradient(135deg, #6c4498 0%, #e884f2 55%, #e94f63 100%)",
      color: "#111",
      fontWeight: 800,
      boxShadow:
        "0 0 0 1px rgba(250,204,21,0.6), 0 0 16px rgba(250,204,21,0.55), 0 0 32px rgba(240,147,251,0.75), 0 0 54px rgba(102,126,234,0.65)",
    },
  } as const;

  return (
    <Box
      sx={{
        padding: "5rem",
        width: "90%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "right",
        gap: "1.35rem",
      }}
    >
      <AppTitle height="156px" width="156px" />
      <Box
        component="p"
        sx={{
          margin: 0,
          fontSize: "2rem",
          fontWeight: 600,
          color: "#f3f4f6",
          letterSpacing: "0.01em",
          marginBottom: "2.35rem",
        }}
      >
        A simple workplace productivity tool
      </Box>
      <Stack
        sx={{
          alignItems: "stretch",
          height: "100%",
          width: "75vw",
          minHeight: "330px",
          gap: "1rem",
          mt: "1.5rem",
          "@media (max-width: 900px)": {
            order: -1,
          },
        }}
      >
        <Box
          sx={{
            maxWidth: "840px",
            width: "25vw",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "2.85rem",
            margin: "0 auto",
            "@media (max-width: 600px)": {
              gridTemplateColumns: "1fr",
            },
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
        </Box>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mt: "0.35rem",
          }}
        >
          <button
            type="button"
            onClick={() => setIsLearnMoreOpen(true)}
            style={{
              background: "none",
              border: "none",
              color: "#f093fb",
              fontWeight: 700,
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "0.95rem",
            }}
          >
            Learn More
          </button>
        </Box>
      </Stack>

      <Modal
        isOpen={isLearnMoreOpen}
        onClose={() => setIsLearnMoreOpen(false)}
        title="Why teams choose Check Mate"
      >
        <div className="modal-info-card">
          <h3>Plan with clarity</h3>
          <p>
            Map every task with priorities, due dates, and quick status cues so everyone knows what matters now.
          </p>
          <ul>
            <li>Drag-and-drop priority lists</li>
            <li>Calendar view for due dates</li>
            <li>Filters for focus by status</li>
          </ul>
        </div>
        <div className="modal-info-card">
          <h3>Ship with confidence</h3>
          <p>
            Keep work moving with lightweight workflows—no clutter, just the essentials to get things done together.
          </p>
          <ul>
            <li>Real-time task updates</li>
            <li>Fast note-taking alongside tasks</li>
            <li>Reminders that respect your time</li>
          </ul>
        </div>
      </Modal>
    </Box>
  );
}
