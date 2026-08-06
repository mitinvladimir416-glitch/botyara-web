import { forwardRef, useState } from "react";

const Avatar = forwardRef(function Avatar(
  {
    src,
    alt = "",
    name = "",
    size = "md",
    shape = "squircle",
    status,
    className = "",
    ...props
  },
  ref
) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().charAt(0).toLocaleUpperCase() || "Б";
  const classes = ["bt-avatar", `bt-avatar--${size}`, `bt-avatar--${shape}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <span ref={ref} className={classes} data-bt-ui {...props}>
      {src && !failed ? (
        <img className="bt-avatar__image" src={src} alt={alt || name} onError={() => setFailed(true)} />
      ) : (
        <span className="bt-avatar__fallback" aria-label={alt || name || "Аватар"}>{initial}</span>
      )}
      {status && <span className={`bt-avatar__status bt-avatar__status--${status}`} aria-label={status} />}
    </span>
  );
});

export default Avatar;
