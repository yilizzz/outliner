import { useState, useRef, useEffect } from "react";
import { useInfiniteFetchNews } from "../queries/news.queries";
import { useLanguage } from "../contexts/language_context";
import { useDebounce } from "use-debounce";
import ScrollToTopButton from "../components/ui/scroll_to_top_button";
import {
  Search,
  Delete,
  Bean,
  Haze,
  Sprout,
  Squirrel,
  Eye,
  LoaderPinwheel,
} from "lucide-react";
import { getRandomColors, lightColors } from "../utils/color_utils";
import { generateTornEdge } from "../utils/torn_edge";
import Input from "../components/ui/input";
const Dashboard = () => {
  const { t, currentLang } = useLanguage();
  const limit = 6;
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch] = useDebounce(searchKeyword, 1200);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteFetchNews(limit, currentLang, selectedCategory, debouncedSearch);

  const newsItems = data?.pages?.flatMap((page: any) => page.data);

  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const touchStartY = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const categories = ["biotech", "physics", "climate", "space", "computer"];
  const bgColor = getRandomColors(lightColors, 1)[0];
  const edgeClipPath = generateTornEdge();
  const inspirationIcons = [<Bean />, <Haze />, <Squirrel />, <Sprout />];
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
    // if (distance > 0) {
    //   e.preventDefault();
    // }
  };

  const handleTouchEnd = async () => {
    setIsPulling(false);

    // 如果上拉距离超过 20px，触发加载下一页
    if (pullDistance > 20 && hasNextPage) {
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

  if (isLoading && newsItems?.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderPinwheel className="animate-spin text-dark-blue" size={48} />
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="relative min-h-screen pt-12 pb-16 px-4 overflow-y-auto"
      style={{ touchAction: "pan-y" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
            className={`px-3 py-1 rounded-lg font-medium transition-colors flex items-center justify-center ${
              selectedCategory.includes(category)
                ? "bg-dark-blue text-white"
                : "bg-gray-200 text-dark-blue"
            }`}
          >
            {category}
          </button>
        ))}
        <div className="relative flex items-center justify-center gap-2">
          <span className="absolute h-full left-2 top-['50%'] transform-['translateY(-50%)'] flex items-center justify-center text-dark-green opacity-50">
            {searchKeyword ? null : <Search size={24} />}
          </span>
          <Input
            name="search"
            type="text"
            placeholder=""
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="text-dark-blue"
            >
              <Delete size={24} />
            </button>
          )}
        </div>
      </div>

      {/* 两列卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl mx-auto">
        {newsItems?.map((item, index) => (
          <div className="relative" key={item.url}>
            <div
              className="absolute inset-0 bg-gray-300 opacity-40"
              style={{
                clipPath: edgeClipPath,
                transform: "translateY(4px) rotate(2deg)",
                WebkitTransform: "translateY(4px) rotate(2deg)",
              }}
            />
            <div
              className="rounded-lg shadow-md hover:shadow-lg overflow-hidden flex flex-col transition-all duration-1000 "
              style={{
                backgroundColor: bgColor,
                backgroundImage: 'url("notebook-dark.png")',
                clipPath: edgeClipPath,
              }}
            >
              {/* 卡片内容容器 */}
              <div className="px-4 py-6 flex flex-col h-full">
                {/* 标题 */}
                <h3 className="text-lg font-bold text-dark-blue mb-2">
                  {item.title}
                </h3>

                {/* 分类和发布时间 */}
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-500">
                  {item.category && (
                    <span className="px-2 py-1 bg-dark-blue text-white rounded-lg">
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
                <p className="text-gray-600 text-sm mb-3">{item.summary}</p>

                {/* 灵感/亮点 */}
                {item.inspiration && (
                  <div className="mb-3 p-2 bg-light-gray border-l-4 border-dark-red">
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      {inspirationIcons[index % 4]}
                    </p>
                    <p className="text-sm text-dark-blue">{item.inspiration}</p>
                  </div>
                )}

                {/* URL 链接 */}
                {item.url && (
                  <div className="flex justify-end">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-dark-green text-sm font-semibold mt-auto"
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
        ))}
      </div>

      {/* 加载更多按钮 */}
      <div className="flex justify-center gap-4 mt-8 mb-8">
        <button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
          className="px-4 py-2 bg-dark-blue text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isFetchingNextPage ? (
            <LoaderPinwheel />
          ) : hasNextPage ? (
            "More"
          ) : (
            t("no_more")
          )}
        </button>
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default Dashboard;
