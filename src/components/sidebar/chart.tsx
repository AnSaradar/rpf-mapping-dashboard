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
          <Tooltip />

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
