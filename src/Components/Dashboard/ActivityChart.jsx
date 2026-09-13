import { useId } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../../theme/useTheme";

// Recharts writes colors into SVG attributes, where CSS variables are not
// reliable, so the palette is resolved here from the current theme.
const palette = {
  light: { users: "#8d7ff3", templates: "#fcc97a", grid: "#ececf1", tick: "#9a9aa6", tooltip: "#fff", ink: "#111", border: "#e4e4e7" },
  dark: { users: "#a78dff", templates: "#ffc21c", grid: "rgba(255,255,255,0.07)", tick: "#bcbccd", tooltip: "#1a1a28", ink: "#fff", border: "rgba(255,255,255,0.12)" },
};

export default function ActivityChart({ data, usersMax, templatesMax }) {
  const { resolvedTheme } = useTheme();
  const colors = palette[resolvedTheme === "dark" ? "dark" : "light"];
  // React 19 ids contain characters that are not valid in url(#id).
  const id = `activity${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const tick = { fill: colors.tick, fontSize: 13 };
  const dot = (color) => ({ r: 5, fill: color, stroke: color, strokeWidth: 0 });
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 4, bottom: 0, left: -12 }}>
        <defs>
          <linearGradient id={`${id}-users`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.users} stopOpacity={0.35} />
            <stop offset="100%" stopColor={colors.users} stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id={`${id}-templates`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.templates} stopOpacity={0.4} />
            <stop offset="100%" stopColor={colors.templates} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={colors.grid} />
        <XAxis dataKey="label" tick={tick} tickLine={false} axisLine={false} tickMargin={12} interval="preserveStartEnd" />
        <YAxis yAxisId="users" domain={[0, usersMax]} tickCount={5} tick={tick} tickLine={false} axisLine={false} width={48} />
        <YAxis yAxisId="templates" orientation="right" domain={[0, templatesMax]} tickCount={5} tick={tick} tickLine={false} axisLine={false} width={36} />
        <Tooltip
          cursor={{ stroke: colors.border }}
          contentStyle={{ background: colors.tooltip, border: `1px solid ${colors.border}`, borderRadius: 8, color: colors.ink, fontSize: 13 }}
          labelStyle={{ color: colors.ink, fontWeight: 500 }}
        />
        <Area yAxisId="templates" name="Templates Published" type="monotone" dataKey="templates" stroke={colors.templates} strokeWidth={2.5} fill={`url(#${id}-templates)`} dot={dot(colors.templates)} activeDot={{ r: 6 }} />
        <Area yAxisId="users" name="New Users" type="monotone" dataKey="users" stroke={colors.users} strokeWidth={2.5} fill={`url(#${id}-users)`} dot={dot(colors.users)} activeDot={{ r: 6 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
