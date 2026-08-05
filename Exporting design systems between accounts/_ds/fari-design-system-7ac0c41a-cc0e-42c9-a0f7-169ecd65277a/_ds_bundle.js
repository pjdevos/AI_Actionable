/* @ds-bundle: {"format":3,"namespace":"FARIDesignSystem_7ac0c4","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"Stat","sourcePath":"components/data-display/Stat.jsx"},{"name":"Tag","sourcePath":"components/data-display/Tag.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/buttons/Button.jsx":"9f12d841b25d","components/buttons/IconButton.jsx":"a3f52a715b51","components/data-display/Avatar.jsx":"2457e2612c33","components/data-display/Badge.jsx":"fa8896ac5c1f","components/data-display/Card.jsx":"c8c1f04ae92b","components/data-display/Stat.jsx":"b9f43d906b0a","components/data-display/Tag.jsx":"b7bc71ad3873","components/feedback/Alert.jsx":"699902c3a21a","components/forms/Checkbox.jsx":"a98a65092809","components/forms/Input.jsx":"e413ee1a7091","components/forms/Select.jsx":"18fd608f28ca","components/forms/Switch.jsx":"5bd125227e71","components/navigation/Tabs.jsx":"651f7a5235e2","ui_kits/website/Footer.jsx":"6688963a6e80","ui_kits/website/Header.jsx":"283610da3c4e","ui_kits/website/HomeScreen.jsx":"91c91bf544ed","ui_kits/website/ProjectScreen.jsx":"40c5d319a7ee","ui_kits/website/ProjectsScreen.jsx":"211a1807e92e","ui_kits/website/data.jsx":"5143bb13813a"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FARIDesignSystem_7ac0c4 = window.FARIDesignSystem_7ac0c4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FARI Button — primary call-to-action and standard actions.
 * Variants map to the brand's interaction colors; accent (purple)
 * is reserved for precise moments of emphasis.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  type = "button",
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: "0 14px",
      height: 34,
      fontSize: 13,
      gap: 6
    },
    md: {
      padding: "0 18px",
      height: 42,
      fontSize: 14,
      gap: 8
    },
    lg: {
      padding: "0 24px",
      height: 50,
      fontSize: 16,
      gap: 10
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: "var(--action-primary)",
      color: "var(--text-on-brand)",
      border: "1px solid transparent",
      "--hover-bg": "var(--action-primary-hover)"
    },
    secondary: {
      background: "var(--surface-card)",
      color: "var(--text-brand)",
      border: "1.5px solid var(--border-brand)",
      "--hover-bg": "var(--blue-50)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-brand)",
      border: "1px solid transparent",
      "--hover-bg": "var(--blue-50)"
    },
    accent: {
      background: "var(--action-accent)",
      color: "var(--text-on-brand)",
      border: "1px solid transparent",
      "--hover-bg": "var(--action-accent-hover)"
    },
    teal: {
      background: "var(--action-teal)",
      color: "var(--text-on-brand)",
      border: "1px solid transparent",
      "--hover-bg": "var(--action-teal-hover)"
    }
  };
  const v = variants[variant] || variants.primary;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      height: s.height,
      padding: s.padding,
      width: fullWidth ? "100%" : "auto",
      fontFamily: "var(--font-sans)",
      fontSize: s.fontSize,
      fontWeight: 600,
      lineHeight: 1,
      letterSpacing: "0.01em",
      borderRadius: "var(--radius-pill)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "background var(--duration-fast) var(--ease-standard), transform var(--duration-fast) var(--ease-standard)",
      background: hover && !disabled ? v["--hover-bg"] : v.background,
      color: v.color,
      border: v.border,
      transform: hover && !disabled ? "translateY(-1px)" : "none",
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FARI IconButton — compact square/round button for a single icon.
 * Pass a 20px icon (e.g. a Lucide <i data-lucide> or SVG) as children.
 */
function IconButton({
  children,
  variant = "ghost",
  size = "md",
  shape = "round",
  disabled = false,
  ariaLabel,
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: 32,
    md: 40,
    lg: 48
  };
  const dim = sizes[size] || sizes.md;
  const variants = {
    solid: {
      background: "var(--action-primary)",
      color: "var(--text-on-brand)",
      border: "1px solid transparent",
      "--hover-bg": "var(--action-primary-hover)"
    },
    outline: {
      background: "var(--surface-card)",
      color: "var(--text-brand)",
      border: "1.5px solid var(--border-brand)",
      "--hover-bg": "var(--blue-50)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-muted)",
      border: "1px solid transparent",
      "--hover-bg": "var(--ink-100)"
    }
  };
  const v = variants[variant] || variants.ghost;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": ariaLabel,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: dim,
      height: dim,
      borderRadius: shape === "round" ? "var(--radius-pill)" : "var(--radius-md)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.45 : 1,
      transition: "background var(--duration-fast) var(--ease-standard)",
      background: hover && !disabled ? v["--hover-bg"] : v.background,
      color: v.color,
      border: v.border,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
/**
 * FARI Avatar — circular user/initials avatar. Falls back to initials on a
 * brand-tinted background when no image is given.
 */
function Avatar({
  src,
  name = "",
  size = 40,
  style = {}
}) {
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0].toUpperCase()).join("");

  // deterministic brand tint from the name
  const tints = [["var(--blue-100)", "var(--fari-blue)"], ["var(--teal-100)", "var(--teal-800)"], ["color-mix(in srgb, var(--fari-purple) 16%, white)", "var(--fari-purple)"]];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
  const [bg, fg] = tints[h % tints.length];
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      borderRadius: "50%",
      overflow: "hidden",
      background: bg,
      color: fg,
      fontFamily: "var(--font-sans)",
      fontWeight: 700,
      fontSize: size * 0.4,
      flex: "none",
      userSelect: "none",
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initials || "?");
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
/**
 * FARI Badge — small status/label pill. Soft tonal fills drawn from
 * the brand scales. Use `dot` for a leading status dot.
 */
