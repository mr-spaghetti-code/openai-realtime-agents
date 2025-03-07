import { NearbyStores, Store, Menu, Customer, Item, Order } from 'dominos';

async function testDominosAPI() {
  try {
    // Test finding nearby stores
    console.log("Finding nearby stores...");
    const address = '2 Portola Plaza, Monterey, Ca, 93940';
    const nearbyStores = await new NearbyStores(address);
    console.log(`Found ${nearbyStores.stores.length} nearby stores`);
    console.log("First store:", JSON.stringify(nearbyStores.stores[0], null, 2));
    
    if (nearbyStores.stores.length > 0) {
      // Get the first store
      const storeId = nearbyStores.stores[0].StoreID;
      console.log(`Using store ID: ${storeId}`);
      
      // Get store details
      console.log("Getting store details...");
      const store = await new Store(storeId);
      console.log("Store details:", JSON.stringify(store, null, 2));
      
      // Get menu
      console.log("Getting menu...");
      const menu = await new Menu(storeId);
      console.log("Menu structure:", Object.keys(menu));
      
      // If menu.products exists, log the number of products
      if (menu.products) {
        console.log(`Menu has ${Object.keys(menu.products).length} products`);
      } else {
        console.log("Menu products not found. Available menu properties:", Object.keys(menu));
        
        // Try to find products in a different location
        if (menu.result && menu.result.products) {
          console.log(`Found products in menu.result.products: ${Object.keys(menu.result.products).length} products`);
        } else if (menu.Variants) {
          console.log(`Found variants: ${Object.keys(menu.Variants).length} variants`);
        }
      }
      
      // Create a customer
      const customer = new Customer({
        address: address,
        firstName: 'Test',
        lastName: 'User',
        phone: '555-555-5555',
        email: 'test@example.com'
      });
      
      console.log("Customer:", JSON.stringify(customer, null, 2));
      
      // Create a pizza item
      const pizza = new Item({
        code: '14SCREEN', // 14 inch hand tossed pizza
        options: {
          X: {'1/1': '1'}, // sauce, whole pizza: normal
          C: {'1/1': '1'}, // cheese, whole pizza: normal
          P: {'1/1': '1'}  // pepperoni, whole pizza: normal
        }
      });
      
      console.log("Pizza item:", JSON.stringify(pizza, null, 2));
      
      // Create an order
      console.log("Creating order...");
      const order = new Order(customer);
      order.storeID = storeId;
      order.addItem(pizza);
      
      console.log("Order before validation:", JSON.stringify(order, null, 2));
      
      // Validate the order
      console.log("Validating order...");
      try {
        await order.validate();
        console.log("Order validated successfully");
      } catch (validationError) {
        console.error("Order validation failed:", validationError);
        console.log("Validation response:", JSON.stringify(order.validationResponse, null, 2));
      }
      
      // Price the order
      console.log("Pricing order...");
      try {
        await order.price();
        console.log(`Order total: $${order.amountsBreakdown.customer}`);
      } catch (pricingError) {
        console.error("Order pricing failed:", pricingError);
        console.log("Pricing response:", JSON.stringify(order.priceResponse, null, 2));
      }
      
      console.log("Test completed!");
    } else {
      console.log("No nearby stores found.");
    }
  } catch (error) {
    console.error("Error testing Dominos API:", error);
  }
}

testDominosAPI(); 