document.addEventListener('DOMContentLoaded', () => {
  const list = document.querySelector('.test-list');
  const items = Array.from(document.querySelectorAll('.test-list li'));
  const prevBtn = document.querySelector('.test-prev');
  const nextBtn = document.querySelector('.test-next');
  let index = 0;
  let timer = null;

  function show(i){
    index = (i + items.length) % items.length;
    list.style.transform = `translateX(-${index * 100}%)`;
  }

  function next(){ show(index + 1); }
  function prev(){ show(index - 1); }

  prevBtn.addEventListener('click', () => { prev(); resetTimer(); });
  nextBtn.addEventListener('click', () => { next(); resetTimer(); });

  function startTimer(){ timer = setInterval(next, 3500); }
  function resetTimer(){ clearInterval(timer); startTimer(); }

  // pause on hover
  const slider = document.querySelector('.test-slider');
  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', () => startTimer());

  show(0);
  startTimer();
});
