import { useEffect, useState } from "react";
import { Trophy, type TrophyTier } from "../components/Trophy";
import { useAuth } from "../hooks/useAuth";
import { apiCall } from "../lib/api";
import "./Achievements.css";

interface AchievementTier {
  name: string;
  requiredTasks: number;
  tier: TrophyTier;
}

const ACHIEVEMENT_TIERS: AchievementTier[] = [
  { name: "Bronze", requiredTasks: 0, tier: "bronze" },
  { name: "Silver", requiredTasks: 2, tier: "silver" },
  { name: "Gold", requiredTasks: 5, tier: "gold" },
  { name: "Platinum", requiredTasks: 7, tier: "platinum" },
  { name: "Diamond", requiredTasks: 10, tier: "diamond" },
  { name: "Time Crystal", requiredTasks: 20, tier: "timeCrystal" },
];

interface TaskSummary {
  completedTasks: number;
  previousUserLevel: number;
  userLevel: number;
  hasLevelChanged: boolean;
  direction: "promotion" | "demotion" | "none";
}

export default function Achievements() {
  const { user } = useAuth();
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<number>(1);
  const [celebrationDirection, setCelebrationDirection] = useState<
    "promotion" | "demotion" | null
  >(null);
  const [celebratingTierName, setCelebratingTierName] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!user?.id) return;

    let startTimeoutId: number | undefined;
    let endTimeoutId: number | undefined;
    let isMounted = true;

    const fetchCompletedTasks = async () => {
      try {
        const response = await apiCall(
          `/api/auth/achievement-status/${user.id}`,
        );
        if (!response.ok) return;

        const achievementStatus = (await response.json()) as TaskSummary;
        if (!isMounted) return;

        setCompletedTasks(achievementStatus.completedTasks);
        setUserLevel(achievementStatus.userLevel);

        if (
          achievementStatus.hasLevelChanged &&
          achievementStatus.direction !== "none"
        ) {
          const newTier =
            achievementStatus.userLevel >= 1 &&
            achievementStatus.userLevel <= ACHIEVEMENT_TIERS.length
              ? ACHIEVEMENT_TIERS[achievementStatus.userLevel - 1]
              : null;

          startTimeoutId = window.setTimeout(() => {
            if (!isMounted) return;

            setCelebratingTierName(newTier?.name ?? "No Tier");
            setCelebrationDirection(
              achievementStatus.direction === "demotion"
                ? "demotion"
                : "promotion",
            );
          }, 0);

          endTimeoutId = window.setTimeout(() => {
            if (!isMounted) return;

            setCelebratingTierName(null);
            setCelebrationDirection(null);
          }, 3200);
        }
      } catch {
        if (!isMounted) return;

        setCompletedTasks(0);
        setUserLevel(1);
      }
    };

    fetchCompletedTasks();

    return () => {
      isMounted = false;
      if (startTimeoutId !== undefined) window.clearTimeout(startTimeoutId);
      if (endTimeoutId !== undefined) window.clearTimeout(endTimeoutId);
    };
  }, [user?.id]);

  const unlockedTierIndex =
    userLevel >= 1 && userLevel <= ACHIEVEMENT_TIERS.length ? userLevel - 1 : 0;
  const unlockedTier = ACHIEVEMENT_TIERS[unlockedTierIndex];
  const currentTierName = unlockedTier.name;

  if (!user) return null;

  return (
    <div className="achievements-container">
      <div className="achievements-header">
        <h2>Achievements</h2>
      </div>

      <div className="achievements-card">
        <h3>{currentTierName}</h3>
        {celebratingTierName && (
          <div
            className={`tier-unlock-banner ${celebrationDirection === "demotion" ? "tier-unlock-banner-demotion" : ""}`}
          >
            {celebrationDirection === "demotion" ? "↘" : "✨"}{" "}
            {celebrationDirection === "demotion"
              ? `${celebratingTierName} Tier Changed`
              : `${celebratingTierName} Unlocked!`}
          </div>
        )}
        <div className="trophy-scroll" role="region" aria-label="Trophy tiers">
          <div className="trophy-track">
            {ACHIEVEMENT_TIERS.map((tier) => {
              const isUnlocked =
                ACHIEVEMENT_TIERS.indexOf(tier) <= unlockedTierIndex;

              return (
                <div
                  className={`trophy-item ${celebratingTierName === tier.name ? "trophy-item-unlock" : ""}`}
                  key={tier.name}
                >
                  {isUnlocked && (
                    <span
                      className="trophy-complete-badge"
                      data-tooltip="Completed"
                      title="Completed"
                      aria-label="Completed"
                    >
                      ✓
                    </span>
                  )}
                  {!isUnlocked && (
                    <span
                      className="trophy-lock-badge"
                      data-tooltip="Locked"
                      title="Locked"
                      aria-label="Locked"
                    >
                      🔒
                    </span>
                  )}
                  <p className="trophy-item-title">{tier.name}</p>
                  <div className="trophy-lock-wrapper">
                    <div className={isUnlocked ? "" : "trophy-locked"}>
                      <Trophy tier={tier.tier} size={96} />
                    </div>
                  </div>
                  <p className="trophy-unlock-text">
                    {isUnlocked
                      ? "Unlocked"
                      : `Locked - complete ${tier.requiredTasks} tasks to unlock`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <p>Completed tasks: {completedTasks}</p>
      </div>
    </div>
  );
}
