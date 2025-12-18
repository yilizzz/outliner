import { useState, useRef, useEffect } from "react";
import { useFetchNews } from "../queries/news.queries";
import { useLanguage } from "../contexts/language_context";
const News = () => {
  const { t, currentLang } = useLanguage();
  const [page, setPage] = useState(1);
  const {
    data: newsItems = [],
    isLoading,
    refetch,
  } = useFetchNews(page, 6, currentLang);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollElement = scrollContainerRef.current;
    if (scrollElement && scrollElement.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || refreshing) return;

    const scrollElement = scrollContainerRef.current;
    if (scrollElement && scrollElement.scrollTop === 0) {
      const touchCurrentY = e.touches[0].clientY;
      const distance = Math.max(0, touchCurrentY - touchStartY.current);

      // 阻尼效果：距离越大，拉动感越强
      const dampenedDistance = distance * 0.6;
      setPullDistance(dampenedDistance);

      // 防止默认滚动
      if (distance > 0) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    setIsPulling(false);

    // 如果拉动距离超过 60px，触发刷新
    if (pullDistance > 60) {
      setRefreshing(true);
      await refetch();
      setRefreshing(false);
    }

    // 动画回弹
    setPullDistance(0);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("touchstart", handleTouchStart as any, false);
    container.addEventListener("touchmove", handleTouchMove as any, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd as any, false);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart as any);
      container.removeEventListener("touchmove", handleTouchMove as any);
      container.removeEventListener("touchend", handleTouchEnd as any);
    };
  }, [isPulling, pullDistance, refreshing]);

  if (isLoading && newsItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-gray-600">加载新闻中...</p>
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="relative min-h-screen bg-gray-50 overflow-y-auto"
      style={{ touchAction: "pan-y" }}
    >
      {/* 下拉刷新头部 */}
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-300"
        style={{
          height: `${pullDistance}px`,
          opacity: Math.min(1, pullDistance / 60),
        }}
      >
        <div className="text-center">
          {pullDistance < 60 ? (
            <div>
              <div className="text-gray-500 text-sm">
                ↓ {pullDistance > 0 ? "下拉刷新" : ""}
              </div>
            </div>
          ) : (
            <div className="text-blue-500 text-sm font-semibold">松开刷新</div>
          )}
        </div>
      </div>

      {/* 刷新动画指示器 */}
      {refreshing && (
        <div className="sticky top-0 flex justify-center py-2 bg-white border-b border-gray-200 z-10">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-4">
        {/* 两列卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
          {newsItems.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
            >
              {/* 卡片内容容器 */}
              <div className="p-4 flex flex-col h-full">
                {/* 标题 */}
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                  {item.title}
                </h3>

                {/* 分类和发布时间 */}
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                  {item.category && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {item.category}
                    </span>
                  )}
                  {item.published_at && (
                    <span>
                      {new Date(item.published_at).toLocaleDateString("zh-CN")}
                    </span>
                  )}
                </div>

                {/* 摘要 */}
                <p className="text-gray-600 text-sm mb-3 flex-grow line-clamp-4">
                  {item.summary}
                </p>

                {/* 灵感/亮点 */}
                {item.inspiration && (
                  <div className="mb-3 p-2 bg-amber-50 border-l-4 border-amber-400">
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      💡 灵感
                    </p>
                    <p className="text-sm text-amber-800 line-clamp-2">
                      {item.inspiration}
                    </p>
                  </div>
                )}

                {/* URL 链接 */}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm font-semibold mt-auto break-all"
                  >
                    查看原文 →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 分页控制 */}
        <div className="flex justify-center gap-4 mt-8 mb-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            上一页
          </button>
          <span className="flex items-center px-4 text-gray-700 font-semibold">
            第 {page} 页
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={newsItems.length < 6}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
};

export default News;