function Badge({
  children,
  variant = "blue",
  dot = false,
  style = {}
}) {
  const variants = {
    blue: {
      bg: "var(--blue-50)",
      fg: "var(--fari-blue)",
      dotc: "var(--fari-web-blue)"
    },
    teal: {
      bg: "var(--teal-100)",
      fg: "var(--teal-800)",
      dotc: "var(--teal-700)"
    },
    purple: {
      bg: "color-mix(in srgb, var(--fari-purple) 14%, white)",
      fg: "var(--fari-purple)",
      dotc: "var(--fari-purple)"
    },
    neutral: {
      bg: "var(--ink-100)",
      fg: "var(--ink-700)",
      dotc: "var(--ink-500)"
    },
    success: {
      bg: "color-mix(in srgb, var(--status-ok) 14%, white)",
      fg: "var(--status-ok)",
      dotc: "var(--status-ok)"
    },
    info: {
      bg: "color-mix(in srgb, var(--status-gather) 16%, white)",
      fg: "#1b7 fallback",
      dotc: "var(--status-gather)"
    },
    error: {
      bg: "color-mix(in srgb, var(--status-error) 12%, white)",
      fg: "var(--status-error)",
      dotc: "var(--status-error)"
    }
  };
  const v = variants[variant] || variants.blue;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 24,
      padding: "0 10px",
      borderRadius: "var(--radius-pill)",
      background: v.bg,
      color: variant === "info" ? "#0E6E91" : v.fg,
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.01em",
      whiteSpace: "nowrap",
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: v.dotc,
      flex: "none"
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FARI Card — surface container with soft cool-tinted elevation.
 * `accent` adds a top brand keyline; `interactive` lifts on hover.
 */
function Card({
  children,
  padding = 24,
  accent = false,
  interactive = false,
  style = {},
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onMouseEnter: () => interactive && setHover(true),
    onMouseLeave: () => interactive && setHover(false),
    style: {
      position: "relative",
      background: "var(--surface-card)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-lg)",
      padding,
      boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-sm)",
      transform: hover ? "translateY(-2px)" : "none",
      transition: "box-shadow var(--duration-base) var(--ease-standard), transform var(--duration-base) var(--ease-standard)",
      cursor: interactive ? "pointer" : "default",
      overflow: "hidden",
      ...style
    }
  }, rest), accent && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: "var(--gradient-1)"
    }
  }), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Stat.jsx
try { (() => {
/**
 * FARI Stat — headline KPI number with label and optional delta.
 * Used across research dashboards and impact pages.
 */
function Stat({
  value,
  label,
  delta,
  deltaDirection = "up",
  style = {}
}) {
  const positive = deltaDirection === "up";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 4,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 36,
      fontWeight: 800,
      lineHeight: 1,
      letterSpacing: "-0.02em",
      color: "var(--fari-blue)"
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      color: "var(--text-muted)"
    }
  }, label), delta != null && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      fontWeight: 700,
      color: positive ? "var(--status-ok)" : "var(--status-error)"
    }
  }, positive ? "▲" : "▼", " ", delta)));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Stat.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Tag.jsx
