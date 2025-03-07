import { NextResponse } from 'next/server';
// @ts-expect-error No type definitions available for dominos
import { NearbyStores, Store, Menu, Customer, Item, Order, Payment } from 'dominos';

// Define interfaces for Dominos API responses
interface DominosStore {
  StoreID: string;
  StoreName?: string;
  AddressDescription?: string;
  Phone?: string;
  IsOnlineCapable: boolean;
  IsDeliveryStore: boolean;
  IsOpen: boolean;
  ServiceIsOpen?: {
    Delivery: boolean;
  };
  MinDistance: number;
  ServiceEstimatedWaitMinutes?: {
    Delivery?: number;
  };
  HoursDescription?: string;
}

interface MenuItem {
  code: string;
  name: string;
  description?: string;
  price?: string;
  category?: string;
  size?: string;
}

interface CustomerInfo {
  address: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface OrderItem {
  item_id: string;
  quantity: number;
  options?: Record<string, Record<string, string>>;
}

interface OrderData {
  customer: CustomerInfo;
  store_id: string;
  items: OrderItem[];
}

interface PaymentData {
  amount: number;
  card_number: string;
  expiry_date: string;
  cvv: string;
  postal_code: string;
  tip_amount?: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, params } = body;

    switch (action) {
      case 'findNearbyStores':
        return await findNearbyStores(params);
      case 'getStoreDetails':
        return await getStoreDetails(params);
      case 'getMenu':
        return await getMenu(params);
      case 'createOrder':
        return await createOrder(params);
      case 'validateOrder':
        return await validateOrder(params);
      case 'priceOrder':
        return await priceOrder(params);
      case 'placeOrder':
        return await placeOrder(params);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in Dominos API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function findNearbyStores({ address }: { address: string }) {
  try {
    const nearbyStores = await new NearbyStores(address);
    
    // Filter for delivery stores that are open
    const deliveryStores = nearbyStores.stores.filter((store: DominosStore) => 
      store.IsOnlineCapable && 
      store.IsDeliveryStore && 
      store.IsOpen && 
      store.ServiceIsOpen?.Delivery
    );
    
    // Sort by distance
    deliveryStores.sort((a: DominosStore, b: DominosStore) => a.MinDistance - b.MinDistance);
    
    // Format the stores for display
    const formattedStores = deliveryStores.map((store: DominosStore) => ({
      store_id: store.StoreID,
      name: store.StoreName || `Domino's Pizza #${store.StoreID}`,
      address: store.AddressDescription || "Address not available",
      phone: store.Phone || "Phone not available",
      distance: `${store.MinDistance.toFixed(1)} miles`,
      estimated_delivery_time: store.ServiceEstimatedWaitMinutes?.Delivery 
        ? `${store.ServiceEstimatedWaitMinutes.Delivery} minutes` 
        : "30-45 minutes",
    }));
    
    return NextResponse.json({ stores: formattedStores });
  } catch (error) {
    console.error('Error finding nearby stores:', error);
    return NextResponse.json({ error: 'Error finding nearby stores' }, { status: 500 });
  }
}

async function getStoreDetails({ store_id }: { store_id: string }) {
  try {
    const store = await new Store(store_id);
    
    // Format the store data
    const formattedStore = {
      store_id,
      name: store.StoreName || `Domino's Pizza #${store_id}`,
      address: store.AddressDescription || "Address not available",
      phone: store.Phone || "Phone not available",
      hours: store.HoursDescription || "Hours not available",
    };
    
    return NextResponse.json({ store: formattedStore });
  } catch (error) {
    console.error('Error getting store details:', error);
    return NextResponse.json({ error: 'Error getting store details' }, { status: 500 });
  }
}

async function getMenu({ store_id }: { store_id: string }) {
  try {
    const menu = await new Menu(store_id);
    
    // Process the menu data
    const categories: Array<{ name: string; items: MenuItem[] }> = [];
    
    // Process preconfigured products if available
    if (menu.menu && menu.menu.preconfiguredProducts) {
      const pizzaItems: MenuItem[] = [];
      const sidesItems: MenuItem[] = [];
      const drinksItems: MenuItem[] = [];
      const dessertsItems: MenuItem[] = [];
      
      // Process each preconfigured product
      Object.entries(menu.menu.preconfiguredProducts).forEach(([code, product]: [string, any]) => {
        const item: MenuItem = {
          code,
          name: product.name,
          description: product.description || menu.menu.shortProductDescriptions?.[code]?.description || "",
          category: product.size?.includes("Liter") ? "Drinks" : 
                   (code.includes("PIZZA") || code.includes("SCREEN") || code.includes("HAND")) ? "Pizzas" :
                   (code.includes("WING") || code.includes("BREAD") || code.includes("CHICK")) ? "Sides" :
                   (code.includes("LAVA") || code.includes("BROWNIE") || code.includes("COOKIE")) ? "Desserts" : "Other",
          size: product.size,
        };
        
        // Add to appropriate category
        if (item.category === "Pizzas") {
          pizzaItems.push(item);
        } else if (item.category === "Sides") {
          sidesItems.push(item);
        } else if (item.category === "Drinks") {
          drinksItems.push(item);
        } else if (item.category === "Desserts") {
          dessertsItems.push(item);
        }
      });
      
      // Add categories with items
      if (pizzaItems.length > 0) {
        categories.push({
          name: "Pizzas",
          items: pizzaItems,
        });
      }
      
      if (sidesItems.length > 0) {
        categories.push({
          name: "Sides",
          items: sidesItems,
        });
      }
      
      if (drinksItems.length > 0) {
        categories.push({
          name: "Drinks",
          items: drinksItems,
        });
      }
      
      if (dessertsItems.length > 0) {
        categories.push({
          name: "Desserts",
          items: dessertsItems,
        });
      }
    }
    
    return NextResponse.json({ menu_categories: categories });
  } catch (error) {
    console.error('Error getting menu:', error);
    return NextResponse.json({ error: 'Error getting menu' }, { status: 500 });
  }
}

async function createOrder({ customer_info, store_id }: { customer_info: CustomerInfo, store_id: string }) {
  try {
    // Create a Dominos Customer
    const customer = new Customer({
      address: customer_info.address,
      firstName: customer_info.firstName,
      lastName: customer_info.lastName,
      phone: customer_info.phone,
      email: customer_info.email,
    });
    
    // Create a Dominos Order
    const order = new Order(customer);
    order.storeID = store_id;
    
    return NextResponse.json({ 
      success: true,
      order: {
        customer: customer,
        order_id: order.orderID || `ORD${Math.floor(Math.random() * 10000)}`,
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Error creating order' }, { status: 500 });
  }
}

async function validateOrder({ order_data }: { order_data: OrderData }) {
  try {
    // Recreate the customer and order from the provided data
    const customer = new Customer({
      address: order_data.customer.address,
      firstName: order_data.customer.firstName,
      lastName: order_data.customer.lastName,
      phone: order_data.customer.phone,
      email: order_data.customer.email,
    });
    
    const order = new Order(customer);
    order.storeID = order_data.store_id;
    
    // Add items to the order
    order_data.items.forEach(item => {
      const dominosItem = new Item({
        code: item.item_id,
        options: item.options || {},
        quantity: item.quantity,
      });
      
      order.addItem(dominosItem);
    });
    
    // Validate the order
    await order.validate();
    
    return NextResponse.json({ 
      success: true,
      validation_result: order.validationResponse,
    });
  } catch (error: any) {
    console.error('Error validating order:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error validating order',
      error_details: error.message,
    });
  }
}

async function priceOrder({ order_data }: { order_data: OrderData }) {
  try {
    // Recreate the customer and order from the provided data
    const customer = new Customer({
      address: order_data.customer.address,
      firstName: order_data.customer.firstName,
      lastName: order_data.customer.lastName,
      phone: order_data.customer.phone,
      email: order_data.customer.email,
    });
    
    const order = new Order(customer);
    order.storeID = order_data.store_id;
    
    // Add items to the order
    order_data.items.forEach(item => {
      const dominosItem = new Item({
        code: item.item_id,
        options: item.options || {},
        quantity: item.quantity,
      });
      
      order.addItem(dominosItem);
    });
    
    // Price the order
    await order.price();
    
    return NextResponse.json({ 
      success: true,
      price_result: {
        subtotal: order.amountsBreakdown?.foodAndBeverage,
        tax: order.amountsBreakdown?.tax,
        delivery_fee: order.amountsBreakdown?.deliveryFee,
        total: order.amountsBreakdown?.customer,
      },
    });
  } catch (error: any) {
    console.error('Error pricing order:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error pricing order',
      error_details: error.message,
    });
  }
}

async function placeOrder({ order_data, payment_data }: { order_data: OrderData, payment_data: PaymentData }) {
  try {
    // Recreate the customer and order from the provided data
    const customer = new Customer({
      address: order_data.customer.address,
      firstName: order_data.customer.firstName,
      lastName: order_data.customer.lastName,
      phone: order_data.customer.phone,
      email: order_data.customer.email,
    });
    
    const order = new Order(customer);
    order.storeID = order_data.store_id;
    
    // Add items to the order
    order_data.items.forEach(item => {
      const dominosItem = new Item({
        code: item.item_id,
        options: item.options || {},
        quantity: item.quantity,
      });
      
      order.addItem(dominosItem);
    });
    
    // Add payment to the order
    if (payment_data) {
      const payment = new Payment({
        amount: payment_data.amount,
        number: payment_data.card_number,
        expiration: payment_data.expiry_date,
        securityCode: payment_data.cvv,
        postalCode: payment_data.postal_code,
        tipAmount: payment_data.tip_amount || 0,
      });
      
      order.payments.push(payment);
    }
    
    // Place the order
    await order.place();
    
    return NextResponse.json({ 
      success: true,
      order_result: {
        order_id: order.orderID,
        tracking_url: order.urls?.track,
        estimated_delivery_time: "30-45 minutes",
      },
    });
  } catch (error: any) {
    console.error('Error placing order:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Error placing order',
      error_details: error.message,
    });
  }
} 