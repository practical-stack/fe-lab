import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

const TABS = [
  { id: "home", label: "홈", icon: "🏠" },
  { id: "files", label: "파일", icon: "📁" },
  { id: "search", label: "검색", icon: "🔍" },
  { id: "settings", label: "설정", icon: "⚙️" },
] as const;

type TabId = (typeof TABS)[number]["id"];
type ActivationDirection = "left" | "right" | "none";

export function SwipeableTabsDemo() {
  const [selectedTab, setSelectedTab] = useState<TabId>("home");
  const [activationDirection, setActivationDirection] =
    useState<ActivationDirection>("none");
  const carouselRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isScrolling = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const prevTabIndex = useRef(0);

  // Detect activation direction based on tab index change
  const selectTab = useCallback((tabId: TabId) => {
    const newIndex = TABS.findIndex((t) => t.id === tabId);
    const direction =
      newIndex > prevTabIndex.current
        ? "right"
        : newIndex < prevTabIndex.current
          ? "left"
          : "none";
    prevTabIndex.current = newIndex;
    setActivationDirection(direction);
    setSelectedTab(tabId);
  }, []);

  // Scroll to selected tab panel when tab is clicked
  const handleTabSelect = useCallback(
    (tabId: TabId) => {
      selectTab(tabId);
      const carousel = carouselRef.current;
      if (!carousel) return;

      const index = TABS.findIndex((t) => t.id === tabId);
      const panel = carousel.children[index] as HTMLElement | undefined;
      if (!panel) return;

      isScrolling.current = true;
      panel.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });

      if ("onscrollend" in carousel) {
        carousel.addEventListener(
          "scrollend",
          () => {
            isScrolling.current = false;
          },
          { once: true },
        );
      } else {
        setTimeout(() => {
          isScrolling.current = false;
        }, 400);
      }
    },
    [selectTab],
  );

  // Sync selected tab based on scroll position (user swipe)
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      if (isScrolling.current) return;

      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = setTimeout(() => {
        const scrollLeft = carousel.scrollLeft;
        const panelWidth = carousel.offsetWidth;
        const index = Math.round(scrollLeft / panelWidth);
        const clampedIndex = Math.max(0, Math.min(index, TABS.length - 1));
        selectTab(TABS[clampedIndex].id);
      }, 50);
    };

    carousel.addEventListener("scroll", handleScroll, { passive: true });
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, [selectTab]);

  return (
    <div
      className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white"
      data-activation-direction={activationDirection}
    >
      {/* Tab List */}
      <TabList
        selectedTab={selectedTab}
        onTabSelect={handleTabSelect}
        tabRefs={tabRefs}
      />

      {/* Tab Panel Carousel */}
      <div
        ref={carouselRef}
        className="flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`panel-${tab.id}`}
              aria-labelledby={`tab-${tab.id}`}
              className="w-full flex-none snap-start snap-always"
              // inert on non-active panels: prevents focus entering hidden content
              {...(!isActive && { inert: true })}
            >
              <TabPanelContent tab={tab} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TabList({
  selectedTab,
  onTabSelect,
  tabRefs,
}: {
  selectedTab: TabId;
  onTabSelect: (id: TabId) => void;
  tabRefs: React.RefObject<Record<string, HTMLButtonElement | null>>;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Update indicator position from DOM measurements
  const updateIndicator = useCallback(() => {
    const button = tabRefs.current?.[selectedTab];
    const indicator = indicatorRef.current;
    const list = listRef.current;
    if (!button || !indicator || !list) return;

    const left = button.offsetLeft;
    const width = button.offsetWidth;

    indicator.style.transform = `translateX(${left}px)`;
    indicator.style.width = `${width}px`;
  }, [selectedTab, tabRefs]);

  // Sync indicator on tab change (before paint to avoid flicker)
  useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator]);

  // ResizeObserver: keep indicator accurate on window/tab resize
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const ro = new ResizeObserver(() => {
      updateIndicator();
    });

    // Observe the list container
    ro.observe(list);

    // Observe each tab button
    const buttons = Object.values(tabRefs.current ?? {});
    for (const btn of buttons) {
      if (btn) ro.observe(btn);
    }

    return () => ro.disconnect();
  }, [updateIndicator, tabRefs]);

  // Keyboard navigation: Arrow keys, Home, End with loop focus
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = TABS.findIndex((t) => t.id === selectedTab);
      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          nextIndex = (currentIndex + 1) % TABS.length;
          break;
        case "ArrowLeft":
          nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
          break;
        case "Home":
          nextIndex = 0;
          break;
        case "End":
          nextIndex = TABS.length - 1;
          break;
        default:
          return;
      }

      e.preventDefault();
      const nextTabId = TABS[nextIndex].id;
      onTabSelect(nextTabId);
      tabRefs.current?.[nextTabId]?.focus();
    },
    [selectedTab, onTabSelect, tabRefs],
  );

  return (
    <div
      ref={listRef}
      role="tablist"
      className="relative border-b border-gray-200 bg-gray-50"
      onKeyDown={handleKeyDown}
    >
      <div className="flex">
        {TABS.map((tab) => {
          const isActive = selectedTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              ref={(el) => {
                tabRefs.current![tab.id] = el;
              }}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              // Roving tabindex: only active tab is in tab order
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabSelect(tab.id)}
              className={[
                "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-900",
              ].join(" ")}
            >
              {tab.icon} {tab.label}
            </button>
          );
        })}
      </div>
      {/* Animated indicator */}
      <div
        ref={indicatorRef}
        role="presentation"
        className="absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ease-out"
      />
    </div>
  );
}

function TabPanelContent({ tab }: { tab: (typeof TABS)[number] }) {
  const id = useId();

  return (
    <div className="p-6">
      <h3 className="mb-3 text-base font-semibold text-gray-900">
        {tab.icon} {tab.label}
      </h3>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={`${id}-${i}`}
            className="flex items-center gap-3 rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg">
              {tab.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {tab.label} 항목 #{i + 1}
              </p>
              <p className="text-xs text-gray-500">
                {tab.label} 카테고리 · 항목 {i + 1}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
