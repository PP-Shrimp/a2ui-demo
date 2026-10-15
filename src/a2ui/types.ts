export type Primitive = string | number | boolean | null
export type DataValue = Primitive | DataValue[] | { [key: string]: DataValue }

export type A2UIComponentType =
  | 'root'
  | 'text'
  | 'heading'
  | 'textField'
  | 'passwordField'
  | 'button'
  | 'card'
  | 'productCard'
  | 'productGrid'
  | 'row'
  | 'column'
  | 'divider'
  | 'status'

export interface ComponentBase {
  id: string
  type: A2UIComponentType
  visible?: boolean
  className?: string
}

export interface RootComponent extends ComponentBase {
  type: 'root' | 'card' | 'row' | 'column' | 'productGrid'
  children?: string[]
}

export interface TextComponent extends ComponentBase {
  type: 'text' | 'heading' | 'status'
  text: string
  tone?: 'default' | 'muted' | 'success' | 'warning' | 'danger'
}

export interface TextFieldComponent extends ComponentBase {
  type: 'textField' | 'passwordField'
  label: string
  name: string
  placeholder?: string
  required?: boolean
  autocomplete?: string
  valuePath?: string
}

export interface ButtonComponent extends ComponentBase {
  type: 'button'
  label: string
  action: string
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger'
  disabled?: boolean
}

export interface ProductCardComponent extends ComponentBase {
  type: 'productCard'
  productId: string
  name: string
  description?: string
  price: number | string
  imageUrl?: string
  action?: string
  actionLabel?: string
}

export interface DividerComponent extends ComponentBase {
  type: 'divider'
}

export type A2UIComponent =
  | RootComponent
  | TextComponent
  | TextFieldComponent
  | ButtonComponent
  | ProductCardComponent
  | DividerComponent

export interface SurfaceUpdateMessage {
  type: 'surfaceUpdate'
  surfaceId: string
  components: A2UIComponent[]
  data?: Record<string, DataValue>
  rootId?: string
}

export interface DataModelUpdateMessage {
  type: 'dataModelUpdate'
  surfaceId: string
  data: Record<string, DataValue>
}

export interface BeginRenderingMessage {
  type: 'beginRendering'
  surfaceId: string
  rootId: string
}

export interface DeleteSurfaceMessage {
  type: 'deleteSurface'
  surfaceId: string
}

export type A2UIMessage =
  | SurfaceUpdateMessage
  | DataModelUpdateMessage
  | BeginRenderingMessage
  | DeleteSurfaceMessage

export interface A2UISurface {
  id: string
  components: A2UIComponent[]
  data: Record<string, DataValue>
  rootId?: string
}

export interface A2UIActionEvent {
  type: 'userAction'
  surfaceId: string
  componentId: string
  action: string
  data: Record<string, DataValue>
  values: Record<string, string>
  timestamp: string
}

export interface A2UIModelResponse {
  type: 'modelResponse'
  messages: A2UIMessage[]
}

export function isA2UIMessage(value: unknown): value is A2UIMessage {
  if (!value || typeof value !== 'object' || !('type' in value)) return false
  return [
    'surfaceUpdate',
    'dataModelUpdate',
    'beginRendering',
    'deleteSurface',
  ].includes((value as { type: string }).type)
}
