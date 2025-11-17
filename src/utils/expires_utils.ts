export const expiresAbsolute = (
  expires: any,
  baseTime = new Date()
): number => {
  if (typeof expires === "string") {
    // 尝试作为 ISO 日期字符串解析
    const parsed = new Date(expires);
    if (!isNaN(parsed.getTime())) {
      return parsed.getTime(); // 直接返回毫秒时间戳
    }
    // 尝试转换为数字
    expires = parseInt(expires, 10);
    if (isNaN(expires)) {
      throw new Error("Invalid expires format");
    }
  }

  // 如果不是数字，抛出错误
  if (typeof expires !== "number") {
    throw new Error("Expires must be a number or string");
  }

  // 判断 expires 的类型
  const now = baseTime.getTime();

  // 1. 如果是毫秒级时间戳 (10位以上,且值很大)
  // 判断标准: 大于 10000000000 (2286-11-20)
  if (expires > 10000000000) {
    return expires; // 已经是毫秒时间戳
  }

  // 2. 如果是秒级时间戳 (10位左右)
  // 判断标准: 大于 1000000000 (2001-09-09) 且小于等于 10000000000
  if (expires > 1000000000 && expires <= 10000000000) {
    return expires * 1000; // 转换为毫秒
  }

  // 3. 如果是相对时间 (秒数或毫秒数)
  // 判断标准: 小于 1000000000
  if (expires <= 1000000000) {
    // 小于 10000 认为是秒数
    if (expires < 10000) {
      return now + expires * 1000; // 秒数转毫秒后加到当前时间
    }
    // 大于等于 10000 认为是毫秒数
    else {
      return now + expires; // 毫秒数直接加到当前时间
    }
  }

  throw new Error("Unable to determine expires format");
};
