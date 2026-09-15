(() => {
  const TARGET = '/tools/taiwan-overseas-income-tax-calculator.html';
  const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();

  if (new URLSearchParams(window.location.search).get('tool') === 'tax') {
    window.location.replace(TARGET);
    return;
  }

  const bind = () => {
    document.querySelectorAll('aside nav button').forEach((button) => {
      if (normalize(button.textContent) !== '海外所得' || button.dataset.finkitTaxV6 === '1') return;
      button.dataset.finkitTaxV6 = '1';
      button.title = '開啟 115年度海外所得最低稅負精算';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        window.location.href = TARGET;
      }, true);
    });
  };

  bind();
  const observer = new MutationObserver(bind);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