try { (() => {
/**
 * FARI Tag — category chip, optionally removable. Outlined by default
 * to distinguish from the tonal Badge.
 */
function Tag({
  children,
  onRemove,
  color = "blue",
  style = {}
}) {
  const colors = {
    blue: "var(--fari-web-blue)",
    teal: "var(--teal-800)",
    purple: "var(--fari-purple)",
    neutral: "var(--ink-600)"
  };
  const c = colors[color] || colors.blue;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      height: 26,
      padding: onRemove ? "0 6px 0 11px" : "0 11px",
      borderRadius: "var(--radius-pill)",
      border: `1.5px solid color-mix(in srgb, ${c} 35%, white)`,
      background: "var(--surface-card)",
      color: c,
      fontFamily: "var(--font-sans)",
      fontSize: 12.5,
      fontWeight: 600,
      ...style
    }
  }, children, onRemove && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Remove",
    onClick: onRemove,
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: 16,
      height: 16,
      border: "none",
      borderRadius: "50%",
      background: "transparent",
      color: c,
      cursor: "pointer",
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.6",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
/**
 * FARI Alert — inline message banner for info, success, warning, error.
 * Tonal background with a leading icon; optional title and dismiss.
 */
function Alert({
  children,
  title,
  variant = "info",
  onDismiss,
  style = {}
}) {
  const variants = {
    info: {
      bg: "var(--blue-50)",
      bar: "var(--fari-web-blue)",
      fg: "var(--fari-blue)",
      icon: "M12 16v-4M12 8h.01",
      ring: "M12 2a10 10 0 100 20 10 10 0 000-20z"
    },
    success: {
      bg: "color-mix(in srgb, var(--status-ok) 10%, white)",
      bar: "var(--status-ok)",
      fg: "#0F7A63",
      icon: "M8 12l3 3 5-6",
      ring: "M12 2a10 10 0 100 20 10 10 0 000-20z"
    },
    warning: {
      bg: "color-mix(in srgb, #E8A13C 14%, white)",
      bar: "#C77C1E",
      fg: "#9A6111",
      icon: "M12 9v4M12 17h.01",
      ring: "M10.3 3.9l-8 14A2 2 0 004 21h16a2 2 0 001.7-3l-8-14a2 2 0 00-3.4 0z"
    },
    error: {
      bg: "color-mix(in srgb, var(--status-error) 9%, white)",
      bar: "var(--status-error)",
      fg: "var(--status-error)",
      icon: "M12 8v5M12 16h.01",
      ring: "M12 2a10 10 0 100 20 10 10 0 000-20z"
    }
  };
  const v = variants[variant] || variants.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      display: "flex",
      gap: 12,
      padding: "14px 16px",
      background: v.bg,
      borderRadius: "var(--radius-md)",
      borderLeft: `4px solid ${v.bar}`,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "20",
    height: "20",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: v.bar,
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flex: "none",
      marginTop: 1
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: v.ring
  }), /*#__PURE__*/React.createElement("path", {
    d: v.icon
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      fontWeight: 700,
      color: v.fg,
      marginBottom: 2
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13.5,
      color: "var(--text-body)",
      lineHeight: 1.45
    }
  }, children)), onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Dismiss",
    onClick: onDismiss,
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-subtle)",
      padding: 2,
      height: "fit-content"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/**
 * FARI Checkbox — square check control with Web Blue fill when selected.
 */
function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled = false,
  id,
  onChange,
  style = {}
}) {
  const reactId = React.useId();
  const cbId = id || reactId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  const toggle = e => {
    if (disabled) return;
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: cbId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: cbId,
    type: "checkbox",
    checked: on,
    onChange: toggle,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 20,
      height: 20,
      flex: "none",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-xs)",
      border: `1.5px solid ${on ? "var(--action-primary)" : "var(--border-strong)"}`,
      background: on ? "var(--action-primary)" : "var(--surface-card)",
      transition: "background var(--duration-fast), border-color var(--duration-fast)"
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "13",
    height: "13",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "#fff",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6L9 17l-5-5"
  }))), label);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FARI Input — single-line text field with optional label, hint, and
 * leading/trailing adornments. Focus ring uses the Web Blue token.
 */
function Input({
  label,
  hint,
  error,
  type = "text",
  placeholder,
  value,
  defaultValue,
  disabled = false,
  iconLeft = null,
  id,
  onChange,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId();
  const inputId = id || reactId;
  const borderColor = error ? "var(--status-error)" : focus ? "var(--border-focus)" : "var(--border-default)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-body)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 42,
      padding: "0 14px",
      background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      border: `1.5px solid ${borderColor}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focus ? "var(--shadow-focus)" : "none",
      transition: "border-color var(--duration-fast), box-shadow var(--duration-fast)"
    }
  }, iconLeft && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      color: "var(--text-subtle)"
    }
  }, iconLeft), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    placeholder: placeholder,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-strong)",
      minWidth: 0
    }
  }, rest))), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      color: error ? "var(--status-error)" : "var(--text-subtle)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * FARI Select — styled native dropdown with the same field shell as Input.
 */
function Select({
  label,
  hint,
  options = [],
  value,
  defaultValue,
  disabled = false,
  id,
  onChange,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const reactId = React.useId();
  const selId = id || reactId;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selId,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-body)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center",
      height: 42,
      background: disabled ? "var(--surface-sunken)" : "var(--surface-card)",
      border: `1.5px solid ${focus ? "var(--border-focus)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focus ? "var(--shadow-focus)" : "none"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: "none",
      WebkitAppearance: "none",
      flex: 1,
      border: "none",
      outline: "none",
      background: "transparent",
      padding: "0 38px 0 14px",
      height: "100%",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-strong)",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, rest), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lab = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  })), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-subtle)",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      position: "absolute",
      right: 12,
      pointerEvents: "none"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  }))), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      color: "var(--text-subtle)"
    }
  }, hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/**
 * FARI Switch — pill toggle. Uses Web Blue when on.
 */
