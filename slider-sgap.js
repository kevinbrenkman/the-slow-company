document.addEventListener('DOMContentLoaded', () => {
  /* shared timeline store */
  window.sliderTimelines = window.sliderTimelines || [];
  const sliderTimelines = window.sliderTimelines;
  window.registerSliderTimeline = tl => sliderTimelines.push(tl);

  /* SplitType once, outside the loop */
  const splitType = new SplitType('.slider_cms_title', {
    types: 'words, chars',
    tagName: 'span'
  });

  $('.slider_wrap').each(function () {
    const $wrap   = $(this);
    const $arrow  = $wrap.find('.slider_btn');
    const $items  = $wrap.find('.slider_cms_item').hide();
    const $dots   = $wrap.find('.slider_dot_item');

    const total   = $items.length;
    let   index   = 0;

    $items.first().css({ display: 'flex', opacity: 1 });
    gsap.set($dots.eq(0).find('.slider_dot_line'), { x: '0%' });

    /* progress bar timeline */
    const tl = gsap.timeline({ repeat: -1 });
    registerSliderTimeline(tl);

    $dots.each(function (i) {
      tl.addLabel(`step${i}`)
        .to($(this).find('.slider_dot_line'), {
          scaleX: 1,
          ease: 'none',
          duration: 16,
          onComplete: () => goTo(i + 1)
        });
    });

    function goTo(n) {
      let next = n;
      if (next > total - 1) next = 0;
      slide(next, true);
    }

    function slide(to, forward) {
      /* keep dot animation synced */
      gsap.set($dots.eq(to).find('.slider_dot_line'), { x: '0%' });
      gsap.fromTo(
        $dots.eq(index).find('.slider_dot_line'),
        { x: '0%' },
        { x: '100%' }
      );
      tl.seek(`step${to}`);

      /* cross-fade slides and animate title chars */
      const $prev = $items.eq(index);
      const $next = $items.eq(to);
      const yFrom = forward ? 100 : -100;

      $items.css('display', 'none');
      gsap.set([$prev, $next], { xPercent: 0 });
      gsap.set($next, { opacity: 0, display: 'flex' });

      const tlSlide = gsap.timeline({ defaults: { duration: 1.5, ease: 'power2.inOut' } });
      tlSlide
        .to($prev, { opacity: 0, onComplete: () => $prev.css('display', 'none') })
        .to($next, { opacity: 1 }, '<')
        .fromTo(
          $next.find('.slider_cms_title .char'),
          { yPercent: yFrom },
          { yPercent: 0, duration: 0.5, stagger: { amount: 0.5 } },
          '<'
        );

      index = to;
    }

    /* controls */
    $arrow.filter('.is-prev').on('click', () => {
      let next = index - 1;
      if (next < 0) next = total - 1;
      slide(next, false);
    });
    $arrow.filter('.is-next').on('click', () => goTo(index + 1));
    $dots.on('click', function () {
      const dot = $(this).index();
      if (index > dot) slide(dot, false);
      else if (index < dot) slide(dot, true);
    });
  });
});