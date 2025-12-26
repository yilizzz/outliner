import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronUp } from "lucide-react";
const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    // 清理事件监听器
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  // 平滑滚动到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-24 right-4"
      aria-label="back to top"
      variant="secondary"
    >
      <ChevronUp />
    </Button>
  );
};

export default ScrollToTopButton;
