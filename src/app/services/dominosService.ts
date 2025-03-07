// Client-side service for interacting with the Dominos API through our server-side API route

// Types
export interface Store {
  store_id: string;
  name: string;
  address: string;
  phone: string;
  distance?: string;
  estimated_delivery_time?: string;
  hours?: string;
}

export interface MenuItem {
  code: string;
  name: string;
  description?: string;
  price?: string;
  category?: string;
  size?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export interface CustomerInfo {
  address: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export interface OrderItem {
  item_id: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  options?: Record<string, Record<string, string>>;
  total: number;
}

export interface OrderData {
  customer: CustomerInfo;
  store_id: string;
  items: OrderItem[];
}

export interface PaymentData {
  amount: number;
  card_number: string;
  expiry_date: string;
  cvv: string;
  postal_code: string;
  tip_amount?: number;
}

// API functions
async function callDominosApi(action: string, params: any) {
  try {
    const response = await fetch('/api/dominos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, params }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error calling Dominos API (${action}):`, error);
    throw error;
  }
}

// Service functions
export async function findNearbyStores(address: string): Promise<Store[]> {
  const result = await callDominosApi('findNearbyStores', { address });
  return result.stores || [];
}

export async function getStoreDetails(storeId: string): Promise<Store> {
  const result = await callDominosApi('getStoreDetails', { store_id: storeId });
  return result.store;
}

export async function getMenu(storeId: string): Promise<MenuCategory[]> {
  const result = await callDominosApi('getMenu', { store_id: storeId });
  return result.menu_categories || [];
}

export async function createOrder(customerInfo: CustomerInfo, storeId: string) {
  const result = await callDominosApi('createOrder', { customer_info: customerInfo, store_id: storeId });
  return result.order;
}

export async function validateOrder(orderData: OrderData) {
  const result = await callDominosApi('validateOrder', { order_data: orderData });
  return result;
}

export async function priceOrder(orderData: OrderData) {
  const result = await callDominosApi('priceOrder', { order_data: orderData });
  return result.price_result;
}

export async function placeOrder(orderData: OrderData, paymentData: PaymentData) {
  const result = await callDominosApi('placeOrder', { order_data: orderData, payment_data: paymentData });
  return result;
}

// Export the service as a default object
const dominosService = {
  findNearbyStores,
  getStoreDetails,
  getMenu,
  createOrder,
  validateOrder,
  priceOrder,
  placeOrder,
};

export default dominosService; 