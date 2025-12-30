import { useState, useRef, useEffect, useMemo } from "react";
import { useInfiniteFetchNews } from "../queries/news.queries";
import { useLanguage } from "../contexts/language_context";
import { useDebounce } from "use-debounce";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useInView } from "react-intersection-observer";
import ScrollToTopButton from "../components/ui/scroll_to_top_button";
import { Loader } from "../components/ui/loader";
import { Search, Delete, LoaderPinwheel } from "lucide-react";
import { getRandomColor, lightColors } from "../utils/color_utils";
import { generateTornEdge } from "../utils/torn_edge";
import Input from "../components/ui/input";
import { NewsItem } from "../components/news_item";
const Dashboard = () => {
  const { t, currentLang } = useLanguage();
  const limit = 6;
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedSearch] = useDebounce(searchKeyword, 1200);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteFetchNews(limit, currentLang, selectedCategory, debouncedSearch);
  const parentRef = useRef<HTMLDivElement>(null);
  const newsItems = data?.pages?.flatMap((page: any) => page.data) || [];
  const categories = ["biotech", "physics", "climate", "space", "computer"];
  const itemStyles = useMemo(
    () => ({
      backgroundColor: getRandomColor(lightColors),
      clipPath: generateTornEdge(),
    }),
    [getRandomColor, generateTornEdge]
  );
  // 2. 虚拟列表配置（单列动态高度版）
  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? newsItems.length + 1 : newsItems.length + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // 初始预估高度，稍后会被真实高度覆盖
    measureElement: (el) => el.getBoundingClientRect().height, // 关键：动态测量
    overscan: 5,
  });

  // 3. 无限滚动“哨兵”
  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div
      ref={parentRef}
      className="relative min-h-screen pt-12 pb-16 px-4 overflow-y-auto"
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
            className={`px-3 py-1 rounded-lg font-normal text-sm transition-colors flex items-center justify-center ${
              selectedCategory.includes(category)
                ? "bg-dark-blue text-white"
                : "bg-gray-200 text-dark-blue"
            }`}
          >
            {category}
          </button>
        ))}
        <div className="relative flex items-center justify-center gap-2">
          <span className="absolute h-full left-2 top-['50%'] transform-['translateY(-50%)'] flex items-center justify-center text-dark-blue opacity-50">
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

      <div
        className="max-w-2xl mx-auto relative w-full"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const isLoaderRow = virtualRow.index === newsItems.length;
          const item = newsItems[virtualRow.index];

          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              className="absolute top-0 left-0 w-full pb-4"
              style={{
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <div
                  ref={loadMoreRef}
                  className="flex justify-center gap-4 mt-8 mb-8"
                >
                  {hasNextPage ? (
                    <LoaderPinwheel className="animate-spin" />
                  ) : (
                    t("no_more")
                  )}
                </div>
              ) : (
                <NewsItem item={item} itemStyles={itemStyles} />
              )}
            </div>
          );
        })}
      </div>
      <ScrollToTopButton />
    </div>
  );
};

export default Dashboard;
