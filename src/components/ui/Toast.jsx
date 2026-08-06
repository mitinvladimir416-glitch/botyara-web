import { forwardRef } from "react";

const Toast = forwardRef(function Toast(
  { title, children, tone = "neutral", action, onClose, className = "", ...props },
  ref
) {
  const role = tone === "danger" ? "alert" : "status";
  const classes = ["bt-toast", `bt-toast--${tone}`, className].filter(Boolean).join(" ");

  return (
    <aside ref={ref} className={classes} data-bt-ui role={role} aria-live={tone === "danger" ? "assertive" : "polite"} {...props}>
      <div className="bt-toast__content">
        {title && <strong className="bt-toast__title">{title}</strong>}
        {children && <div className="bt-toast__message">{children}</div>}
      </div>
      {action && <div className="bt-toast__action">{action}</div>}
      {onClose && (
        <button className="bt-toast__close" type="button" onClick={onClose} aria-label="Закрыть уведомление">
          <span aria-hidden="true">×</span>
        </button>
      )}
    </aside>
  );
});

export default Toast;
