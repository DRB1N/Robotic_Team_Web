# 太原理工大学机器人团队 · 2026 纳新网站

TYUT Robot Team 2026 Recruitment Website — 基于 FastAPI 的服务端渲染网站，赛博朋克风格的招新宣传与信息展示平台。

## 技术栈

- **后端**: FastAPI + Jinja2 + Uvicorn
- **前端**: 原生 HTML/CSS/JS（无框架依赖）
- **3D 渲染**: Three.js（首页粒子 + 线框几何体背景）
- **字体**: Google Fonts（Orbitron + Rajdhani + Noto Sans SC）

## 项目结构

```
.
├── main.py                 # FastAPI 入口，路由 + 静态文件挂载
├── requirements.txt        # Python 依赖
├── templates/              # Jinja2 模板
│   ├── index.html          # 首页
│   ├── organization.html   # 组织概况
│   ├── training.html       # 培养方案
│   └── research.html       # 竞赛科研
├── static/
│   ├── css/style.css       # 全局样式 + 赛博朋克主题变量
│   └── js/
│       ├── main.js         # 主题切换、滚动动画、导航高亮
│       └── three-bg.js     # Three.js 3D 粒子背景
└── images/
    ├── 照片/               # 二维码、Logo 等
    ├── 导师/               # 指导老师头像
    └── 合照/               # 团队活动照片
```

## 页面

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 3D 粒子背景、三条成长路线、成就数据、成长链路 |
| `/organization` | 组织概况 | 三大战队、指导老师简介、团队风采照片墙 |
| `/training` | 培养方案 | 四年时间线概览 + 三队 Tab 切换详细培养路线 |
| `/research` | 竞赛科研 | 算力资源、平台支持、竞赛成果、科研成果、社区伙伴 |

## 快速开始

```bash
# 1. 安装依赖
pip install -r requirements.txt

# 2. 启动服务
python main.py

# 3. 浏览器访问
# http://localhost:8000
```

服务默认运行在 `http://0.0.0.0:8000`，开发模式下启用热重载。

## 功能特性

- 赛博朋克视觉风格：霓虹光效、扫描线叠加、噪点纹理
- 暗色/亮色双主题切换（localStorage 持久化）
- 响应式布局，移动端适配
- 首页 Three.js 3D 交互背景（鼠标视差、几何体旋转、浮动粒子）
- 页面滚动入场动画（Intersection Observer）
- 固定导航栏 + 毛玻璃模糊效果
- 组织概况页：指导老师卡片（研究方向 / 科研成果 / 论文列表）
- 培养方案页：Tab 切换三队培养路线，详细月度计划表
- 竞赛科研页：算力资源卡片、平台支持网格、竞赛成果表格
