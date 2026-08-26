import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

import { aspectColors, normalizeAspect } from "./aspectColors";

function AspectTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: { aspect: string } }[];
}) {
  if (!active || !payload?.length) return null;

  const aspect = payload[0].payload.aspect;

  return (
    <div className="rounded border border-gray-600 bg-[#29323C] px-2 py-1 text-xs text-white shadow-md">
      {aspect}
    </div>
  );
}

export default function CityBarChart({
  scores,
  activeAspect
}: {
  scores: any[];
  activeAspect: string;
}) {
    console.log("RAW SCORES:", scores);


  if (!scores || scores.length === 0) return null;

  const normalizedScores = scores.map((item) => ({
    ...item,
    aspect: normalizeAspect(item.aspect)
  }));

  const filteredData =
    activeAspect === "All"
      ? normalizedScores
      : normalizedScores.filter((item) => item.aspect === activeAspect);

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filteredData}>
          <XAxis
            dataKey="aspect"
            tick={false}
            interval={0}
          />
          <YAxis tick={{ fill: "white", fontSize: 11 }} />
          <Tooltip
            content={<AspectTooltip />}
            cursor={{ fill: "rgba(255, 255, 255, 0.08)" }}
          />

          <Bar dataKey="final_score" barSize={30}>
            {filteredData.map((entry, idx) => (
              <Cell
                key={idx}
                fill={aspectColors[entry.aspect] || "#999"} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
