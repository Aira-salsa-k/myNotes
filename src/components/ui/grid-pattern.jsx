import React, { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * GridPattern component that renders a repeating grid of lines and optional squares.
 * @param {Object} props
 * @param {number} [props.width=40] - Width of the grid pattern.
 * @param {number} [props.height=40] - Height of the grid pattern.
 * @param {number} [props.x=-1] - X offset of the grid pattern.
 * @param {number} [props.y=-1] - Y offset of the grid pattern.
 * @param {Array<[number, number]>} [props.squares] - Array of [x, y] coordinates to fill with squares.
 * @param {string} [props.strokeDasharray="0"] - Stroke dasharray for the grid lines.
 * @param {string} [props.className] - Additional class names for the svg.
 */
export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  squares,
  className,
  ...props
}) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/10 stroke-white/10",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y]) => (
            <rect
              strokeWidth="0"
              key={`${x}-${y}`}
              width={width - 1}
              height={height - 1}
              x={x * width + 1}
              y={y * height + 1}
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
