import { forwardRef } from "react";

const AvatarFrame = forwardRef(function AvatarFrame(
  { children, className = "", variant = "premium", label, ...props },
  ref
) {
  const classes = ["bt-avatar-frame", `bt-avatar-frame--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={ref} className={classes} data-bt-ui aria-label={label} {...props}>
      <span className="bt-avatar-frame__core">{children}</span>
    </span>
  );
});

export default AvatarFrame;
