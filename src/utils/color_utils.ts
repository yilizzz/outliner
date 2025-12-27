export const darkColors = [
  "#2E4E7E", // 藏青
  "#760001", // 深红
  "#6E8B74", // 松花绿
];
export const lightColors = [
  "#E9E7EF", // 浅灰
  "#FEE3D5", // 浅粉
  "#ABC3F0", // 浅蓝
  "#E0EEE8", // 浅绿
];
export const getRandomColor = (collection: string[]): string => {
  if (collection.length === 0) {
    throw new Error("Color collection is empty");
  }
  const randomIndex = Math.floor(Math.random() * collection.length);
  return collection[randomIndex];
};
