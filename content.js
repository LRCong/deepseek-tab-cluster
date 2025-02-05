// 监听来自 background.js 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageContent') {
    // 获取页面内容
    const pageContent = {
      content: document.body.innerText.substring(0, 500),
      title: document.title,
      url: window.location.href
    };
    sendResponse(pageContent);
  }
  return true; // 保持消息通道开启
}); 