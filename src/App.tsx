import { useEffect, useMemo, useState } from 'react'
import { A2UIRenderer } from './a2ui/A2UIRenderer'
import { DshA2UIPlugin } from './a2ui/plugin'
import { foodMessages, loginMessages, welcomeMessages } from './a2ui/demoMessages'
import type { A2UIActionEvent, A2UISurface } from './a2ui/types'
import './styles.css'

type ChatEntry = {
  role: 'user' | 'assistant'
  text: string
}

export default function App() {
  const [surfaces, setSurfaces] = useState<A2UISurface[]>([])
  const [chat, setChat] = useState<ChatEntry[]>([])
  const [prompt, setPrompt] = useState('')
  const [eventLog, setEventLog] = useState<A2UIActionEvent[]>([])

  const plugin = useMemo(
    () => new DshA2UIPlugin((event) => {
      setEventLog((current) => [event, ...current].slice(0, 5))
      window.parent.postMessage({ channel: 'dsh-a2ui', ...event }, '*')
      respondToDemoAction(event)
    }),
    [],
  )

  useEffect(() => {
    const unsubscribe = plugin.subscribe(setSurfaces)
    welcomeMessages.forEach((message) => plugin.receiveMessage(message))
    const receiveFromDsh = (event: MessageEvent) => {
      if (event.data?.channel === 'dsh-a2ui' && event.data?.type === 'modelResponse') {
        plugin.receive(event.data.messages)
      }
    }
    window.addEventListener('message', receiveFromDsh)
    return () => {
      unsubscribe()
      window.removeEventListener('message', receiveFromDsh)
    }
  }, [plugin])

  const respondToDemoAction = (event: A2UIActionEvent) => {
    if (event.action === 'login.submit') {
      plugin.receiveMessage({
        type: 'surfaceUpdate',
        surfaceId: 'login-result',
        rootId: 'login-result-root',
        components: [
          { id: 'login-result-root', type: 'card', children: ['login-result-status'] },
          { id: 'login-result-status', type: 'status', tone: 'success', text: `已收到账号 ${event.values.username || '（未填写）'} 的登录操作，大模型可以继续处理。` },
        ],
      })
    }
    if (event.action === 'food.add') {
      plugin.receiveMessage({
        type: 'surfaceUpdate',
        surfaceId: 'food-result',
        rootId: 'food-result-root',
        components: [
          { id: 'food-result-root', type: 'card', children: ['food-result-status'] },
          { id: 'food-result-status', type: 'status', tone: 'success', text: `已选择「${String(event.data.name)}」，大模型可以继续确认地址和配送方式。` },
        ],
      })
    }
  }

  const submitPrompt = (event: React.FormEvent) => {
    event.preventDefault()
    const text = prompt.trim()
    if (!text) return
    setChat((current) => [...current, { role: 'user', text }])
    setPrompt('')
    const normalized = text.toLowerCase()
    if (normalized.includes('登录') || normalized.includes('登陆') || normalized.includes('login')) {
      setChat((current) => [...current, { role: 'assistant', text: '我为你准备了登录表单。' }])
      loginMessages.forEach((message) => plugin.receiveMessage(message))
    } else if (normalized.includes('外卖') || normalized.includes('吃') || normalized.includes('food')) {
      setChat((current) => [...current, { role: 'assistant', text: '我为你准备了商品卡片，请选择想吃的内容。' }])
      foodMessages.forEach((message) => plugin.receiveMessage(message))
    } else {
      setChat((current) => [...current, { role: 'assistant', text: '我理解了。对于需要操作的任务，我会返回 A2UI 组件，而不是 Markdown。你可以试试“帮我登录”或“我要点外卖”。' }])
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">A2</div>
        <div>
          <p className="eyebrow">DSH PLUGIN / INTERACTIVE MODEL UI</p>
          <h1>大模型响应工作台</h1>
        </div>
        <span className="connection-state"><i /> DSH 已连接</span>
      </header>

      <div className="workspace">
        <section className="conversation-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CONVERSATION</p>
              <h2>和模型对话</h2>
            </div>
            <span className="protocol-pill">A2UI protocol</span>
          </div>
          <div className="chat-list">
            {chat.length === 0 ? <div className="empty-chat">模型会把可执行任务转成组件，交互结果再回到同一个对话。</div> : null}
            {chat.map((entry, index) => (
              <div className={`chat-bubble chat-${entry.role}`} key={`${entry.role}-${index}`}>
                <span>{entry.role === 'user' ? '你' : '模型'}</span>
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
          <form className="prompt-box" onSubmit={submitPrompt}>
            <input id="prompt" name="prompt" onChange={(event) => setPrompt(event.target.value)} placeholder="例如：帮我登录 / 我要点外卖" value={prompt} />
            <button type="submit">发送 <span>↗</span></button>
          </form>
        </section>

        <section className="surface-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">RENDERED SURFACES</p>
              <h2>模型生成的界面</h2>
            </div>
            <span className="surface-count">{surfaces.length} surfaces</span>
          </div>
          <div className="surface-list">
            {surfaces.map((surface) => <A2UIRenderer key={surface.id} onAction={(action) => plugin.dispatch(action.surfaceId, action.componentId, action.action, action.values, action.data)} surface={surface} />)}
          </div>
        </section>

        <aside className="event-panel">
          <p className="eyebrow">EVENT STREAM</p>
          <h2>交互回传</h2>
          <p className="event-description">组件操作会转换为结构化事件，发送给 DSH 宿主和大模型。</p>
          <div className="event-list">
            {eventLog.length === 0 ? <div className="event-empty">等待组件操作…</div> : eventLog.map((event, index) => (
              <div className="event-item" key={`${event.timestamp}-${index}`}>
                <div><span className="event-dot" />{event.action}</div>
                <code>{JSON.stringify({ componentId: event.componentId, values: event.values, data: event.data })}</code>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
