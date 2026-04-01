"use client";

import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { galleryItems, type GalleryItem as GalleryItemType } from "@/data/gallery";
import CategoryFilter from "./CategoryFilter";
import GalleryItem from "./GalleryItem";

const Lightbox = lazy(() => import("./Lightbox"));

type Category = "all" | "kitchen" | "wardrobe";

const ITEMS_PER_PAGE = 12;

export default function Gallery() {
  const [category, setCategory] = useState<Category>("all");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredItems = useMemo(() => {
    if (category === "all") return galleryItems;
    return galleryItems.filter((item) => item.category === category);
  }, [category]);

  const handleCategoryChange = useCallback((cat: Category) => {
    setCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const hasMore = visibleCount < filteredItems.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  }, []);

  const openLightbox = useCallback(
    (item: GalleryItemType) => {
      const idx = filteredItems.findIndex((i) => i.id === item.id);
      setLightboxIndex(idx);
    },
    [filteredItems]
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  return (
    <>
      <CategoryFilter active={category} onChange={handleCategoryChange} />

      <section className="mx-auto max-w-[1400px] px-3 py-6 md:px-4 md:py-12">
        <div className="masonry-grid">
          {visibleItems.map((item, index) => (
            <GalleryItem
              key={item.id}
              item={item}
              index={index}
              onClick={() => openLightbox(item)}
            />
          ))}
        </div>

        {hasMore && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={loadMore}
              className="rounded-full border border-text-primary/15 px-10 py-3 text-sm font-medium text-text-primary transition-all duration-300 hover:border-text-primary/40 hover:bg-text-primary/5"
            >
              Load More
            </button>
          </div>
        )}
      </section>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Suspense fallback={null}>
            <Lightbox
              items={filteredItems}
              currentIndex={lightboxIndex}
              onClose={closeLightbox}
              onNavigate={setLightboxIndex}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
