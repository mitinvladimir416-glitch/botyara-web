import { forwardRef } from "react";

// Единый компонент рамки аватара — driven by user.avatar_frame / item.css_value
// (значения каталога магазина, например "fire", "level-legend", "neon-cyan-round").
// CSS-классы .avatar-frame / .avatar-frame-<value> определены в App.css.
const AvatarFrame = forwardRef(function AvatarFrame(
  { frame, children, className = "", label, ...props },
  ref
) {
  if (!frame) return children;

  const classes = ["avatar-frame", `avatar-frame-${frame}`, className].filter(Boolean).join(" ");

  return (
    <span ref={ref} className={classes} data-bt-ui aria-label={label} {...props}>
      {children}
    </span>
  );
});

export default AvatarFrame;
