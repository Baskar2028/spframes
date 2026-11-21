import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
export default function Gallery({ items }) {
  const [index, setIndex] = useState(-1);
  const close = () => setIndex(-1);
  return (
    <>
      <div className="gallery-grid">
        {items.map((it, i) => (
          <button
            className="gallery-item"
            key={it.src + i}
            onClick={() => setIndex(i)}
          >
            <img
              src={it.src}
              alt={it.tag || "Atexra photography"}
              loading="lazy"
            />
            <span>{it.tag || "View photograph"}</span>
          </button>
        ))}
      </div>
      {index >= 0 && (
        <div className="lightbox" onClick={close}>
          <button className="lb-close" onClick={close}>
            <X />
          </button>
          <button
            className="lb-prev"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index - 1 + items.length) % items.length);
            }}
          >
            <ChevronLeft />
          </button>
          <img
            src={items[index].src}
            alt={items[index].tag || "Photography"}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lb-next"
            onClick={(e) => {
              e.stopPropagation();
              setIndex((index + 1) % items.length);
            }}
          >
            <ChevronRight />
          </button>
          <p>
            {index + 1} / {items.length}
          </p>
        </div>
      )}
    </>
  );
}