function Switch({
  label,
  checked,
  defaultChecked,
  disabled = false,
  id,
  onChange,
  style = {}
}) {
  const reactId = React.useId();
  const swId = id || reactId;
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  const toggle = e => {
    if (disabled) return;
    if (!isControlled) setInternal(e.target.checked);
    onChange && onChange(e);
  };
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: swId,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: swId,
    type: "checkbox",
    checked: on,
    onChange: toggle,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 40,
      height: 22,
      flex: "none",
      borderRadius: "var(--radius-pill)",
      background: on ? "var(--action-primary)" : "var(--ink-300)",
      position: "relative",
      transition: "background var(--duration-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: on ? 20 : 2,
      width: 18,
      height: 18,
      borderRadius: "var(--radius-pill)",
      background: "#fff",
      boxShadow: "var(--shadow-sm)",
      transition: "left var(--duration-base) var(--ease-standard)"
    }
  })), label);
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * FARI Tabs — underline tab bar. Controlled via `value`/`onChange` or
 * uncontrolled via `defaultValue`. Active tab uses Web Blue underline.
 */
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  style = {}
}) {
  const isControlled = value !== undefined;
  const first = tabs[0] && (typeof tabs[0] === "string" ? tabs[0] : tabs[0].value);
  const [internal, setInternal] = React.useState(defaultValue ?? first);
  const active = isControlled ? value : internal;
  const select = val => {
    if (!isControlled) setInternal(val);
    onChange && onChange(val);
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: "flex",
      gap: 4,
      borderBottom: "1.5px solid var(--border-subtle)",
      ...style
    }
  }, tabs.map(t => {
    const val = typeof t === "string" ? t : t.value;
    const lab = typeof t === "string" ? t : t.label;
    const on = val === active;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      role: "tab",
      "aria-selected": on,
      onClick: () => select(val),
      style: {
        position: "relative",
        border: "none",
        background: "transparent",
        padding: "10px 14px",
        marginBottom: -1.5,
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: on ? 700 : 500,
        color: on ? "var(--fari-blue)" : "var(--text-muted)",
        cursor: "pointer",
        borderBottom: `2.5px solid ${on ? "var(--fari-web-blue)" : "transparent"}`,
        transition: "color var(--duration-fast)"
      }
    }, lab);
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
// FARI website — footer with partner lockups
(() => {
  function Footer({
    onNavigate
  }) {
    const cols = [["Institute", ["About", "Research groups", "Team", "Careers"]], ["Work", ["Projects", "Publications", "AI Academy", "Services"]], ["Connect", ["Contact", "Newsletter", "Press", "Events"]]];
    return /*#__PURE__*/React.createElement("footer", {
      style: {
        background: "var(--blue-900)",
        color: "var(--fari-white)",
        padding: "56px 40px 28px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
        gap: 40,
        maxWidth: 1280,
        margin: "0 auto"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logos/fari-logo-white.png",
      alt: "FARI",
      style: {
        height: 36,
        marginBottom: 16
      }
    }), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        lineHeight: 1.6,
        color: "color-mix(in srgb, var(--fari-white) 78%, transparent)",
        maxWidth: 280,
        margin: 0
      }
    }, "An independent research institute on AI, data and robotics for the common good \u2014 jointly initiated by VUB & ULB, Brussels.")), cols.map(([title, items]) => /*#__PURE__*/React.createElement("div", {
      key: title
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--fari-lighthouse)",
        marginBottom: 14
      }
    }, title), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 9
      }
    }, items.map(it => /*#__PURE__*/React.createElement("a", {
      key: it,
      href: "#",
      onClick: e => e.preventDefault(),
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: "color-mix(in srgb, var(--fari-white) 82%, transparent)",
        textDecoration: "none"
      }
    }, it)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "36px auto 0",
        paddingTop: 22,
        borderTop: "1px solid color-mix(in srgb, var(--fari-white) 16%, transparent)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 18,
        alignItems: "center",
        fontFamily: "var(--font-sans)",
        fontSize: 12.5,
        color: "color-mix(in srgb, var(--fari-white) 64%, transparent)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 FARI. All rights reserved."), /*#__PURE__*/React.createElement("span", {
      style: {
        opacity: 0.5
      }
    }, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Funded by the ERDF and the Brussels Capital-Region")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 8
      }
    }, ["linkedin", "youtube", "rss"].map(ic => /*#__PURE__*/React.createElement("span", {
      key: ic,
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: "50%",
        border: "1px solid color-mix(in srgb, var(--fari-white) 24%, transparent)",
        color: "var(--fari-white)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": ic,
      style: {
        width: 16,
        height: 16
      }
    }))))));
  }
  window.FARIWeb = window.FARIWeb || {};
  window.FARIWeb.Footer = Footer;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Header.jsx
