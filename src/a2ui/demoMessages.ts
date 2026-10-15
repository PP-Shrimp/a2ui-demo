import type { A2UIMessage } from './types'

export const welcomeMessages: A2UIMessage[] = [
  {
    type: 'surfaceUpdate',
    surfaceId: 'welcome',
    rootId: 'welcome-root',
    components: [
      {
        id: 'welcome-root',
        type: 'card',
        children: ['welcome-title', 'welcome-copy', 'welcome-hint'],
      },
      {
        id: 'welcome-title',
        type: 'heading',
        text: '结构化响应已就绪',
      },
      {
        id: 'welcome-copy',
        type: 'text',
        text: '我会根据任务选择合适的 A2UI 组件，而不是把所有内容拼成 Markdown。试试输入“帮我登录”或“我要点外卖”。',
      },
      {
        id: 'welcome-hint',
        type: 'status',
        text: '所有按钮和表单提交都会作为 userAction 回传给大模型。',
        tone: 'success',
      },
    ],
  },
]

export const loginMessages: A2UIMessage[] = [
  {
    type: 'surfaceUpdate',
    surfaceId: 'login',
    rootId: 'login-root',
    components: [
      {
        id: 'login-root',
        type: 'card',
        children: ['login-title', 'login-copy', 'login-account', 'login-password', 'login-submit'],
      },
      { id: 'login-title', type: 'heading', text: '登录账号' },
      { id: 'login-copy', type: 'text', text: '请输入账号信息，提交后由大模型继续处理登录流程。' },
      {
        id: 'login-account',
        type: 'textField',
        label: '账号',
        name: 'username',
        placeholder: '手机号或邮箱',
        required: true,
        autocomplete: 'username',
      },
      {
        id: 'login-password',
        type: 'passwordField',
        label: '密码',
        name: 'password',
        placeholder: '请输入密码',
        required: true,
        autocomplete: 'current-password',
      },
      { id: 'login-submit', type: 'button', label: '确认登录', action: 'login.submit' },
    ],
  },
]

export const foodMessages: A2UIMessage[] = [
  {
    type: 'surfaceUpdate',
    surfaceId: 'food',
    rootId: 'food-root',
    components: [
      {
        id: 'food-root',
        type: 'card',
        children: ['food-title', 'food-copy', 'food-grid'],
      },
      { id: 'food-title', type: 'heading', text: '附近热门外卖' },
      { id: 'food-copy', type: 'text', text: '选好商品后点击加入订单，我会把选择发送给大模型。' },
      {
        id: 'food-grid',
        type: 'productGrid',
        children: ['food-burger', 'food-noodles', 'food-salad'],
      },
      {
        id: 'food-burger',
        type: 'productCard',
        productId: 'burger-set',
        name: '招牌牛肉汉堡套餐',
        description: '牛肉汉堡 + 薯条 + 可乐',
        price: 32,
        action: 'food.add',
        actionLabel: '加入订单',
      },
      {
        id: 'food-noodles',
        type: 'productCard',
        productId: 'spicy-noodles',
        name: '重庆小面',
        description: '现煮面条，可选辣度',
        price: 18,
        action: 'food.add',
        actionLabel: '加入订单',
      },
      {
        id: 'food-salad',
        type: 'productCard',
        productId: 'chicken-salad',
        name: '香煎鸡胸沙拉',
        description: '鸡胸肉、牛油果和时蔬',
        price: 26,
        action: 'food.add',
        actionLabel: '加入订单',
      },
    ],
  },
]
