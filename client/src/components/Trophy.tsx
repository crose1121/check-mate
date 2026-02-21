import type { ReactElement } from "react";

//
// ──────────────────────────────────────────────────────────────
//   Types
// ──────────────────────────────────────────────────────────────
//

export type TrophyTier =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "timeCrystal"
  | "novice";

interface Tier {
  accent: ReactElement;
  color: string;
  name: string;
}

interface TrophyProps {
  level?: number;
  tier?: TrophyTier;
  size?: number;
}

//
// ──────────────────────────────────────────────────────────────
//   Tier Logic
// ──────────────────────────────────────────────────────────────
//

function getTierByLevel(level: number): Tier {
  if (level >= 10) {
    return getTierByName("gold");
  }
  if (level >= 7) {
    return getTierByName("silver");
  }
  if (level >= 4) {
    return getTierByName("bronze");
  }
  return getTierByName("novice");
}

function getTierByName(tier: TrophyTier): Tier {
  switch (tier) {
    case "bronze":
      return {
        color: "#CD7F32",
        name: "Bronze",
        accent: (
          <rect
            x="29"
            y="21"
            width="6"
            height="6"
            rx="1"
            fill="rgba(255,255,255,0.4)"
          />
        ),
      };
    case "silver":
      return {
        color: "#C0C0C0",
        name: "Silver",
        accent: (
          <polygon
            points="32,20 36,24 32,28 28,24"
            fill="rgba(255,255,255,0.45)"
          />
        ),
      };
    case "gold":
      return {
        color: "#FFD700",
        name: "Gold",
        accent: (
          <polygon
            points="32,18.5 33.8,22.2 37.9,22.7 34.9,25.5 35.6,29.5 32,27.6 28.4,29.5 29.1,25.5 26.1,22.7 30.2,22.2"
            fill="rgba(255,255,255,0.55)"
          />
        ),
      };
    case "platinum":
      return {
        color: "#E5E4E2",
        name: "Platinum",
        accent: (
          <circle cx="32" cy="24" r="3.2" fill="rgba(255,255,255,0.55)" />
        ),
      };
    case "diamond":
      return {
        color: "#5EC8FF",
        name: "Diamond",
        accent: (
          <polygon
            points="32,19 38,24 32,29 26,24"
            fill="rgba(255,255,255,0.55)"
          />
        ),
      };
    case "timeCrystal":
      return {
        color: "#8A63FF",
        name: "Time Crystal",
        accent: <></>,
      };
    case "novice":
    default:
      return {
        color: "#9e9e9e",
        name: "Novice",
        accent: <circle cx="32" cy="24" r="3" fill="rgba(255,255,255,0.4)" />,
      };
  }
}

//
// ──────────────────────────────────────────────────────────────
//   Trophy Component
// ──────────────────────────────────────────────────────────────
//

export function Trophy({ level = 1, tier, size = 64 }: TrophyProps) {
  const resolvedTier = tier ? getTierByName(tier) : getTierByLevel(level);

  if (tier === "timeCrystal") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        aria-label="Time Crystal emblem"
        role="img"
        style={{ display: "block", margin: "0 auto" }}
      >
        <defs>
          <linearGradient id="timeCrystalCore" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#B8A4FF" />
            <stop offset="55%" stopColor="#7A57FF" />
            <stop offset="100%" stopColor="#46E7FF" />
          </linearGradient>
        </defs>
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="none"
          stroke="#6D56B3"
          strokeWidth="3"
          strokeDasharray="5 4"
        />
        <polygon
          points="32,10 46,24 32,54 18,24"
          fill="url(#timeCrystalCore)"
        />
        <polygon
          points="32,10 38,24 32,54 26,24"
          fill="rgba(255,255,255,0.25)"
        />
        <polygon
          points="18,24 32,20 46,24 32,30"
          fill="rgba(255,255,255,0.18)"
        />
        <circle cx="32" cy="32" r="3" fill="rgba(255,255,255,0.7)" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-label={`${resolvedTier.name} trophy`}
      role="img"
      style={{ display: "block", margin: "0 auto" }}
    >
      <path
        d="M20 12h24v10c0 9-6.5 16-12 18-5.5-2-12-9-12-18V12z"
        fill={resolvedTier.color}
      />
      <path
        d="M20 16H12v4c0 7 4 11 10 12"
        fill="none"
        stroke={resolvedTier.color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M44 16h8v4c0 7-4 11-10 12"
        fill="none"
        stroke={resolvedTier.color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect
        x="29"
        y="40"
        width="6"
        height="8"
        rx="2"
        fill={resolvedTier.color}
      />
      <rect
        x="22"
        y="48"
        width="20"
        height="6"
        rx="2"
        fill={resolvedTier.color}
      />
      <rect
        x="18"
        y="54"
        width="28"
        height="6"
        rx="2"
        fill={resolvedTier.color}
      />
      <path
        d="M25 16c0 6 2.2 11.2 7 14.5"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {resolvedTier.accent}
    </svg>
  );
}
