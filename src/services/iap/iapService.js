// IAP service layer — isolates all purchase logic from UI screens.
// Wire react-native-iap SDK calls here when dependency is added.

let subscriptionActive = false;

export const IAPService = {
  // Initialize billing connection and fetch available products
  initialize: async () => {
    // TODO: initConnection() + getSubscriptions() when SDK is integrated
  },

  // Purchase a subscription product by SKU
  purchaseSubscription: async _productId => {
    // TODO: requestSubscription() implementation
    return {success: false, error: 'IAP not configured'};
  },

  // Restore previously purchased subscriptions
  restorePurchases: async () => {
    // TODO: getAvailablePurchases() implementation
    return [];
  },

  // Check if user has an active ad-free subscription
  isSubscribed: () => subscriptionActive,

  // Update subscription status after server-side or receipt validation
  setSubscriptionStatus: active => {
    subscriptionActive = active;
  },

  // Clean up billing connection on app unmount
  disconnect: async () => {
    // TODO: endConnection() when SDK is integrated
  },
};
