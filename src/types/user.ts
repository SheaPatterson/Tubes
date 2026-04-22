export type SubscriptionTier = 'free' | 'classic' | 'next_gen';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  tier: SubscriptionTier;
  createdAt: number;
  lastLoginAt: number;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: SubscriptionTier;
  status: 'active' | 'past_due' | 'cancelled';
  currentPeriodEnd: number;
  paymentMethod: 'credit_card' | 'paypal';
}
