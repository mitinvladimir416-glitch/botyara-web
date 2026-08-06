import { forwardRef } from "react";

const PremiumButton = forwardRef(function PremiumButton(
  {
    children,
    className = "",
    variant = "primary",
    size = "md",
    leadingIcon,
    trailingIcon,
    loading = false,
    disabled = false,
    type = "button",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  const classes = [
    "bt-button",
    `bt-button--${variant}`,
    `bt-button--${size}`,
    className,
  ].filter(Boolean).join(" ");

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      data-bt-ui
      {...props}
    >
      {loading ? <span className="bt-button__spinner" aria-hidden="true" /> : leadingIcon}
      <span className="bt-button__label">{children}</span>
      {trailingIcon && <span className="bt-button__trailing" aria-hidden="true">{trailingIcon}</span>}
    </button>
  );
});

export default PremiumButton;
