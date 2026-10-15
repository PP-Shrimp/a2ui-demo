import { applyA2UIMessage, parseA2UIResponse } from './protocol'
import type {
  A2UIActionEvent,
  A2UIMessage,
  A2UISurface,
  DataValue,
} from './types'

export type ModelActionSender = (action: A2UIActionEvent) => void
export type SurfaceListener = (surfaces: A2UISurface[]) => void

/**
 * DSH 宿主适配器。宿主收到模型响应时调用 receive，组件产生操作时调用 dispatch。
 */
export class DshA2UIPlugin {
  private surfaces = new Map<string, A2UISurface>()
  private readonly listeners = new Set<SurfaceListener>()

  constructor(private readonly sendAction: ModelActionSender) {}

  receive(input: unknown): void {
    for (const message of parseA2UIResponse(input)) {
      this.surfaces = applyA2UIMessage(this.surfaces, message)
    }
    this.notify()
  }

  receiveMessage(message: A2UIMessage): void {
    this.surfaces = applyA2UIMessage(this.surfaces, message)
    this.notify()
  }

  dispatch(
    surfaceId: string,
    componentId: string,
    action: string,
    values: Record<string, string> = {},
    data: Record<string, DataValue> = {},
  ): void {
    this.sendAction({
      type: 'userAction',
      surfaceId,
      componentId,
      action,
      values,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  getSurfaces(): A2UISurface[] {
    return [...this.surfaces.values()]
  }

  subscribe(listener: SurfaceListener): () => void {
    this.listeners.add(listener)
    listener(this.getSurfaces())
    return () => this.listeners.delete(listener)
  }

  private notify(): void {
    const current = this.getSurfaces()
    for (const listener of this.listeners) listener(current)
  }
}