try { (() => {
// FARI website — top navigation header
(() => {
  const {
    IconButton,
    Button
  } = window.FARIDesignSystem_7ac0c4;
  function Header({
    route,
    onNavigate
  }) {
    const nav = [["research", "Research"], ["projects", "Projects"], ["academy", "Academy"], ["about", "About"]];
    return /*#__PURE__*/React.createElement("header", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 20,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 40px",
        height: 72,
        background: "color-mix(in srgb, var(--fari-white) 86%, transparent)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onNavigate("home");
      },
      style: {
        display: "flex",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logos/fari-logo-color.png",
      alt: "FARI",
      style: {
        height: 34
      }
    })), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        gap: 4,
        marginLeft: 12
      }
    }, nav.map(([key, label]) => {
      const active = route === key;
      return /*#__PURE__*/React.createElement("a", {
        key: key,
        href: "#",
        onClick: e => {
          e.preventDefault();
          onNavigate(key);
        },
        style: {
          padding: "8px 14px",
          borderRadius: "var(--radius-pill)",
          fontFamily: "var(--font-sans)",
          fontSize: 14.5,
          fontWeight: active ? 700 : 500,
          color: active ? "var(--fari-blue)" : "var(--text-muted)",
          background: active ? "var(--blue-50)" : "transparent",
          textDecoration: "none",
          transition: "background var(--duration-fast), color var(--duration-fast)"
        }
      }, label);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(IconButton, {
      ariaLabel: "Search",
      variant: "ghost"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "search",
      style: {
        width: 20,
        height: 20
      }
    })), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "sm",
      onClick: () => onNavigate("about")
    }, "Get involved")));
  }
  window.FARIWeb = window.FARIWeb || {};
  window.FARIWeb.Header = Header;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomeScreen.jsx
