"use client";

import { motion } from "framer-motion";

type Category = "all" | "kitchen" | "wardrobe";

interface CategoryFilterProps {
  active: Category;
  onChange: (category: Category) => void;
}

const categories: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Kitchens", value: "kitchen" },
  { label: "Wardrobes", value: "wardrobe" },
];

export default function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="sticky top-[56px] z-30 bg-bg-primary/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-1 px-6 py-4">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className="relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300"
          >
            {active === cat.value && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 rounded-full bg-text-primary"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                active === cat.value ? "text-text-light" : "text-text-secondary"
              }`}
            >
              {cat.label}
            </span>
          </button>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-6">
        <div className="h-px bg-text-secondary/10" />
      </div>
    </div>
  );
}
