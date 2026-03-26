import type { ComponentProps, ReactNode } from "react";

import TOCOriginal from "@theme-original/TOC";
import { useEffect, useRef } from "react";

type Props = ComponentProps<typeof TOCOriginal>;

const ACTIVE_LINK_SELECTOR = ".table-of-contents__link--active";
const TOC_LIST_SELECTOR = ".table-of-contents";
const SCROLL_MARGIN = 12;

function ensureActiveLinkVisible(root: HTMLElement) {
  const scrollContainer = root.querySelector<HTMLElement>(TOC_LIST_SELECTOR);
  const activeLink = root.querySelector<HTMLElement>(ACTIVE_LINK_SELECTOR);

  if (!scrollContainer || !activeLink) {
    return;
  }

  const containerTop = scrollContainer.scrollTop;
  const containerBottom = containerTop + scrollContainer.clientHeight;
  const itemTop = activeLink.offsetTop - SCROLL_MARGIN;
  const itemBottom = activeLink.offsetTop + activeLink.offsetHeight + SCROLL_MARGIN;

  if (itemTop < containerTop) {
    scrollContainer.scrollTo({
      top: Math.max(itemTop, 0),
      behavior: "smooth"
    });
    return;
  }

  if (itemBottom > containerBottom) {
    scrollContainer.scrollTo({
      top: itemBottom - scrollContainer.clientHeight,
      behavior: "smooth"
    });
  }
}

export default function TOC(props: Props): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    let frameId = 0;

    function scheduleSync() {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        ensureActiveLinkVisible(root);
      });
    }

    const observer = new MutationObserver(mutations => {
      const hasClassMutation = mutations.some(mutation => mutation.attributeName === "class");

      if (hasClassMutation) {
        scheduleSync();
      }
    });

    observer.observe(root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["class"]
    });

    scheduleSync();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <TOCOriginal {...props} />
    </div>
  );
}
