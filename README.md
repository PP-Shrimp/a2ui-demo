# DSH Plugin · A2UI

一个把大模型响应渲染为可交互 UI 的 DSH 插件示例。模型不再返回需要猜测结构的 Markdown，而是返回 A2UI 消息；插件根据组件类型渲染表单、按钮、商品卡片等界面，并将用户操作以结构化 `userAction` 事件发送回 DSH 宿主和大模型。

## 快速开始

```bash
npm install
npm run dev
```

打开 Vite 输出的地址，输入“帮我登录”或“我要点外卖”体验交互。生产构建使用：

```bash
npm run build
```

## 架构

- `src/a2ui/types.ts`：A2UI 消息、组件和用户操作事件的类型定义。
- `src/a2ui/protocol.ts`：解析模型 JSON（也支持 ```json 代码块）并维护 surface/data model。
- `src/a2ui/plugin.ts`：DSH 宿主适配器。`receive()` 接收模型消息，`dispatch()` 将交互发回模型。
- `src/a2ui/A2UIRenderer.tsx`：声明式组件渲染器，目前支持文本、容器、输入框、密码框、按钮、状态和商品卡片。
- `src/App.tsx`：可直接运行的演示宿主；接入 DSH 时可替换其中的演示回复。

## 模型响应格式

模型可以返回单条消息、消息数组，或 `modelResponse` 包装对象：

```json
{
  "type": "surfaceUpdate",
  "surfaceId": "login",
  "rootId": "login-root",
  "components": [
    {
      "id": "login-root",
      "type": "card",
      "children": ["account", "password", "submit"]
    },
    {
      "id": "account",
      "type": "textField",
      "label": "账号",
      "name": "username",
      "required": true
    },
    {
      "id": "password",
      "type": "passwordField",
      "label": "密码",
      "name": "password",
      "required": true
    },
    {
      "id": "submit",
      "type": "button",
      "label": "确认登录",
      "action": "login.submit"
    }
  ]
}
```

按钮点击后会产生如下事件。`values` 包含当前 surface 中的表单值，`data` 用于携带商品 ID、价格等业务数据：

```json
{
  "type": "userAction",
  "surfaceId": "login",
  "componentId": "submit",
  "action": "login.submit",
  "values": { "username": "user@example.com", "password": "••••••••" },
  "data": {},
  "timestamp": "2026-01-01T00:00:00.000Z"
}
```

## 接入 DSH 宿主

宿主可以把模型输出发送给插件所在 iframe：

```ts
iframe.contentWindow?.postMessage({
  channel: 'dsh-a2ui',
  type: 'modelResponse',
  messages: modelMessages,
}, '*')
```

插件会在用户操作时向 `window.parent` 发送同一 channel 的事件。生产环境应将 `'*'` 替换为实际的宿主 origin，并在宿主侧校验 `event.origin`。`DshA2UIPlugin` 也可以直接嵌入 DSH 的消息总线：

```ts
const plugin = new DshA2UIPlugin((action) => dshModel.send(action))
plugin.receive(modelResponse)
plugin.subscribe((surfaces) => renderSurfaces(surfaces))
```

## 安全边界

组件内容使用 React 文本节点渲染，不执行模型返回的 HTML、脚本或 Markdown；链接、图片来源和业务操作应由宿主按自身 allowlist 校验。密码只作为当前操作事件的一部分回传，正式环境应使用 TLS、最小化日志并遵循宿主的凭证处理策略。
