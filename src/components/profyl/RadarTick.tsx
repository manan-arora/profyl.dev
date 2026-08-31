import { useEffect, useState } from "react";

export const RadarTick = ({ x, y, cx, cy, payload }: any) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMobile(window.innerWidth < 480);
            const handleResize = () => setIsMobile(window.innerWidth < 480);
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    const lines =
        payload.value === "Technical Range"
            ? ["TECHNICAL", "RANGE"]
            : payload.value === "Problem Solving"
            ? ["PROBLEM", "SOLVING"]
            : payload.value === "Open Source"
            ? ["OPEN", "SOURCE"]
            : payload.value === "Build Activity"
            ? ["BUILD", "ACTIVITY"]
            : [payload.value.toUpperCase()];

    const dx = x - cx;
    const dy = y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = isMobile ? 8 : 12;

    const labelX = x + (dx / distance) * offset;
    const labelY = y + (dy / distance) * offset;

    return (
        <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={isMobile ? 7 : 8}
            className="font-mono"
        >
            {lines.map((line, index) => (
                <tspan
                    key={line}
                    x={labelX}
                    dy={index === 0 ? (isMobile ? "-3" : "-5") : (isMobile ? "8" : "10")}
                >
                    {line}
                </tspan>
            ))}
        </text>
    );
};