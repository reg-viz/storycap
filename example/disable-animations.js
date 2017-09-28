(() => {
  const $iframe = document.getElementById('storybook-preview-iframe');
  const $doc = $iframe.contentDocument;
  const $style = $doc.createElement('style');

  $style.innerHTML = `* {
    transition: none !important;
    animation: none !important;
  }`;

  $doc.body.appendChild($style);
})();
