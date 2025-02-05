// 显示分组结果
async function displayGroups(groups) {
  console.log('🎨 开始渲染分组界面');
  
  const container = document.getElementById('groups-container');
  container.innerHTML = '';
  
  console.log('📊 获取到的分组数据:', groups);
  
  if (!groups || !groups.groups || groups.groups.length === 0) {
    console.log('⚠️ 没有分组数据');
    container.innerHTML = '<p>暂无分组数据</p>';
    return;
  }
  
  groups.groups.forEach(group => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'group';
    
    const groupHeader = document.createElement('div');
    groupHeader.className = 'group-header';
    
    const groupName = document.createElement('div');
    groupName.className = 'group-name';
    groupName.textContent = group.name;
    groupHeader.appendChild(groupName);
    
    const groupDesc = document.createElement('div');
    groupDesc.className = 'group-description';
    groupDesc.textContent = group.description;
    groupHeader.appendChild(groupDesc);
    
    groupDiv.appendChild(groupHeader);
    
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'tabs-container';
    
    group.tabIds.forEach(async (tabId) => {
      try {
        const tab = await chrome.tabs.get(tabId);
        const tabDiv = document.createElement('div');
        tabDiv.className = 'tab-item';
        
        const favicon = document.createElement('img');
        favicon.className = 'tab-favicon';
        favicon.src = tab.favIconUrl || 'default-favicon.png';
        favicon.onerror = () => favicon.src = 'default-favicon.png';
        tabDiv.appendChild(favicon);
        
        const tabTitle = document.createElement('span');
        tabTitle.className = 'tab-title';
        tabTitle.textContent = tab.title;
        tabTitle.title = tab.url;
        tabDiv.appendChild(tabTitle);
        
        tabDiv.onclick = () => chrome.tabs.update(tabId, { active: true });
        tabsContainer.appendChild(tabDiv);
      } catch (error) {
        console.error(`无法获取标签页 ${tabId} 的信息:`, error);
      }
    });
    
    groupDiv.appendChild(tabsContainer);
    container.appendChild(groupDiv);
  });
}

// 初始化界面
document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const apiKeyError = document.getElementById('apiKeyError');
  const analyzeButton = document.getElementById('analyzeButton');
  const applyButton = document.getElementById('applyButton');
  const refreshButton = document.getElementById('refresh-button');
  const statusText = document.getElementById('status');

  // 加载保存的 API Key
  chrome.storage.local.get(['apiKey'], (result) => {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
      analyzeButton.disabled = false;
    }
  });

  // 监听 API Key 输入
  apiKeyInput.addEventListener('input', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (apiKey) {
      apiKeyError.textContent = '';
      analyzeButton.disabled = false;
      
      // 保存 API Key
      await chrome.storage.local.set({ apiKey });
    } else {
      apiKeyError.textContent = '请输入 API Key';
      analyzeButton.disabled = true;
    }
  });

  // 分析标签页按钮
  analyzeButton.addEventListener('click', async () => {
    try {
      statusText.textContent = '正在分析标签页...';
      analyzeButton.disabled = true;
      applyButton.disabled = true;
      refreshButton.disabled = true;

      const response = await chrome.runtime.sendMessage({ action: 'analyzeTabs' });
      
      if (response.success) {
        statusText.textContent = '分析完成！请检查分组结果，满意后点击"应用分组"';
        displayGroups(response.groups);
        applyButton.disabled = false;
      } else {
        statusText.textContent = '分析失败：' + (response.error?.message || '未知错误');
      }
    } catch (error) {
      statusText.textContent = '发生错误：' + error.message;
    } finally {
      analyzeButton.disabled = false;
      refreshButton.disabled = false;
    }
  });

  // 应用分组按钮
  applyButton.addEventListener('click', async () => {
    try {
      statusText.textContent = '正在应用分组...';
      analyzeButton.disabled = true;
      applyButton.disabled = true;
      refreshButton.disabled = true;

      const response = await chrome.runtime.sendMessage({ action: 'applyGroups' });
      
      if (response.success) {
        statusText.textContent = '分组已应用！';
      } else {
        statusText.textContent = '应用分组失败：' + (response.error?.message || '未知错误');
      }
    } catch (error) {
      statusText.textContent = '发生错误：' + error.message;
    } finally {
      analyzeButton.disabled = false;
      applyButton.disabled = false;
      refreshButton.disabled = false;
    }
  });

  // 刷新按钮
  refreshButton.addEventListener('click', async () => {
    try {
      statusText.textContent = '正在刷新...';
      analyzeButton.disabled = true;
      applyButton.disabled = true;
      refreshButton.disabled = true;

      const response = await chrome.runtime.sendMessage({ action: 'analyzeTabs' });
      
      if (response.success) {
        statusText.textContent = '刷新完成！';
        displayGroups(response.groups);
        applyButton.disabled = false;
      } else {
        statusText.textContent = '刷新失败：' + (response.error?.message || '未知错误');
      }
    } catch (error) {
      statusText.textContent = '发生错误：' + error.message;
    } finally {
      analyzeButton.disabled = false;
      refreshButton.disabled = false;
    }
  });

  // 初始加载已保存的分组
  chrome.storage.local.get(['groups'], (result) => {
    if (result.groups) {
      displayGroups(result.groups);
      applyButton.disabled = false;
    }
  });
});

// 监听存储变化
chrome.storage.onChanged.addListener((changes) => {
  console.log('📝 检测到存储变化:', changes);
  if (changes.groups) {
    console.log('🔄 更新分组显示');
    displayGroups(changes.groups.newValue);
  }
}); 