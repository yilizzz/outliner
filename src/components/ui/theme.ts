// 这里的字符串是完整的，Tailwind 扫描器可以识别并生成 CSS
export const colorTheme = {
  blue: {
    text: "text-dark-blue",
    border: "border-dark-blue",
    ring: "focus:ring-light-blue",
    caret: "caret-dark-blue",
    label: "text-dark-blue",
  },
  red: {
    text: "text-dark-red",
    border: "border-dark-red",
    ring: "focus:ring-light-red",
    caret: "caret-dark-red",
    label: "text-dark-red",
  },
  green: {
    text: "text-dark-green",
    border: "border-dark-green",
    ring: "focus:ring-light-green",
    caret: "caret-dark-green",
    label: "text-dark-green",
  },
};
// 定义支持的颜色类型
export type Color = "blue" | "red" | "green";
