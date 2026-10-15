import { useMemo, useState } from 'react'
import type {
  A2UIActionEvent,
  A2UIComponent,
  A2UISurface,
  DataValue,
  ProductCardComponent,
  RootComponent,
  TextComponent,
  TextFieldComponent,
} from './types'

interface A2UIRendererProps {
  surface: A2UISurface
  onAction: (action: A2UIActionEvent) => void
}

export function A2UIRenderer({ surface, onAction }: A2UIRendererProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const components = useMemo(
    () => new Map(surface.components.map((component) => [component.id, component])),
    [surface.components],
  )
  const root = surface.rootId ? components.get(surface.rootId) : surface.components[0]

  if (!root) return null

  const dispatch = (component: A2UIComponent, action: string, data: Record<string, DataValue> = {}) => {
    onAction({
      type: 'userAction',
      surfaceId: surface.id,
      componentId: component.id,
      action,
      values,
      data,
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <section className="a2ui-surface" aria-label={`A2UI surface ${surface.id}`}>
      <form onSubmit={(event) => event.preventDefault()}>
        {renderComponent(root, components, surface.data, values, setValues, dispatch)}
      </form>
    </section>
  )
}

function renderComponent(
  component: A2UIComponent,
  components: Map<string, A2UIComponent>,
  data: Record<string, DataValue>,
  values: Record<string, string>,
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  dispatch: (component: A2UIComponent, action: string, data?: Record<string, DataValue>) => void,
): React.ReactNode {
  if (component.visible === false) return null

  switch (component.type) {
    case 'root':
    case 'card':
    case 'row':
    case 'column':
    case 'productGrid':
      return (
        <div className={`a2ui-${component.type}`} key={component.id}>
          {renderChildren(component, components, data, values, setValues, dispatch)}
        </div>
      )
    case 'heading':
      return <h2 className="a2ui-heading" key={component.id}>{component.text}</h2>
    case 'text':
      return <p className="a2ui-text" key={component.id}>{component.text}</p>
    case 'status':
      return <p className={`a2ui-status a2ui-status-${component.tone ?? 'default'}`} key={component.id}>{component.text}</p>
    case 'textField':
    case 'passwordField':
      return renderField(component, data, values, setValues)
    case 'button':
      return (
        <button
          className={`a2ui-button a2ui-button-${component.variant ?? 'primary'}`}
          disabled={component.disabled}
          key={component.id}
          onClick={() => dispatch(component, component.action)}
          type="button"
        >
          {component.label}
        </button>
      )
    case 'productCard':
      return renderProductCard(component, dispatch)
    case 'divider':
      return <hr className="a2ui-divider" key={component.id} />
  }
}

function renderChildren(
  component: RootComponent,
  components: Map<string, A2UIComponent>,
  data: Record<string, DataValue>,
  values: Record<string, string>,
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
  dispatch: (component: A2UIComponent, action: string, data?: Record<string, DataValue>) => void,
) {
  return component.children?.map((childId) => {
    const child = components.get(childId)
    return child
      ? renderComponent(child, components, data, values, setValues, dispatch)
      : <span className="a2ui-error" key={childId}>缺少组件：{childId}</span>
  })
}

function renderField(
  component: TextFieldComponent,
  data: Record<string, DataValue>,
  values: Record<string, string>,
  setValues: React.Dispatch<React.SetStateAction<Record<string, string>>>,
) {
  const inputType = component.type === 'passwordField' ? 'password' : 'text'
  const boundValue = component.valuePath ? resolveDataPath(data, component.valuePath) : undefined
  const value = values[component.name] ?? (typeof boundValue === 'string' ? boundValue : '')
  return (
    <label className="a2ui-field" key={component.id}>
      <span>{component.label}{component.required ? <em> *</em> : null}</span>
      <input
        autoComplete={component.autocomplete}
        id={component.id}
        name={component.name}
        onChange={(event) => setValues((current) => ({ ...current, [component.name]: event.target.value }))}
        placeholder={component.placeholder}
        required={component.required}
        type={inputType}
        value={value}
      />
    </label>
  )
}

function resolveDataPath(data: Record<string, DataValue>, path: string): DataValue | undefined {
  return path.split('.').reduce<DataValue | undefined>((current, segment) => {
    if (!current || typeof current !== 'object' || Array.isArray(current)) return undefined
    return current[segment]
  }, data)
}

function renderProductCard(
  component: ProductCardComponent,
  dispatch: (component: A2UIComponent, action: string, data?: Record<string, DataValue>) => void,
) {
  const action = component.action ?? 'product.select'
  return (
    <article className="a2ui-product-card" key={component.id}>
      {component.imageUrl ? <img alt="" src={component.imageUrl} /> : <div className="a2ui-product-image" aria-hidden="true">🍽️</div>}
      <div className="a2ui-product-content">
        <h3>{component.name}</h3>
        {component.description ? <p>{component.description}</p> : null}
        <div className="a2ui-product-footer">
          <strong>¥{component.price}</strong>
          <button
            className="a2ui-button a2ui-button-secondary"
            onClick={() => dispatch(component, action, {
              productId: component.productId,
              name: component.name,
              price: component.price,
            })}
            type="button"
          >
            {component.actionLabel ?? '选择'}
          </button>
        </div>
      </div>
    </article>
  )
}
