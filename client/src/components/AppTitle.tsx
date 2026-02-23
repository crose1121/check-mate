import checkMateLogo from "../assets/CheckMateLogo.png";

interface AppTitleProps {
  height: number | string;
  width: number | string;
}

export function AppTitle({ height, width }: AppTitleProps) {
  const numericHeight =
    typeof height === "number" ? height : parseFloat(String(height));
  const scaleBase = Number.isFinite(numericHeight) ? numericHeight / 32 : 1;
  const scale = Math.min(Math.max(scaleBase, 0.95), 2.4);
  const checkSize = `${(1.1 * scale).toFixed(3)}rem`;
  const mateSize = `${(1.2 * scale).toFixed(3)}rem`;

  return (
    <div
      style={{
        marginRight: "35px",
        display: "inline-flex",
        alignItems: "center",
      }}
      aria-label="CheckMate"
    >
      <img
        src={checkMateLogo}
        alt="CheckMate logo"
        style={{
          height,
          width,
          borderRadius: "14px",
          filter: "drop-shadow(0 0 16px rgba(250, 204, 21, 0.55))",
        }}
      />
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          lineHeight: 1,
        }}
      >
        <span
          style={{
            fontSize: checkSize,
            fontWeight: 800,
            // letterSpacing: "0.02em",
            backgroundImage: "linear-gradient(90deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            display: "inline-block",
          }}
        >
          Check
        </span>
        <span
          style={{
            fontSize: mateSize,
            fontWeight: 900,
            // letterSpacing: "-0.015em",
            backgroundImage: "linear-gradient(90deg, #f093fb, #f5576c)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            display: "inline-block",
          }}
        >
          Mate
        </span>
      </span>
    </div>
  );
}

export default AppTitle;
