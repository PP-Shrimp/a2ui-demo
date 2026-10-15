import {
  type A2UIMessage,
  type A2UISurface,
  type DataValue,
  isA2UIMessage,
} from './types'

export function parseA2UIResponse(input: unknown): A2UIMessage[] {
  const value = typeof input === 'string' ? parseTextResponse(input) : input
  if (Array.isArray(value)) return value.filter(isA2UIMessage)
  if (isA2UIMessage(value)) return [value]
  if (isModelResponse(value)) return value.messages.filter(isA2UIMessage)
  throw new Error('模型响应不是有效的 A2UI 消息')
}

function parseTextResponse(input: string): unknown {
  const trimmed = input.trim()
  const fenced = trimmed.match(/^```(?:json|a2ui)?\s*([\s\S]*?)\s*```$/i)
  const jsonText = fenced?.[1] ?? trimmed
  try {
    return JSON.parse(jsonText)
  } catch {
    throw new Error('无法解析模型的 A2UI JSON 响应')
  }
}

function isModelResponse(value: unknown): value is { messages: unknown[] } {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'type' in value &&
      (value as { type?: unknown }).type === 'modelResponse' &&
      'messages' in value &&
      Array.isArray((value as { messages: unknown[] }).messages),
  )
}

export function applyA2UIMessage(
  surfaces: Map<string, A2UISurface>,
  message: A2UIMessage,
): Map<string, A2UISurface> {
  const next = new Map(surfaces)

  switch (message.type) {
    case 'surfaceUpdate': {
      const previous = next.get(message.surfaceId)
      next.set(message.surfaceId, {
        id: message.surfaceId,
        components: message.components,
        data: message.data ?? previous?.data ?? {},
        rootId: message.rootId ?? previous?.rootId,
      })
      break
    }
    case 'dataModelUpdate': {
      const previous = next.get(message.surfaceId)
      if (!previous) return next
      next.set(message.surfaceId, {
        ...previous,
        data: mergeData(previous.data, message.data),
      })
      break
    }
    case 'beginRendering': {
      const previous = next.get(message.surfaceId)
      if (!previous) return next
      next.set(message.surfaceId, { ...previous, rootId: message.rootId })
      break
    }
    case 'deleteSurface':
      next.delete(message.surfaceId)
      break
  }

  return next
}

function mergeData(
  previous: Record<string, DataValue>,
  update: Record<string, DataValue>,
): Record<string, DataValue> {
  return { ...previous, ...update }
}

export function serializeAction(action: unknown): string {
  return JSON.stringify({ type: 'userAction', action })
}