try { (() => {
// FARI website — Home / landing screen
(() => {
  const {
    Button,
    Card,
    Badge,
    Stat,
    Tag
  } = window.FARIDesignSystem_7ac0c4;
  function Eyebrow({
    children,
    light
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: light ? "var(--fari-lighthouse)" : "var(--fari-web-blue)"
      }
    }, children);
  }
  function Hero({
    onNavigate
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        position: "relative",
        overflow: "hidden",
        background: "var(--surface-page)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.05fr 0.95fr",
        gap: 56,
        alignItems: "center",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "72px 40px 80px"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "AI for the Common Good"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 52,
        fontWeight: 800,
        lineHeight: 1.05,
        letterSpacing: "-0.025em",
        color: "var(--fari-blue)",
        margin: "18px 0 0",
        textWrap: "balance"
      }
    }, "We put the Common Good at the heart of AI, data & robotics research"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 19,
        lineHeight: 1.55,
        color: "var(--text-muted)",
        maxWidth: 520,
        margin: "22px 0 0"
      }
    }, "An independent institute in Brussels, jointly initiated by VUB & ULB \u2014 building bridges between technology, public administrations, industry and citizens."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12,
        marginTop: 32
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg",
      onClick: () => onNavigate("projects"),
      iconRight: /*#__PURE__*/React.createElement(Arrow, null)
    }, "Explore our research"), /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "lg",
      onClick: () => onNavigate("about")
    }, "About FARI"))), /*#__PURE__*/React.createElement(HeroPanel, null)));
  }
  function Arrow() {
    return /*#__PURE__*/React.createElement("svg", {
      width: "18",
      height: "18",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.4",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M5 12h14M13 6l6 6-6 6"
    }));
  }
  function HeroPanel() {
    // Branded gradient panel echoing the logo's "i" person motif.
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        aspectRatio: "4/3.4",
        borderRadius: "var(--radius-2xl)",
        background: "var(--gradient-1)",
        overflow: "hidden",
        boxShadow: "var(--shadow-xl)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "var(--gradient-3)",
        opacity: 0.32,
        mixBlendMode: "screen"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 36,
        bottom: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: "var(--fari-lighthouse)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        width: 56,
        height: 150,
        borderRadius: 28,
        background: "color-mix(in srgb, var(--fari-white) 90%, transparent)"
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        right: 28,
        top: 28,
        padding: "14px 16px",
        borderRadius: "var(--radius-lg)",
        background: "color-mix(in srgb, var(--fari-white) 92%, transparent)",
        backdropFilter: "blur(4px)",
        boxShadow: "var(--shadow-md)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 600,
        color: "var(--text-muted)"
      }
    }, "Brussels \xB7 since 2022"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 26,
        fontWeight: 800,
        color: "var(--fari-blue)",
        lineHeight: 1.1,
        marginTop: 2
      }
    }, "Responsible AI")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 18,
        bottom: 18,
        fontFamily: "var(--font-demo)",
        fontSize: 11,
        color: "color-mix(in srgb, var(--fari-white) 80%, transparent)"
      }
    }, "Image placeholder \xB7 documentary photography"));
  }
  function StatsBand() {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        background: "var(--surface-subtle)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 24,
        maxWidth: 1280,
        margin: "0 auto",
        padding: "34px 40px"
      }
    }, window.FARIWeb.stats.map(s => /*#__PURE__*/React.createElement(Stat, {
      key: s.label,
      value: s.value,
      label: s.label
    }))));
  }
  function Domains({
    onNavigate
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        padding: "76px 40px 20px"
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Priority domains"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 34,
        fontWeight: 800,
        color: "var(--fari-blue)",
        letterSpacing: "-0.02em",
        margin: "12px 0 8px"
      }
    }, "Where we focus"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 16,
        color: "var(--text-muted)",
        maxWidth: 560,
        margin: 0
      }
    }, "Urban and public-interest challenges where AI, data and robotics can serve society."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 20,
        marginTop: 36
      }
    }, window.FARIWeb.domains.map(d => /*#__PURE__*/React.createElement(Card, {
      key: d.key,
      interactive: true,
      padding: 22,
      onClick: () => onNavigate("projects")
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 46,
        height: 46,
        borderRadius: "var(--radius-md)",
        background: "var(--blue-50)",
        color: "var(--fari-web-blue)",
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": d.icon,
      style: {
        width: 22,
        height: 22
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 18,
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, d.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--text-muted)",
        margin: "8px 0 16px"
      }
    }, d.blurb), /*#__PURE__*/React.createElement(Badge, {
      variant: "teal"
    }, d.count, " projects")))));
  }
  function FeaturedProjects({
    onNavigate
  }) {
    const featured = window.FARIWeb.projects.slice(0, 3);
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        padding: "64px 40px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 32
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Featured"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 34,
        fontWeight: 800,
        color: "var(--fari-blue)",
        letterSpacing: "-0.02em",
        margin: "12px 0 0"
      }
    }, "Projects in motion")), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => onNavigate("projects"),
      iconRight: /*#__PURE__*/React.createElement(Arrow, null)
    }, "View all projects")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 22
      }
    }, featured.map(p => /*#__PURE__*/React.createElement(Card, {
      key: p.title,
      interactive: true,
      padding: 0,
      onClick: () => onNavigate("project")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 132,
        background: "var(--gradient-4)",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 14,
        left: 14
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: "blue",
      dot: true
    }, p.status))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      color: "teal"
    }, p.domain), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 19,
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: "14px 0 8px"
      }
    }, p.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--text-muted)",
        margin: 0
      }
    }, p.blurb))))));
  }
  function Partners() {
    const partners = ["VUB", "ULB", "ERDF", "Brussels-Capital Region"];
    return /*#__PURE__*/React.createElement("section", {
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        padding: "0 40px 64px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 14,
        justifyContent: "center",
        flexWrap: "wrap",
        padding: "30px 0",
        borderTop: "1px solid var(--border-subtle)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-subtle)",
        marginRight: 8
      }
    }, "In partnership with"), partners.map(p => /*#__PURE__*/React.createElement("span", {
      key: p,
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 17,
        fontWeight: 800,
        letterSpacing: "0.02em",
        color: "var(--ink-400)",
        padding: "6px 16px",
        border: "1.5px solid var(--border-default)",
        borderRadius: "var(--radius-sm)"
      }
    }, p))));
  }
  function CTA({
    onNavigate
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        padding: "0 40px 80px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        overflow: "hidden",
        maxWidth: 1280,
        margin: "0 auto",
        borderRadius: "var(--radius-2xl)",
        background: "var(--fari-blue)",
        padding: "56px 56px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        right: -60,
        top: -60,
        width: 320,
        height: 320,
        borderRadius: "50%",
        background: "var(--gradient-1)",
        opacity: 0.5
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        maxWidth: 560
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, {
      light: true
    }, "Get involved"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 36,
        fontWeight: 800,
        color: "var(--fari-white)",
        letterSpacing: "-0.02em",
        margin: "14px 0 12px",
        textWrap: "balance"
      }
    }, "Build responsible AI with us"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 17,
        lineHeight: 1.55,
        color: "color-mix(in srgb, var(--fari-white) 84%, transparent)",
        margin: "0 0 28px"
      }
    }, "Whether you're a public body, a company or a researcher \u2014 partner with FARI to put AI to work for the common good."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "lg",
      onClick: () => onNavigate("about")
    }, "Start a conversation"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "lg",
      style: {
        color: "var(--fari-white)"
      },
      onClick: () => onNavigate("academy")
    }, "Visit the AI Academy")))));
  }
  function HomeScreen({
    onNavigate
  }) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
      onNavigate: onNavigate
    }), /*#__PURE__*/React.createElement(StatsBand, null), /*#__PURE__*/React.createElement(Domains, {
      onNavigate: onNavigate
    }), /*#__PURE__*/React.createElement(FeaturedProjects, {
      onNavigate: onNavigate
    }), /*#__PURE__*/React.createElement(Partners, null), /*#__PURE__*/React.createElement(CTA, {
      onNavigate: onNavigate
    }));
  }
  window.FARIWeb = window.FARIWeb || {};
  window.FARIWeb.HomeScreen = HomeScreen;
  window.FARIWeb.Eyebrow = Eyebrow;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ProjectScreen.jsx
