import React, { useMemo } from "react";
import { Bean, Eye } from "lucide-react";
interface NewsItemData {
  url: any;
  title: any;
  summary: any;
  inspiration: any;
  category: any;
  published_at: any;
}

interface ItemStyles {
  backgroundColor: string;
  clipPath: string;
}

interface NewsItemProps {
  item: NewsItemData;
  itemStyles: ItemStyles;
}
export const NewsItem = React.memo(({ item, itemStyles }: NewsItemProps) => {
  const formattedDate = useMemo(() => {
    return new Date(item.published_at).toLocaleDateString("zh-CN");
  }, [item.published_at]);
  return (
    <div className="relative" key={item.url}>
      <div
        className="absolute inset-0 bg-gray-300 opacity-40"
        style={{
          clipPath: itemStyles.clipPath,
          transform: "translateY(4px) rotate(2deg)",
          WebkitTransform: "translateY(4px) rotate(2deg)",
        }}
      />
      <div
        className="rounded-lg shadow-md hover:shadow-lg overflow-hidden flex flex-col transition-all duration-1000 "
        style={{
          backgroundColor: itemStyles.backgroundColor,
          backgroundImage: 'url("notebook-dark.png")',
          clipPath: itemStyles.clipPath,
        }}
      >
        {/* 卡片内容容器 */}
        <div className="px-4 py-6 flex flex-col h-full">
          {/* 标题 */}
          <h3 className="text-base font-semibold text-dark-blue mb-2">
            {item.title}
          </h3>
          {/* 分类和发布时间 */}
          <div className="flex items-center gap-3 mb-3 text-sm font-light text-gray-500">
            {item.category && (
              <span className="px-3 py-1 bg-dark-blue text-white rounded-lg">
                {item.category}
              </span>
            )}
            {item.published_at && <span>{formattedDate}</span>}
          </div>

          {/* 摘要 */}
          <p className="text-gray-600 text-sm font-light mb-3">
            {item.summary}
          </p>

          {/* 灵感/亮点 */}
          {item.inspiration && (
            <div className="mb-3 p-2 bg-light-gray border-l-4 border-dark-red">
              <p className="text-xs font-semibold text-dark-red mb-1">
                <Bean size={20} />
              </p>
              <p className="text-sm font-light text-dark-blue">
                {item.inspiration}
              </p>
            </div>
          )}

          {/* URL 链接 */}
          {item.url && (
            <div className="flex justify-end">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-green text-sm mt-auto"
              >
                <span className="flex">
                  <Eye size={24} />
                  <Eye size={24} />
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
