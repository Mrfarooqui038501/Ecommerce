import { loadStripe } from '@stripe/stripe-js';

// Make sure this exactly matches your .env file variable
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

if (!process.env.REACT_APP_STRIPE_PUBLIC_KEY) {
  console.error('Stripe public key is not configured in environment variables');
}

export default stripePromise;
