// Reusable wrap-around slider controller for image and caption data.
window.createSlider = (container, slides, onChange = () => {}) => {
  let index = 0;
  const update = () => {
    const slide = slides[index];
    container.dataset.currentSlide = String(index);
    container.dataset.slideSource = slide.source;
    container.dataset.slideCaption = slide.caption;
    onChange(slide, index);
  };
  const goTo = next => { index = ((next % slides.length) + slides.length) % slides.length; update(); };
  const next = () => goTo(index + 1);
  const prev = () => goTo(index - 1);
  update();
  return { next, prev, goTo, get currentIndex() { return index; } };
};
