// 管理员界面前端脚本
document.addEventListener('DOMContentLoaded', () => {
  // 读取页面内嵌的配置数据
  async function fetchConfig() {
    try {
      // 这里假设有一个静态JSON配置文件，或者通过页面内嵌数据传递
      // 目前先从 /config/user/site.yml 读取不现实，改为请求 /config.json（可由生成器生成）
      const response = await fetch('/config.json');
      if (!response.ok) throw new Error('无法加载配置文件');
      const config = await response.json();
      return config;
    } catch (error) {
      console.error('加载配置失败:', error);
      return null;
    }
  }

  // 将对象转换为YAML字符串
  function toYAML(obj) {
    // 简单实现，建议后续用js-yaml库
    // 这里用JSON.stringify作为占位
    return JSON.stringify(obj, null, 2);
  }

  // 初始化页面元素
  const siteTitleInput = document.getElementById('site-title');
  const siteFaviconInput = document.getElementById('site-favicon');
  const siteFooterInput = document.getElementById('site-footer');
  const navList = document.getElementById('nav-list');
  const addNavItemBtn = document.getElementById('add-nav-item');
  const saveConfigBtn = document.getElementById('save-config');

  let currentConfig = null;

  // 渲染导航列表
  function renderNavList(navigation) {
    navList.innerHTML = '';
    navigation.forEach((nav, index) => {
      const div = document.createElement('div');
      div.className = 'nav-item';

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = nav.name || '';
      nameInput.placeholder = '导航名称';
      nameInput.style.flex = '1';
      nameInput.addEventListener('input', () => {
        currentConfig.navigation[index].name = nameInput.value;
      });

      const idInput = document.createElement('input');
      idInput.type = 'text';
      idInput.value = nav.id || '';
      idInput.placeholder = '导航ID';
      idInput.style.flex = '1';
      idInput.addEventListener('input', () => {
        currentConfig.navigation[index].id = idInput.value;
      });

      const iconInput = document.createElement('input');
      iconInput.type = 'text';
      iconInput.value = nav.icon || '';
      iconInput.placeholder = '图标类名';
      iconInput.style.flex = '1';
      iconInput.addEventListener('input', () => {
        currentConfig.navigation[index].icon = iconInput.value;
      });

      const delBtn = document.createElement('button');
      delBtn.textContent = '删除';
      delBtn.addEventListener('click', () => {
        currentConfig.navigation.splice(index, 1);
        renderNavList(currentConfig.navigation);
      });

      div.appendChild(nameInput);
      div.appendChild(idInput);
      div.appendChild(iconInput);
      div.appendChild(delBtn);

      navList.appendChild(div);
    });
  }

  // 加载配置并初始化表单
  async function init() {
    const config = await fetchConfig();
    if (!config) return;

    currentConfig = config;

    siteTitleInput.value = config.site?.title || '';
    siteFaviconInput.value = config.site?.favicon || '';
    siteFooterInput.value = config.site?.footer || '';

    renderNavList(config.navigation || []);
  }

  // 添加导航项
  addNavItemBtn.addEventListener('click', () => {
    if (!currentConfig.navigation) currentConfig.navigation = [];
    currentConfig.navigation.push({ name: '', id: '', icon: '' });
    renderNavList(currentConfig.navigation);
  });

  // 保存配置（下载YAML文件）
  saveConfigBtn.addEventListener('click', () => {
    if (!currentConfig) return;

    currentConfig.site = currentConfig.site || {};
    currentConfig.site.title = siteTitleInput.value;
    currentConfig.site.favicon = siteFaviconInput.value;
    currentConfig.site.footer = siteFooterInput.value;

    // 这里简单用JSON转字符串代替YAML，后续可用js-yaml库替换
    const yamlStr = toYAML(currentConfig);

    const blob = new Blob([yamlStr], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'site.yml';
    a.click();

    URL.revokeObjectURL(url);
  });

  init();
});