try { (() => {
// FARI website — Project detail
(() => {
  const {
    Button,
    Card,
    Badge,
    Tag,
    Stat,
    Avatar,
    Alert
  } = window.FARIDesignSystem_7ac0c4;
  function ProjectScreen({
    onNavigate
  }) {
    const p = window.FARIWeb.projects[0]; // Citizen Mobility Twin
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "relative",
        height: 280,
        background: "var(--gradient-1)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: "var(--gradient-3)",
        opacity: 0.28,
        mixBlendMode: "screen"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: "absolute",
        left: 18,
        bottom: 14,
        fontFamily: "var(--font-demo)",
        fontSize: 11,
        color: "color-mix(in srgb, var(--fari-white) 78%, transparent)"
      }
    }, "Image placeholder \xB7 documentary photography")), /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1100,
        margin: "-72px auto 0",
        position: "relative",
        padding: "0 40px 80px"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: 40
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => onNavigate("projects"),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "none",
        background: "transparent",
        color: "var(--text-link)",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        padding: 0,
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "arrow-left",
      style: {
        width: 16,
        height: 16
      }
    }), " All projects"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 10,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      color: "teal"
    }, p.domain), /*#__PURE__*/React.createElement(Badge, {
      variant: "teal",
      dot: true
    }, p.status), /*#__PURE__*/React.createElement(Badge, {
      variant: "neutral"
    }, p.year)), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 40,
        fontWeight: 800,
        color: "var(--fari-blue)",
        letterSpacing: "-0.025em",
        margin: "0 0 14px",
        maxWidth: 720
      }
    }, p.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 20,
        lineHeight: 1.5,
        color: "var(--text-muted)",
        maxWidth: 720,
        margin: 0
      }
    }, p.blurb), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 48,
        marginTop: 40
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-demo)",
        fontSize: 16.5,
        lineHeight: 1.7,
        color: "var(--text-body)"
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "0 0 18px"
      }
    }, "The Citizen Mobility Twin pairs open transport data with participatory modelling, letting residents and city planners test interventions \u2014 a new bus lane, a school street, a congestion charge \u2014 in simulation before anything changes on the ground."), /*#__PURE__*/React.createElement("p", {
      style: {
        margin: "0 0 18px"
      }
    }, "Built with public administrations across the Brussels-Capital Region, the project pays particular attention to equity: who benefits, who is burdened, and how trade-offs are made transparent to the people affected.")), /*#__PURE__*/React.createElement(Alert, {
      variant: "info",
      title: "Open & reproducible",
      style: {
        marginTop: 8
      }
    }, "Methods, code and anonymised datasets are released under open licences for other cities to adopt."), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: 22,
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: "34px 0 18px"
      }
    }, "Impact so far"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: 44
      }
    }, /*#__PURE__*/React.createElement(Stat, {
      value: "3",
      label: "City partners"
    }), /*#__PURE__*/React.createElement(Stat, {
      value: "12k",
      label: "Citizen inputs",
      delta: "22%"
    }), /*#__PURE__*/React.createElement(Stat, {
      value: "\u221218%",
      label: "Modelled congestion"
    }))), /*#__PURE__*/React.createElement("aside", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 24
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-subtle)",
        marginBottom: 12
      }
    }, "Project lead"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: p.lead,
      size: 44
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 15,
        fontWeight: 700,
        color: "var(--text-strong)"
      }
    }, p.lead), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--text-subtle)"
      }
    }, "Mobility & AI group")))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-subtle)",
        marginBottom: 12
      }
    }, "Partners"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: 8
      }
    }, ["Brussels Mobility", "VUB", "ULB", "STIB-MIVB"].map(x => /*#__PURE__*/React.createElement("span", {
      key: x,
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        color: "var(--ink-500)",
        padding: "5px 11px",
        border: "1.5px solid var(--border-default)",
        borderRadius: "var(--radius-sm)"
      }
    }, x)))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--text-subtle)",
        marginBottom: 12
      }
    }, "Funding"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13.5,
        lineHeight: 1.5,
        color: "var(--text-muted)",
        margin: 0
      }
    }, "Funded by the ERDF and the Brussels Capital-Region.")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      fullWidth: true,
      iconRight: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "download",
        style: {
          width: 16,
          height: 16
        }
      })
    }, "Download brief"))))));
  }
  window.FARIWeb = window.FARIWeb || {};
  window.FARIWeb.ProjectScreen = ProjectScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ProjectScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ProjectsScreen.jsx
