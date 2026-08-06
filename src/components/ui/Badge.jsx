import { forwardRef } from "react";

const Badge = forwardRef(function Badge(
  { children, className = "", tone = "neutral", size = "md", icon, ...props },
  ref
) {
  const classes = ["bt-badge", `bt-badge--${tone}`, `bt-badge--${size}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={ref} className={classes} data-bt-ui {...props}>
      {icon && <span className="bt-badge__icon" aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
});

export default Badge;
