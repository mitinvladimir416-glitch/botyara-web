import { forwardRef } from "react";

const GlassCard = forwardRef(function GlassCard(
  {
    as: Component = "div",
    children,
    className = "",
    tone = "default",
    interactive = false,
    padding = "md",
    ...props
  },
  ref
) {
  const classes = [
    "bt-glass-card",
    `bt-glass-card--${tone}`,
    `bt-glass-card--padding-${padding}`,
    interactive && "bt-glass-card--interactive",
    className,
  ].filter(Boolean).join(" ");

  return (
    <Component ref={ref} className={classes} data-bt-ui {...props}>
      {children}
    </Component>
  );
});

export default GlassCard;