try { (() => {
// FARI website — Projects / Research listing with filters
(() => {
  const {
    Card,
    Badge,
    Tag,
    Tabs,
    Input,
    Button
  } = window.FARIDesignSystem_7ac0c4;
  function ProjectsScreen({
    onNavigate
  }) {
    const all = window.FARIWeb.projects;
    const [domain, setDomain] = React.useState("All");
    const [q, setQ] = React.useState("");
    const tabs = ["All", "Health", "Mobility", "Climate & Energy", "Inclusive Society"];
    const filtered = all.filter(p => {
      const matchDomain = domain === "All" || p.domain === domain || domain === "Inclusive Society" && p.domain === "Inclusive Society";
      const matchQ = !q || (p.title + p.blurb + p.lead).toLowerCase().includes(q.toLowerCase());
      return matchDomain && matchQ;
    });
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 1280,
        margin: "0 auto",
        padding: "56px 40px 80px"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--fari-web-blue)"
      }
    }, "Research"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 44,
        fontWeight: 800,
        color: "var(--fari-blue)",
        letterSpacing: "-0.025em",
        margin: "14px 0 10px"
      }
    }, "Projects"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 17,
        color: "var(--text-muted)",
        maxWidth: 580,
        margin: 0
      }
    }, "Applied research turning AI, data and robotics into public value across Brussels and beyond."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        margin: "34px 0 0",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: "1 1 auto",
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement(Tabs, {
      tabs: tabs,
      value: domain,
      onChange: setDomain
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 260
      }
    }, /*#__PURE__*/React.createElement(Input, {
      placeholder: "Search projects\u2026",
      value: q,
      onChange: e => setQ(e.target.value),
      iconLeft: /*#__PURE__*/React.createElement("i", {
        "data-lucide": "search",
        style: {
          width: 18,
          height: 18
        }
      })
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--text-subtle)",
        margin: "20px 0 16px"
      }
    }, filtered.length, " project", filtered.length === 1 ? "" : "s"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 22
      }
    }, filtered.map(p => /*#__PURE__*/React.createElement(Card, {
      key: p.title,
      interactive: true,
      padding: 0,
      onClick: () => onNavigate("project")
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 120,
        background: p.domain === "Health" ? "var(--gradient-2)" : p.domain === "Mobility" ? "var(--gradient-4)" : p.domain === "Climate & Energy" ? "var(--gradient-1)" : "var(--gradient-accent-1)",
        position: "relative"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 14,
        left: 14
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      variant: p.status === "Active" ? "teal" : "purple",
      dot: true
    }, p.status)), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 14,
        right: 14,
        fontFamily: "var(--font-sans)",
        fontSize: 12,
        fontWeight: 700,
        color: "color-mix(in srgb, var(--fari-white) 88%, transparent)"
      }
    }, p.year)), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 22
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      color: "blue"
    }, p.domain), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 18.5,
        fontWeight: 700,
        color: "var(--text-strong)",
        margin: "14px 0 8px"
      }
    }, p.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        lineHeight: 1.5,
        color: "var(--text-muted)",
        margin: "0 0 16px"
      }
    }, p.blurb), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: "var(--font-sans)",
        fontSize: 13,
        color: "var(--text-subtle)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "user",
      style: {
        width: 15,
        height: 15
      }
    }), " ", p.lead))))), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: "center",
        padding: "60px 0",
        color: "var(--text-subtle)",
        fontFamily: "var(--font-sans)"
      }
    }, "No projects match your search."));
  }
  window.FARIWeb = window.FARIWeb || {};
  window.FARIWeb.ProjectsScreen = ProjectsScreen;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ProjectsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/data.jsx
try { (() => {
// FARI website — shared demo content
window.FARIWeb = window.FARIWeb || {};
window.FARIWeb.domains = [{
  key: "health",
  name: "Health",
  icon: "heart-pulse",
  blurb: "AI for diagnostics, public health and care that reaches everyone.",
  count: 12
}, {
  key: "mobility",
  name: "Mobility",
  icon: "route",
  blurb: "Reducing congestion and emissions across the Brussels region.",
  count: 9
}, {
  key: "climate",
  name: "Climate & Energy",
  icon: "leaf",
  blurb: "Modelling energy demand and accelerating a just transition.",
  count: 14
}, {
  key: "society",
  name: "Inclusive Society",
  icon: "users",
  blurb: "Participatory, human-centred tools for public administrations.",
  count: 13
}];
window.FARIWeb.projects = [{
  title: "Citizen Mobility Twin",
  domain: "Mobility",
  status: "Active",
  year: 2026,
  lead: "Amélie Laurent",
  blurb: "A participatory digital twin that simulates traffic interventions before they reach the street."
}, {
  title: "Fair Triage",
  domain: "Health",
  status: "Active",
  year: 2025,
  lead: "Jonas Peeters",
  blurb: "Auditing clinical decision-support models for bias across Brussels hospitals."
}, {
  title: "GridSense",
  domain: "Climate & Energy",
  status: "Active",
  year: 2026,
  lead: "Sofia Khan",
  blurb: "Forecasting neighbourhood energy demand to balance renewable supply."
}, {
  title: "Open Council",
  domain: "Inclusive Society",
  status: "Pilot",
  year: 2025,
  lead: "Marc De Wit",
  blurb: "Plain-language AI assistants that make municipal decisions legible to citizens."
}, {
  title: "AirWatch BXL",
  domain: "Climate & Energy",
  status: "Active",
  year: 2025,
  lead: "Lena Vos",
  blurb: "Low-cost sensor networks mapping air quality at street resolution."
}, {
  title: "CareBridge",
  domain: "Health",
  status: "Pilot",
  year: 2026,
  lead: "Yara Haddad",
  blurb: "Connecting elderly residents to services through conversational interfaces."
}];
window.FARIWeb.stats = [{
  value: "10",
  label: "Research groups"
}, {
  value: "2",
  label: "Universities · VUB & ULB"
}, {
  value: "48",
  label: "Active projects"
}, {
  value: "4",
  label: "Priority domains"
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Stat = __ds_scope.Stat;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
