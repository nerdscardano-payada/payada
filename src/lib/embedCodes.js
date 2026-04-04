export function buildHtmlEmbedCode(url, title = "PayADA Widget") {
  return `<iframe src="${url}" title="${title}" width="100%" height="720" style="border:0;border-radius:16px;max-width:100%;" loading="lazy" allow="clipboard-write"></iframe>`;
}

export function buildJsEmbedCode(url, containerId = "payada-embed") {
  return `<div id="${containerId}"></div>
<script>
  (function () {
    var container = document.getElementById("${containerId}");
    if (!container) return;

    var iframe = document.createElement("iframe");
    iframe.src = "${url}";
    iframe.title = "PayADA Widget";
    iframe.width = "100%";
    iframe.height = "720";
    iframe.loading = "lazy";
    iframe.allow = "clipboard-write";
    iframe.style.border = "0";
    iframe.style.borderRadius = "16px";
    iframe.style.maxWidth = "100%";

    container.appendChild(iframe);
  })();
</script>`;
}