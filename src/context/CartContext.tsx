'use client'

import { createContext, useContext, useEffect, useReducer } from 'react'

export interface CartItem {
  slug: string
  name: string
  price: number
  size: string
  img: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  open: boolean
}

type CartAction =
  | { type: 'ADD'; item: CartItem }
  | { type: 'REMOVE'; slug: string; size: string }
  | { type: 'SET_QTY'; slug: string; size: string; qty: number }
  | { type: 'CLEAR' }
  | { type: 'TOGGLE' }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'HYDRATE'; items: CartItem[] }

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const key = `${action.item.slug}::${action.item.size}`
      const exists = state.items.find((i) => `${i.slug}::${i.size}` === key)
      const items = exists
        ? state.items.map((i) =>
            `${i.slug}::${i.size}` === key ? { ...i, quantity: i.quantity + 1 } : i
          )
        : [...state.items, { ...action.item, quantity: 1 }]
      return { ...state, items, open: true }
    }
    case 'REMOVE': {
      const key = `${action.slug}::${action.size}`
      return { ...state, items: state.items.filter((i) => `${i.slug}::${i.size}` !== key) }
    }
    case 'SET_QTY': {
      const key = `${action.slug}::${action.size}`
      if (action.qty <= 0) {
        return { ...state, items: state.items.filter((i) => `${i.slug}::${i.size}` !== key) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          `${i.slug}::${i.size}` === key ? { ...i, quantity: action.qty } : i
        ),
      }
    }
    case 'CLEAR': return { ...state, items: [] }
    case 'TOGGLE': return { ...state, open: !state.open }
    case 'OPEN':   return { ...state, open: true }
    case 'CLOSE':  return { ...state, open: false }
    case 'HYDRATE': return { ...state, items: action.items }
    default:       return state
  }
}

const STORAGE_KEY = 'arttrolley_cart_v1'

interface CartContextValue {
  items: CartItem[]
  open: boolean
  total: number
  count: number
  add: (item: Omit<CartItem, 'quantity'>) => void
  remove: (slug: string, size: string) => void
  setQty: (slug: string, size: string, qty: number) => void
  clear: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Always start with empty state for SSR/hydration consistency.
  // localStorage is loaded in a useEffect after mount so server and client
  // initial renders always match (fixing the [0] vs [1] hydration mismatch).
  const [state, dispatch] = useReducer(cartReducer, { items: [], open: false })

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch({ type: 'HYDRATE', items: parsed })
        }
      }
    } catch { /* noop */ }
  }, [])

  // Persist to localStorage whenever items change
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items)) } catch { /* noop */ }
  }, [state.items])

  const total = state.items.reduce((s, i) => s + i.price * i.quantity, 0)
  const count = state.items.reduce((s, i) => s + i.quantity, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      open: state.open,
      total,
      count,
      add:        (item) => dispatch({ type: 'ADD', item: { ...item, quantity: 1 } }),
      remove:     (slug, size) => dispatch({ type: 'REMOVE', slug, size }),
      setQty:     (slug, size, qty) => dispatch({ type: 'SET_QTY', slug, size, qty }),
      clear:      () => dispatch({ type: 'CLEAR' }),
      toggleCart: () => dispatch({ type: 'TOGGLE' }),
      openCart:   () => dispatch({ type: 'OPEN' }),
      closeCart:  () => dispatch({ type: 'CLOSE' }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
