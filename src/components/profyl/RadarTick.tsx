export const RadarTick = ({ x, y, cx, cy, payload }: any) => {
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
    const offset = 12;

    const labelX = x + (dx / distance) * offset;
    const labelY = y + (dy / distance) * offset;

    return (
        <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            fill="rgba(255,255,255,0.4)"
            fontSize={8}
            className="font-mono"
        >
            {lines.map((line, index) => (
                <tspan
                    key={line}
                    x={labelX}
                    dy={index === 0 ? "-5" : "10"}
                >
                    {line}
                </tspan>
            ))}
        </text>
    );
};