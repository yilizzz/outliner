export const generateTornEdge = (topPoints = 20, bottomPoints = 15) => {
  const top = [];
  const bottom = [];

  // 生成顶部撕裂边缘
  for (let i = 0; i <= topPoints; i++) {
    const x = (i / topPoints) * 100;
    const y = Math.random() * 4 + 0.5; // 0.5-4.5% 的随机高度
    top.push(`${x}% ${y}%`);
  }

  // 右边直线
  top.push("100% 100%");

  // 生成底部撕裂边缘（从右到左）
  for (let i = bottomPoints; i >= 0; i--) {
    const x = (i / bottomPoints) * 100;
    const y = 100 - (Math.random() * 4 + 0.5); // 95.5-99.5% 的随机高度
    bottom.push(`${x}% ${y}%`);
  }

  // 左边直线（回到起点）
  bottom.push("0% 0%");

  return `polygon(${[...top, ...bottom].join(", ")})`;
};
