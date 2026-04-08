import React, { useId } from "react";
import { cn } from "../../lib/utils";

/**
 * DotPattern component that renders a repeating pattern of dots.
 * @param {Object} props
 * @param {number} [props.width=20] - Width of the pattern.
 * @param {number} [props.height=20] - Height of the pattern.
 * @param {number} [props.x=0] - X offset.
 * @param {number} [props.y=0] - Y offset.
 * @param {number} [props.cx=1] - X position of the dot.
 * @param {number} [props.cy=1] - Y position of the dot.
 * @param {number} [props.cr=1] - Radius of the dot.
 * @param {string} [props.className] - Additional class names.
 */
export function DotPattern({
  width = 20,
  height = 20,
  x = 0,
  y = 0,
  cx = 1,
  cy = 1,
  cr = 1,
  className,
  ...props
}) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/10",
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
          <circle id="pattern-circle" cx={cx} cy={cy} r={cr} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
    </svg>
  );
}
