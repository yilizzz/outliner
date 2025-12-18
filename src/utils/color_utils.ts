export const darkColors = [
  "#2E4E7E", // 藏青
  "#5D513C", // 深紫
  "#057748", // 松花绿
  "#622A1D", // 红棕
];
export const lightColors = [
  "#E9E7EF", // 浅灰
  "#FFF143", // 浅粉
  "#E9F1F6", // 浅蓝
  "#E0EEE8", // 浅绿
];
export const getRandomColors = (
  collection: string[],
  num: number
): string[] => {
  const shuffled = [...collection].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, num);
};
