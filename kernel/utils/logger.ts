export const log = {
  info: (...a: any[]) => console.log("ℹ️", ...a),
  warn: (...a: any[]) => console.warn("⚠️", ...a),
  error: (...a: any[]) => console.error("❌", ...a),
};

