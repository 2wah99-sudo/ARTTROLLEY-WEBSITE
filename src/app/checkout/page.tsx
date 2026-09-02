'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/context/CartContext'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Address {
  fullName: string
  mobile: string
  email: string
  addressLine1: string
  addressLine2: string
  landmark: string
  city: string
  state: string
  pincode: string
  country: string
  saveAddress: boolean
  deliveryNote: string
}

const EMPTY_ADDRESS: Address = {
  fullName: '', mobile: '', email: '',
  addressLine1: '', addressLine2: '', landmark: '',
  city: '', state: '', pincode: '', country: 'India',
  saveAddress: false, deliveryNote: '',
}

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman & Nicobar Islands','Chandigarh','Dadra & Nagar Haveli and Daman & Diu',
  'Delhi','Jammu & Kashmir','Ladakh','Lakshadweep','Puducherry',
]

const SHIPPING_THRESHOLD = 5000
const SHIPPING_COST      = 150

function formatPrice(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

function buildWhatsAppMessage(
  items: { name: string; size: string; quantity: number; price: number }[],
  total: number,
  shipping: number,
  address: Address,
) {
  const lines = items.map(
    (i) => `• ${i.name} (${i.size}) × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`
  )
  const msg = [
    `*New Order — Arttrolley*`,
    ``,
    `*Items:*`,
    ...lines,
    ``,
    `*Subtotal:* ${formatPrice(total)}`,
    `*Shipping:* ${shipping === 0 ? 'Free' : formatPrice(shipping)}`,
    `*Order Total:* ${formatPrice(total + shipping)}`,
    ``,
    `*Delivery Address:*`,
    `Name: ${address.fullName}`,
    `Mobile: ${address.mobile}`,
    `Email: ${address.email}`,
    `Address: ${address.addressLine1}${address.addressLine2 ? ', ' + address.addressLine2 : ''}`,
    address.landmark ? `Landmark: ${address.landmark}` : null,
    `City: ${address.city}`,
    `State: ${address.state} — ${address.pincode}`,
    `Country: ${address.country}`,
    address.deliveryNote ? `Note: ${address.deliveryNote}` : null,
  ].filter(Boolean).join('\n')
  // TODO: replace with real WhatsApp number before launch
  return `https://wa.me/919999999999?text=${encodeURIComponent(msg)}`
}

function buildEmailBody(
  items: { name: string; size: string; quantity: number; price: number }[],
  total: number,
  shipping: number,
  address: Address,
) {
  const lines = items.map(
    (i) => `${i.name} (${i.size}) × ${i.quantity} — ${formatPrice(i.price * i.quantity)}`
  ).join('\n')
  return `mailto:2wah99@gmail.com?subject=${encodeURIComponent(`New Order — ${address.fullName}`)}&body=${encodeURIComponent(
    `Items:\n${lines}\n\nSubtotal: ${formatPrice(total)}\nShipping: ${shipping === 0 ? 'Free' : formatPrice(shipping)}\nTotal: ${formatPrice(total + shipping)}\n\nDeliver to:\n${address.fullName}\n${address.mobile} / ${address.email}\n${address.addressLine1}${address.addressLine2 ? '\n' + address.addressLine2 : ''}${address.landmark ? '\nNear ' + address.landmark : ''}\n${address.city}, ${address.state} — ${address.pincode}\n${address.country}${address.deliveryNote ? '\n\nNote: ' + address.deliveryNote : ''}`
  )}`
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function Steps({ current }: { current: number }) {
  const steps = ['Bag', 'Delivery', 'Review']
  return (
    <div className="flex items-center gap-0 mb-12">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-sans font-medium transition-colors duration-500 ${
              i < current ? 'bg-gold text-ink' :
              i === current ? 'border border-gold text-gold' :
              'border border-parchment/20 text-parchment/30'
            }`}>
              {i < current ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : i + 1}
            </div>
            <span className={`label text-xs transition-colors duration-500 ${
              i === current ? 'text-parchment' : i < current ? 'text-gold/70' : 'text-parchment/30'
            }`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 md:w-20 h-px mx-3 transition-colors duration-500 ${i < current ? 'bg-gold/40' : 'bg-parchment/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Field component ──────────────────────────────────────────────────────────
function Field({
  label, name, value, onChange, type = 'text', required = false,
  placeholder, as, options, error,
}: {
  label: string; name: keyof Address; value: string; onChange: (k: keyof Address, v: string) => void
  type?: string; required?: boolean; placeholder?: string; as?: 'textarea' | 'select'
  options?: string[]; error?: string
}) {
  const base = `w-full bg-transparent border-b py-3 font-sans text-sm text-parchment placeholder-parchment/25 outline-none focus:border-gold transition-colors duration-300 ${
    error ? 'border-clay' : 'border-parchment/20'
  }`
  return (
    <div className="space-y-1">
      <label className="label text-parchment/50 text-xs">{label}{required && <span className="text-clay ml-0.5">*</span>}</label>
      {as === 'select' ? (
        <select value={value} onChange={(e) => onChange(name, e.target.value)}
          className={`${base} bg-ink appearance-none cursor-pointer`}>
          <option value="">Select state</option>
          {options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : as === 'textarea' ? (
        <textarea value={value} onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder} rows={2}
          className={`${base} resize-none`} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder} required={required}
          className={base} />
      )}
      {error && <p className="font-sans text-xs text-clay">{error}</p>}
    </div>
  )
}

// ─── Main checkout page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, total, count, remove, setQty, clear } = useCart()
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS)
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({})
  const [ordered, setOrdered] = useState(false)

  const shipping = total >= SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_COST
  const grandTotal = total + shipping

  // Restore saved address
  useEffect(() => {
    try {
      const saved = localStorage.getItem('arttrolley_address_v1')
      if (saved) setAddress({ ...EMPTY_ADDRESS, ...JSON.parse(saved), saveAddress: true })
    } catch { /* noop */ }
  }, [])

  function setField(key: keyof Address, value: string) {
    setAddress((a) => ({ ...a, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validateAddress(): boolean {
    const e: Partial<Record<keyof Address, string>> = {}
    if (!address.fullName.trim())     e.fullName     = 'Required'
    if (!address.mobile.trim())       e.mobile       = 'Required'
    else if (!/^[6-9]\d{9}$/.test(address.mobile.replace(/\s/g, '')))
                                      e.mobile       = 'Enter a valid 10-digit Indian mobile number'
    if (!address.email.trim())        e.email        = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address.email))
                                      e.email        = 'Enter a valid email address'
    if (!address.addressLine1.trim()) e.addressLine1 = 'Required'
    if (!address.city.trim())         e.city         = 'Required'
    if (!address.state)               e.state        = 'Required'
    if (!address.pincode.trim())      e.pincode      = 'Required'
    else if (!/^\d{6}$/.test(address.pincode.trim()))
                                      e.pincode      = 'Enter a valid 6-digit pincode'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleAddressNext() {
    if (validateAddress()) {
      if (address.saveAddress) {
        try { localStorage.setItem('arttrolley_address_v1', JSON.stringify(address)) } catch { /* noop */ }
      } else {
        try { localStorage.removeItem('arttrolley_address_v1') } catch { /* noop */ }
      }
      setStep(2)
      window.scrollTo(0, 0)
    }
  }

  function handlePlaceOrder(method: 'whatsapp' | 'email') {
    setOrdered(true)
    clear()
    if (method === 'whatsapp') {
      window.open(buildWhatsAppMessage(items, total, shipping, address), '_blank', 'noopener')
    } else {
      window.location.href = buildEmailBody(items, total, shipping, address)
    }
  }

  if (count === 0 && !ordered) {
    return (
      <main className="bg-ink min-h-screen">
        <Nav />
        <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-6 text-center">
          <p className="font-serif text-2xl font-light text-parchment/60">Your bag is empty.</p>
          <a href="/collection" className="label text-gold border-b border-gold/40 hover:border-gold pb-0.5 transition-colors duration-300">
            Browse the Collection
          </a>
        </div>
        <Footer />
      </main>
    )
  }

  if (ordered) {
    return (
      <main className="bg-ink min-h-screen">
        <Nav />
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6 text-center">
          <div className="w-14 h-14 rounded-full border border-gold/40 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l4 4 10-10" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h1 className="font-serif text-3xl font-light text-parchment mb-3">Order Received</h1>
            <p className="font-sans text-sm text-parchment/50 max-w-[40ch] leading-relaxed">
              Your order has been sent to our team. We'll confirm availability and share payment details within 24 hours.
            </p>
          </div>
          <div className="border border-parchment/10 p-6 max-w-xs w-full text-left space-y-3">
            <p className="label text-parchment/40 text-xs">Delivering to</p>
            <p className="font-sans text-sm text-parchment">{address.fullName}</p>
            <p className="font-sans text-xs text-parchment/50 leading-relaxed">
              {address.addressLine1}{address.addressLine2 ? ', ' + address.addressLine2 : ''}<br/>
              {address.city}, {address.state} — {address.pincode}
            </p>
            <p className="font-sans text-xs text-parchment/40">{address.mobile} · {address.email}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <a href="/collection" className="label text-parchment/50 hover:text-gold transition-colors duration-300 border-b border-transparent hover:border-gold pb-0.5">
              Continue Shopping
            </a>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="bg-ink min-h-screen">
      <Nav />

      <div className="max-w-[1200px] mx-auto px-6 md:px-10 pt-32 pb-24">
        {/* Back link */}
        <a href="/collection" className="label text-parchment/40 hover:text-parchment/70 transition-colors duration-300 mb-10 block">
          ← Continue Shopping
        </a>

        <h1 className="font-serif text-2xl md:text-3xl font-light text-parchment mb-10">Checkout</h1>

        <Steps current={step} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 lg:gap-20">

          {/* ── Left panel ── */}
          <div>

            {/* STEP 0 — Bag review */}
            {step === 0 && (
              <div>
                <h2 className="font-serif text-xl font-light text-parchment mb-8">Your Bag</h2>
                <ul className="divide-y divide-parchment/8">
                  {items.map((item) => (
                    <li key={`${item.slug}::${item.size}`} className="py-6 flex gap-5">
                      <div className="w-20 h-24 shrink-0 overflow-hidden bg-ink/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a href={`/collection/${item.slug}`} className="font-serif font-light text-parchment hover:text-gold transition-colors duration-300">
                          {item.name}
                        </a>
                        <p className="label mt-1 text-parchment/40 text-xs">Size: {item.size}</p>
                        <p className="font-sans text-sm text-gold/80 mt-2">{formatPrice(item.price)}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <button type="button" onClick={() => setQty(item.slug, item.size, item.quantity - 1)}
                            className="w-7 h-7 border border-parchment/20 text-parchment/50 hover:border-gold hover:text-gold transition-colors duration-300 flex items-center justify-center focus-visible:outline-none">−</button>
                          <span className="font-sans text-sm text-parchment w-4 text-center">{item.quantity}</span>
                          <button type="button" onClick={() => setQty(item.slug, item.size, item.quantity + 1)}
                            className="w-7 h-7 border border-parchment/20 text-parchment/50 hover:border-gold hover:text-gold transition-colors duration-300 flex items-center justify-center focus-visible:outline-none">+</button>
                          <button type="button" onClick={() => remove(item.slug, item.size)}
                            className="ml-auto label text-parchment/30 hover:text-clay transition-colors duration-300 text-xs focus-visible:outline-none">Remove</button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                  <div>
                    {shipping > 0 && (
                      <p className="font-sans text-xs text-parchment/40">
                        Add {formatPrice(SHIPPING_THRESHOLD - total)} more for free shipping
                      </p>
                    )}
                    {shipping === 0 && total > 0 && (
                      <p className="label text-gold/70 text-xs">✓ Free shipping on this order</p>
                    )}
                  </div>
                  <button type="button" onClick={() => { setStep(1); window.scrollTo(0,0) }}
                    className="w-full sm:w-auto bg-parchment text-ink label px-12 py-4 hover:bg-gold transition-colors duration-500 focus-visible:outline-none focus-visible:bg-gold">
                    Continue to Delivery →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1 — Delivery address */}
            {step === 1 && (
              <div>
                <h2 className="font-serif text-xl font-light text-parchment mb-8">Delivery Address</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleAddressNext() }}
                  noValidate className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Full Name" name="fullName" value={address.fullName} onChange={setField} required placeholder="As on ID / package label" error={errors.fullName} />
                    <Field label="Mobile Number" name="mobile" value={address.mobile} onChange={setField} required type="tel" placeholder="10-digit mobile" error={errors.mobile} />
                  </div>

                  <Field label="Email Address" name="email" value={address.email} onChange={setField} required type="email" placeholder="For order updates" error={errors.email} />

                  <Field label="Address Line 1" name="addressLine1" value={address.addressLine1} onChange={setField} required placeholder="Flat / House no., Building, Street" error={errors.addressLine1} />
                  <Field label="Address Line 2" name="addressLine2" value={address.addressLine2} onChange={setField} placeholder="Area, Colony, Road (optional)" />
                  <Field label="Landmark" name="landmark" value={address.landmark} onChange={setField} placeholder="Near school / hospital / metro (optional)" />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Field label="City" name="city" value={address.city} onChange={setField} required placeholder="City" error={errors.city} />
                    <Field label="State" name="state" value={address.state} onChange={setField} required as="select" options={INDIAN_STATES} error={errors.state} />
                    <Field label="Pincode" name="pincode" value={address.pincode} onChange={setField} required type="text" placeholder="6-digit PIN" error={errors.pincode} />
                  </div>

                  <Field label="Country" name="country" value={address.country} onChange={setField} placeholder="India" />

                  <Field label="Delivery Note" name="deliveryNote" value={address.deliveryNote} onChange={setField} as="textarea" placeholder="Special instructions for delivery (optional)" />

                  {/* Save address */}
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setAddress((a) => ({ ...a, saveAddress: !a.saveAddress }))}
                      className={`w-5 h-5 border flex items-center justify-center flex-shrink-0 transition-colors duration-300 cursor-pointer ${
                        address.saveAddress ? 'border-gold bg-gold/20' : 'border-parchment/25 group-hover:border-parchment/50'
                      }`}
                    >
                      {address.saveAddress && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#C4A882" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="font-sans text-sm text-parchment/60">Save this address for next time</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button type="button" onClick={() => setStep(0)}
                      className="label text-parchment/40 hover:text-parchment/70 transition-colors duration-300 focus-visible:outline-none">
                      ← Back to Bag
                    </button>
                    <button type="submit"
                      className="w-full sm:w-auto bg-parchment text-ink label px-12 py-4 hover:bg-gold transition-colors duration-500 focus-visible:outline-none focus-visible:bg-gold">
                      Review Order →
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 2 — Review & place order */}
            {step === 2 && (
              <div>
                <h2 className="font-serif text-xl font-light text-parchment mb-8">Review Your Order</h2>

                {/* Items summary */}
                <div className="border border-parchment/10 mb-8">
                  <div className="px-6 py-4 border-b border-parchment/10 flex justify-between items-center">
                    <span className="label text-parchment/50">Items ({count})</span>
                    <button type="button" onClick={() => setStep(0)}
                      className="label text-gold/60 hover:text-gold transition-colors duration-300 text-xs focus-visible:outline-none">Edit</button>
                  </div>
                  <ul className="divide-y divide-parchment/8">
                    {items.map((item) => (
                      <li key={`${item.slug}::${item.size}`} className="px-6 py-4 flex items-center gap-4">
                        <div className="w-12 h-14 shrink-0 overflow-hidden bg-ink/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm text-parchment truncate">{item.name}</p>
                          <p className="label text-parchment/40 text-xs mt-0.5">Size: {item.size} · Qty: {item.quantity}</p>
                        </div>
                        <span className="font-sans text-sm text-parchment/80 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Address summary */}
                <div className="border border-parchment/10 mb-8">
                  <div className="px-6 py-4 border-b border-parchment/10 flex justify-between items-center">
                    <span className="label text-parchment/50">Deliver to</span>
                    <button type="button" onClick={() => setStep(1)}
                      className="label text-gold/60 hover:text-gold transition-colors duration-300 text-xs focus-visible:outline-none">Edit</button>
                  </div>
                  <div className="px-6 py-5 space-y-1">
                    <p className="font-sans text-sm text-parchment font-medium">{address.fullName}</p>
                    <p className="font-sans text-sm text-parchment/70">
                      {address.addressLine1}{address.addressLine2 ? ', ' + address.addressLine2 : ''}
                      {address.landmark ? `, Near ${address.landmark}` : ''}
                    </p>
                    <p className="font-sans text-sm text-parchment/70">{address.city}, {address.state} — {address.pincode}</p>
                    <p className="font-sans text-sm text-parchment/70">{address.country}</p>
                    <div className="pt-2 flex gap-6">
                      <span className="font-sans text-xs text-parchment/40">{address.mobile}</span>
                      <span className="font-sans text-xs text-parchment/40">{address.email}</span>
                    </div>
                    {address.deliveryNote && (
                      <p className="font-sans text-xs text-gold/60 pt-1">Note: {address.deliveryNote}</p>
                    )}
                  </div>
                </div>

                {/* Delivery timeline */}
                <div className="border border-parchment/10 px-6 py-5 mb-8 space-y-3">
                  <span className="label text-parchment/50">Estimated Delivery</span>
                  <p className="font-sans text-sm text-parchment/80">
                    5–7 business days from confirmation — all pieces are handmade in Bagru, Rajasthan and carefully packed before dispatch.
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    {[
                      { label: 'Confirmation', detail: 'Within 24 hrs' },
                      { label: 'Dispatch',     detail: '2–3 business days' },
                      { label: 'Delivery',     detail: '5–7 business days' },
                    ].map((s) => (
                      <div key={s.label} className="text-center">
                        <p className="label text-gold/60 text-xs mb-1">{s.label}</p>
                        <p className="font-sans text-xs text-parchment/50">{s.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Place order */}
                <div className="space-y-4">
                  <p className="font-sans text-xs text-parchment/40 leading-relaxed">
                    We're a small studio — orders are confirmed over WhatsApp or email, and payment details (UPI / bank transfer) will be shared once our team confirms availability.
                  </p>

                  <button type="button" onClick={() => handlePlaceOrder('whatsapp')}
                    className="w-full bg-[#25D366] text-white label py-4 hover:bg-[#1ebe5a] transition-colors duration-500 flex items-center justify-center gap-3 focus-visible:outline-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Place Order via WhatsApp
                  </button>

                  <button type="button" onClick={() => handlePlaceOrder('email')}
                    className="w-full border border-parchment/20 text-parchment/60 label py-4 hover:border-gold hover:text-gold transition-colors duration-500 focus-visible:outline-none">
                    Place Order via Email Instead
                  </button>
                </div>

                <div className="mt-8 pt-8 border-t border-parchment/10 space-y-3">
                  <p className="label text-parchment/30 text-xs">Policies</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans text-parchment/40">
                    <div>
                      <p className="text-parchment/60 mb-1 font-medium">Returns</p>
                      <p>Exchange within 7 days of delivery. Handmade pieces may vary slightly from images — this is the beauty of craft.</p>
                    </div>
                    <div>
                      <p className="text-parchment/60 mb-1 font-medium">Payment</p>
                      <p>We accept UPI, NEFT/IMPS, and bank transfer. Payment details shared after confirmation.</p>
                    </div>
                    <div>
                      <p className="text-parchment/60 mb-1 font-medium">Shipping</p>
                      <p>Free on orders above ₹5,000. Shipped via Blue Dart / Delhivery with full tracking.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ── Right panel — Order summary ── */}
          <div>
            <div className="sticky top-28 border border-parchment/10">
              <div className="px-6 py-5 border-b border-parchment/10">
                <h3 className="label text-parchment/50">Order Summary</h3>
              </div>

              <div className="px-6 py-5 space-y-4">
                {items.map((item) => (
                  <div key={`${item.slug}::${item.size}`} className="flex items-start gap-3">
                    <div className="w-10 h-12 shrink-0 overflow-hidden bg-ink/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-sans text-xs text-parchment leading-tight truncate">{item.name}</p>
                      <p className="label text-parchment/40 text-xs">Size {item.size} · ×{item.quantity}</p>
                    </div>
                    <span className="font-sans text-xs text-parchment/70 shrink-0">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="px-6 py-5 border-t border-parchment/10 space-y-3">
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-parchment/50">Subtotal</span>
                  <span className="text-parchment/80">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm font-sans">
                  <span className="text-parchment/50">Shipping</span>
                  <span className={shipping === 0 ? 'text-gold/70' : 'text-parchment/80'}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="font-sans text-xs text-parchment/30">
                    Free shipping on orders above {formatPrice(SHIPPING_THRESHOLD)}
                  </p>
                )}
                <div className="pt-3 border-t border-parchment/10 flex justify-between">
                  <span className="label text-parchment">Total</span>
                  <span className="font-serif text-lg text-parchment">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <div className="px-6 pb-6 space-y-2">
                <div className="flex items-center gap-2 text-parchment/30">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1l1.236 2.505L10 3.91l-2 1.949.472 2.751L6 7.25 3.528 8.61 4 5.859 2 3.91l2.764-.405L6 1z" fill="currentColor"/>
                  </svg>
                  <span className="font-sans text-xs">100% natural dyes</span>
                </div>
                <div className="flex items-center gap-2 text-parchment/30">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1l1.236 2.505L10 3.91l-2 1.949.472 2.751L6 7.25 3.528 8.61 4 5.859 2 3.91l2.764-.405L6 1z" fill="currentColor"/>
                  </svg>
                  <span className="font-sans text-xs">Hand-crafted in Bagru, Rajasthan</span>
                </div>
                <div className="flex items-center gap-2 text-parchment/30">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M6 1l1.236 2.505L10 3.91l-2 1.949.472 2.751L6 7.25 3.528 8.61 4 5.859 2 3.91l2.764-.405L6 1z" fill="currentColor"/>
                  </svg>
                  <span className="font-sans text-xs">Tracked shipping · 5–7 days</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  )
}
