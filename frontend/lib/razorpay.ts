/**
 * Razorpay Frontend Utilities
 * Dynamically loads the Razorpay Checkout script and wraps it in a Promise.
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

/** Dynamically loads the Razorpay checkout.js script. Returns true on success. */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true); // already loaded

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  /** Razorpay order_id returned from your backend */
  orderId: string;
  /** Amount in paise (₹1 = 100 paise) */
  amount: number;
  /** Currency code, defaults to 'INR' */
  currency?: string;
  /** Human-readable name shown in checkout modal */
  name?: string;
  /** Short description shown under name */
  description?: string;
  /** Pre-fill buyer details */
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  /** Theme color hex */
  themeColor?: string;
  /** Called on payment success with Razorpay response */
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  /** Called when user closes the checkout modal without paying */
  onDismiss?: () => void;
}

/**
 * Opens the Razorpay checkout modal.
 * Returns after the modal is dismissed or payment succeeds (via callbacks).
 */
export async function openRazorpayCheckout(options: RazorpayOptions): Promise<void> {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId || keyId.includes('YOUR_KEY')) {
    throw new Error('Razorpay key not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in frontend/.env.local');
  }

  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Failed to load Razorpay checkout script. Check your internet connection.');
  }

  const rzp = new window.Razorpay({
    key:         keyId,
    order_id:    options.orderId,
    amount:      options.amount,
    currency:    options.currency ?? 'INR',
    name:        options.name        ?? 'CampusConnect',
    description: options.description ?? 'Campus Marketplace Payment',
    image:       '/favicon.ico',
    prefill:     options.prefill ?? {},
    theme:       { color: options.themeColor ?? '#4F8EF7' },
    handler: (response: any) => {
      options.onSuccess({
        razorpay_order_id:   response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature:  response.razorpay_signature,
      });
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) options.onDismiss();
      },
    },
  });

  rzp.open();
}
