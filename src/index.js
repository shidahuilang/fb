export default {
  async fetch(request) {
    const url = new URL(request.url);
    const target = url.searchParams.get("url");

    if (url.pathname === "/check" && target) {
      try {
        const start = Date.now();
        const response = await fetch(target, { method: "HEAD", redirect: "follow" });
        const duration = Date.now() - start;
        const ok = response.ok;
        return new Response(
          JSON.stringify({ status: ok ? "ok" : "error", duration }),
          { headers: { "Content-Type": "application/json" } }
        );
      } catch (err) {
        return new Response(JSON.stringify({ status: "error", duration: null }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // 返回静态 HTML 页面
    const html = await fetchHtml();
    return new Response(html, {
      headers: { "Content-Type": "text/html;charset=utf-8" },
    });
  },
};

// 获取 HTML 页面
async function fetchHtml() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>地址发布页，收藏我回家不迷路！</title>
  <meta name="description" content="地址发布页，收藏我回家不迷路！" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <div id="app">
    <h1>地址发布页</h1>
    <ul id="url-list">
      <li data-url="https://example.com">备用地址1</li>
      <li data-url="https://example2.com">备用地址2</li>
    </ul>
    <button onclick="checkAllUrls()">检测所有站点</button>
  </div>
  <script>
    function checkAllUrls() {
      const items = document.querySelectorAll("#url-list li");

      items.forEach(li => {
        const url = li.getAttribute("data-url");
        const checkUrl = \`/check?url=\${encodeURIComponent(url)}\`;

        fetch(checkUrl)
          .then(res => res.json())
          .then(data => {
            updateUrlStatus(li, data.status === "ok", data.duration || "N/A");
          })
          .catch(() => {
            updateUrlStatus(li, false, "超时");
          });
      });
    }

    function updateUrlStatus(li, status, duration) {
      const statusSpan = document.createElement("span");
      statusSpan.textContent = status ? \`连接成功，耗时：\${duration}ms\` : \`连接失败\`;
      statusSpan.style.color = status ? 'green' : 'red';
      li.appendChild(statusSpan);
    }
  </script>
</body>
</html>
  `;
}
