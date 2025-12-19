import { useState, useRef, useEffect } from "react";
import { useInfiniteFetchNews } from "../queries/news.queries";
import { useLanguage } from "../contexts/language_context";
import { useDebounce } from "use-debounce";
import { TextSearch } from "lucide-react";
const News = () => {
  const { t, currentLang } = useLanguage();
  const limit = 6;
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch] = useDebounce(searchKeyword, 1200);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteFetchNews(limit, currentLang, selectedCategory, debouncedSearch);

  const newsItems = data?.pages?.flatMap((page: any) => page.data) || [];
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = ["biotech", "physics", "climate", "space", "computer"];

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;
    const atBottom =
      scrollElement.scrollTop + scrollElement.clientHeight >=
      scrollElement.scrollHeight - 2;
    if (atBottom && hasNextPage) {
      touchStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || refreshing) return;

    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;
    const touchCurrentY = e.touches[0].clientY;
    const distance = Math.max(0, touchStartY.current - touchCurrentY); // pull up

    // 阻尼效果：距离越大，拉动感越强
    const dampenedDistance = distance * 0.6;
    setPullDistance(dampenedDistance);

    // 防止默认滚动
    if (distance > 0) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    setIsPulling(false);

    // 如果上拉距离超过 60px，触发加载下一页
    if (pullDistance > 60 && hasNextPage) {
      setRefreshing(true);
      await fetchNextPage();
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
  }, [isPulling, pullDistance, refreshing, hasNextPage, fetchNextPage]);

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
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 内容区域 */}
      <div className="p-4">
        {/* Filter按钮组 */}
        <div className="mb-6 flex flex-wrap gap-2 max-w-6xl mx-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory((prev) =>
                  prev.includes(category)
                    ? prev.filter((c) => c !== category)
                    : [...prev, category]
                );
              }}
              className={`px-4 h-8 rounded-lg font-medium transition-colors flex items-center justify-center ${
                selectedCategory.includes(category)
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category}
            </button>
          ))}
          <div className="relative h-8">
            <span className="absolute h-full left-5 top-['50%'] transform-['translateY(-50%)'] flex items-center justify-center text-amber-700 opacity-25">
              {<TextSearch />}
            </span>
            <input
              autoFocus
              type="text"
              placeholder=""
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="h-8 border-amber-800 border rounded-sm"
            />
            {searchKeyword && (
              <button onClick={() => setSearchKeyword("")}>×</button>
            )}
          </div>
        </div>

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

        {/* 加载更多按钮 */}
        <div className="flex justify-center gap-4 mt-8 mb-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isFetchingNextPage
              ? "加载中..."
              : hasNextPage
              ? "加载更多"
              : "没有更多了"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default News;
