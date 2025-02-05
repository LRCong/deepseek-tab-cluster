// 存储所有标签页的数据
let tabsData = {};
let groups = [];

// DeepSeek API 配置
let DEEPSEEK_API_KEY = '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

// 初始化时从存储中加载 API Key
chrome.storage.local.get(['apiKey'], (result) => {
  if (result.apiKey) {
    DEEPSEEK_API_KEY = result.apiKey;
  }
});

// 监听 API Key 变化
chrome.storage.onChanged.addListener((changes) => {
  if (changes.apiKey) {
    DEEPSEEK_API_KEY = changes.apiKey.newValue;
  }
});

// 获取标签页信息
async function getTabInfo(tab) {
  console.log('🔍 开始获取标签页信息:', tab.id, tab.url);
  
  return {
    id: tab.id,
    title: tab.title,
    url: tab.url
  };
}

// 使用 DeepSeek API 进行聚类
async function clusterTabs(tabsData) {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('请先设置 DeepSeek API Key');
  }
  
  console.log('🔄 开始进行标签页分组');
  console.log('📊 待处理的标签页数据:', tabsData);
  
  try {
    const prompt = `请将以下标签页内容进行分组，并严格按照指定的 JSON 格式返回结果：
    
    输入数据：
    ${JSON.stringify(tabsData)}
    
    要求返回的 JSON 格式如下：
    {
      "groups": [
        {
          "name": "组名（用简短的一个词描述这组标签页的主题）",
          "description": "组的详细描述（用一句话描述这组标签页的共同特点）",
          "tabIds": [标签页ID数组]
        }
      ]
    }
    
    注意事项：
    1. 每个标签页必须且只能属于一个组
    2. 组名要简洁明确，3-6个字为宜
    3. description 需要完整描述组内标签页的共同特点
    4. 只根据标签页的标题和URL进行分组
    5. tabIds 数组中的 ID 必须是输入数据中的 id 字段值`;

    console.log('🤖 发送请求到 DeepSeek API');
    
    const requestBody = {
      model: "deepseek-chat",  // 改回 chat 模型
      messages: [{
        role: "user", 
        content: prompt
      }],
      temperature: 0.3,
      max_tokens: 2000,
      stream: false,
      response_format: { type: "json_object" }
    };

    console.log('📤 请求体:', requestBody);
    
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 API 响应状态:', response.status);
    console.log('📥 API 响应头:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 错误响应:', errorText);
      throw new Error(`API 请求失败: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('📩 DeepSeek API 返回结果:', result);
    
    if (!result.choices || !result.choices[0] || !result.choices[0].message) {
      console.error('❌ API 返回数据格式不正确:', result);
      throw new Error('API 返回数据格式不正确');
    }

    const clusters = JSON.parse(result.choices[0].message.content);
    console.log('🎯 解析后的分组结果:', clusters);
    
    if (!validateClusterFormat(clusters)) {
      console.error('❌ API 返回的数据格式无效');
      throw new Error('Invalid cluster format returned from API');
    }
    
    console.log('✅ 分组完成');
    return clusters;
  } catch (error) {
    console.error('❌ 分组过程出错:', error);
    // 返回更详细的错误信息
    return { 
      groups: [],
      error: {
        message: error.message,
        stack: error.stack
      }
    };
  }
}

// 验证返回的数据格式
function validateClusterFormat(clusters) {
  console.log('🔍 验证分组数据格式');
  if (!clusters.groups || !Array.isArray(clusters.groups)) {
    console.error('❌ 数据格式错误: groups 不是数组');
    return false;
  }
  
  const isValid = clusters.groups.every(group => {
    const valid = typeof group.name === 'string' &&
                 typeof group.description === 'string' &&
                 Array.isArray(group.tabIds) &&
                 group.tabIds.every(id => typeof id === 'number');
    if (!valid) {
      console.error('❌ 分组数据格式错误:', group);
    }
    return valid;
  });
  
  console.log(isValid ? '✅ 数据格式验证通过' : '❌ 数据格式验证失败');
  return isValid;
}

// 获取所有标签页信息并进行聚类
async function analyzeTabs() {
  console.log('🚀 开始分析标签页');
  
  try {
    const tabs = await chrome.tabs.query({});
    console.log(`📑 找到 ${tabs.length} 个标签页`);
    
    const tabsData = [];
    
    for (const tab of tabs) {
      console.log(`📝 处理标签页: ${tab.url}`);
      tabsData.push(await getTabInfo(tab));
    }
    
    console.log('🤖 开始进行聚类分析');
    const groups = await clusterTabs(tabsData);
    
    console.log('💾 保存分组结果');
    await chrome.storage.local.set({ groups });
    
    console.log('✅ 分析完成');
    return groups;
  } catch (error) {
    console.error('❌ 分析过程出错:', error);
    return { groups: [] };
  }
}

// 应用标签组
async function applyGroups() {
  try {
    const { groups } = await chrome.storage.local.get(['groups']);
    if (!groups || !groups.groups) {
      throw new Error('没有可用的分组数据');
    }
    
    console.log('📑 开始创建标签组');
    await createChromeTabGroups(groups);
    
    return { success: true };
  } catch (error) {
    console.error('❌ 应用分组失败:', error);
    return { 
      success: false, 
      error: {
        message: error.message,
        stack: error.stack
      }
    };
  }
}

// 添加创建 Chrome 标签组的函数
async function createChromeTabGroups(groups) {
  if (!groups.groups) return;
  
  try {
    // 获取当前窗口中的所有标签页
    const tabs = await chrome.tabs.query({});
    
    // 先解除所有标签页的分组
    for (const tab of tabs) {
      try {
        if (tab.groupId !== chrome.tabs.TAB_ID_NONE) {
          await chrome.tabs.ungroup(tab.id);
        }
      } catch (error) {
        console.error(`解除标签页 ${tab.id} 的分组失败:`, error);
      }
    }
    
    // 为每个分组创建新的标签组
    for (const group of groups.groups) {
      try {
        // 检查所有标签页是否存在
        const validTabIds = [];
        for (const tabId of group.tabIds) {
          try {
            await chrome.tabs.get(tabId);
            validTabIds.push(tabId);
          } catch (error) {
            console.warn(`标签页 ${tabId} 不存在，将跳过`);
          }
        }
        
        if (validTabIds.length > 0) {
          // 创建新的标签组
          const groupId = await chrome.tabs.group({
            tabIds: validTabIds
          });
          
          // 设置标签组的颜色和标题
          await chrome.tabGroups.update(groupId, {
            title: group.name,
            color: getGroupColor(group.name)
          });
        }
      } catch (error) {
        console.error(`创建标签组 "${group.name}" 失败:`, error);
      }
    }
  } catch (error) {
    console.error('创建标签组过程出错:', error);
    throw error;
  }
}

// 添加颜色选择函数
function getGroupColor(groupName) {
  const colors = [
    'grey', 'blue', 'red', 'yellow', 'green', 
    'pink', 'purple', 'cyan'
  ];
  
  // 使用组名的哈希值来选择颜色，确保相同的组名总是得到相同的颜色
  const hash = groupName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

// 更新消息监听器
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeTabs') {
    console.log('📨 收到分析请求');
    analyzeTabs().then(groups => {
      sendResponse({ success: true, groups });
    }).catch(error => {
      console.error('分析过程出错:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
  
  if (request.action === 'applyGroups') {
    console.log('📨 收到应用分组请求');
    applyGroups().then(result => {
      sendResponse(result);
    }).catch(error => {
      console.error('应用分组出错:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});