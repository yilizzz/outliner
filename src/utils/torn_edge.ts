export const generateTornEdge = (topPoints = 20, bottomPoints = 15) => {
  const top = [];
  const bottom = [];

  // 生成顶部撕裂边缘
  for (let i = 0; i <= topPoints; i++) {
    const x = (i / topPoints) * 100;
    const y = Math.random() * 15 + 0.5;
    top.push(`${x.toFixed(2)}% ${y.toFixed(2)}px`);
  }

  // 右边直线
  top.push("100% 100%");

  // 生成底部撕裂边缘（从右到左）
  for (let i = bottomPoints; i >= 0; i--) {
    const x = (i / bottomPoints) * 100;
    const y = `calc(100% - ${Math.random() * 15}px)`;
    bottom.push(`${x.toFixed(2)}% ${y}`);
  }

  // 左边直线（回到起点）
  bottom.push("0% 0%");
  return `polygon(${[...top, ...bottom].join(", ")})`;
};
