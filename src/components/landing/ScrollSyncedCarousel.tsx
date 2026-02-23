import { useRef, useEffect, useState } from 'react';

interface UseCase {
  title: string;
  desc: string;
  tags: string[];
  image: string;
}

interface ScrollSyncedCarouselProps {
  useCases: UseCase[];
  id?: string;
}

export default function ScrollSyncedCarousel({ useCases, id }: ScrollSyncedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const contentCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const wrapper = scrollWrapperRef.current;
      if (!wrapper) return;
      
      const wrapperRect = wrapper.getBoundingClientRect();
      if (wrapperRect.bottom < 0 || wrapperRect.top > window.innerHeight) return;
      
      const scrollableHeight = wrapper.offsetHeight - window.innerHeight;
      const pixelsScrolled = Math.max(0, window.scrollY - wrapper.offsetTop);
      const progress = scrollableHeight > 0 ? pixelsScrolled / scrollableHeight : 0;
      let newActiveIndex = Math.floor(progress * useCases.length);
      newActiveIndex = Math.min(useCases.length - 1, newActiveIndex);
      setActiveIndex(newActiveIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [useCases]);

  useEffect(() => {
    const contentPanel = contentCarouselRef.current;
    const activeItem = contentRefs.current[activeIndex];
    if (contentPanel && activeItem) {
      const panelHeight = contentPanel.clientHeight;
      const itemHeight = activeItem.clientHeight;
      const itemOffsetTop = activeItem.offsetTop;
      const targetScrollTop = itemOffsetTop - (panelHeight / 2) + (itemHeight / 2);
      contentPanel.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    }
  }, [activeIndex]);

  return (
    <>
      <style>{`
        .scroll-wrapper { min-height: 250vh; position: relative; }
        .sticky-container { position: sticky; top: 10vh; height: 80vh; max-height: 700px; width: 100%; display: flex; align-items: stretch; background: #ffffff; border-radius: 24px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); overflow: hidden; }
        .content-carousel { flex: 1; height: 100%; padding: 0 1.5rem 0 3rem; box-sizing: border-box; overflow-y: scroll; -ms-overflow-style: none; scrollbar-width: none; }
        .content-carousel::-webkit-scrollbar { display: none; }
        .content-item { height: 80vh; max-width: 450px; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; transition: opacity 0.5s ease-in-out; }
        .content-item:last-child { padding-bottom: 0; }
        .image-display { flex: 1; height: 100%; display: flex; align-items: center; justify-content: center; padding: 3rem; }
        .image-card { width: 100%; height: 100%; background: white; border-radius: 1.5rem; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); position: relative; overflow: hidden; }
        .image-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: opacity 0.5s ease-in-out; }
        .tag { display: inline-block; background: #f1f5f9; color: #111827; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; padding: 0.25rem 0.75rem; box-shadow: none; }
        .content-title { font-size: 2rem; font-weight: 700; color: #1f2937; margin-top: 0.75rem; letter-spacing: -0.025em; }
        .content-desc { font-size: 1.125rem; color: #475569; margin-top: 0.75rem; line-height: 1.75; }
        @media (max-width: 1024px) { .sticky-container { flex-direction: column; height: 90vh; top: 5vh; } .content-carousel { padding: 2rem; flex: 0 0 50%; } .image-display { padding: 0 2rem 2rem 2rem; flex: 1; } }
        @media (max-width: 640px) { .content-carousel { padding: 1.5rem; } .image-display { padding: 0 1.5rem 1.5rem 1.5rem; } .content-title { font-size: 1.5rem; } .content-desc { font-size: 1rem; } }
      `}</style>
      <div className="scroll-wrapper" ref={scrollWrapperRef}>
        <section className="sticky-container">
          <div className="content-carousel" ref={contentCarouselRef}>
            {useCases.map((useCase, i) => (
              <div
                key={useCase.title}
                ref={el => (contentRefs.current[i] = el)}
                className="content-item"
                style={{ opacity: activeIndex === i ? 1 : 0.3 }}
              >
                <span className="tag">{useCase.tags[0]}</span>
                <h3 className="content-title tracking-tight">{useCase.title}</h3>
                <p className="content-desc leading-relaxed text-slate-600">{useCase.desc}</p>
              </div>
            ))}
          </div>
          <div className="image-display">
            <div className="image-card">
              {useCases.map((useCase, i) => (
                <img
                  key={useCase.image}
                  src={useCase.image}
                  alt={useCase.title}
                  style={{ opacity: activeIndex === i ? 1 : 0 }}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}



