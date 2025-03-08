import { AgentConfig } from "@/app/types";
import dominosService, { 
  MenuCategory, 
  CustomerInfo, 
  OrderItem, 
  OrderData 
} from "@/app/services/dominosService";

// Create a shared order state outside the agent config
export const orderState = {
  customer: null as CustomerInfo | null,
  storeId: "",
  items: [] as OrderItem[],
  total: 0,
  orderId: "",
};

// Cache for menu data to avoid repeated API calls
const menuCache: Record<string, MenuCategory[]> = {};

const menuAgent: AgentConfig = {
  name: "menuAgent",
  publicDescription:
    "Displays the menu for the selected pizza store and takes the user's order. Should be routed if the user wants to see the menu or place an order.",
  instructions: `
    # Pizza Menu & Ordering Specialist

    You are a charismatic and knowledgeable pizza menu specialist with a passion for helping customers create their perfect pizza experience. Your enthusiasm for Domino's menu is contagious!

    ## Your Personality

    * **Passionate Food Expert**: You love talking about pizza and know the menu inside and out.
    * **Enthusiastic Recommender**: You get excited about suggesting popular combinations and special deals.
    * **Patient Guide**: You take time to explain options and help customers customize their perfect meal.
    * **Attentive Listener**: You pay close attention to customer preferences and dietary needs.
    * **Upbeat and Positive**: You maintain a cheerful tone that makes ordering fun.

    ## Your Role

    1. **Menu Presentation**: Present the menu in an organized, appetizing way. Categorize items (Pizzas, Sides, Drinks, Desserts) and highlight popular choices.
    
    2. **Recommendations**: Based on customer preferences, make personalized recommendations:
       - "Our Pepperoni Feast is perfect for meat lovers!"
       - "The Garlic Parmesan Bread Twists pair perfectly with any pizza!"
       - "Looking for something spicy? Our Buffalo Chicken pizza has just the right kick!"
    
    3. **Customization Assistance**: Help customers personalize their pizzas with toppings, crust options, and special instructions.
    
    4. **Order Building**: Guide customers through building their complete meal, suggesting complementary sides, drinks, and desserts.
    
    5. **Order Review**: Before finalizing, summarize the order clearly and confirm it's correct.
    
    6. **Order Finalization**: Collect delivery information and smoothly transition to the payment agent.

    ## Language Style

    * Use descriptive, mouth-watering language: "Our hand-tossed crust is perfectly crispy on the outside, soft and chewy on the inside!"
    * Be conversational and friendly: "That's an excellent choice! The garlic bread is one of my personal favorites."
    * Show enthusiasm: "You're going to love our new specialty pizza - it's been flying out of our ovens!"
    * Use pizza terminology naturally: "Would you prefer our classic hand-tossed crust, or our crispy thin crust?"

    ## Important Notes

    * Always ask about dietary restrictions or allergies when appropriate.
    * If a customer seems overwhelmed by choices, offer to recommend popular items.
    * Confirm the order details before finalizing to ensure accuracy.
    * When transferring to the payment agent, give a warm handoff: "Your order looks absolutely delicious! Let me connect you with our payment specialist to complete your order and get that pizza headed your way!"
    * If the customer wants to modify their order after adding items, be accommodating and help them make changes.
  `,
  tools: [
    {
      type: "function",
      name: "getMenu",
      description:
        "Gets the menu for the selected store.",
      parameters: {
        type: "object",
        properties: {
          store_id: {
            type: "string",
            description: "The ID of the selected store.",
          },
        },
        required: ["store_id"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "addItemToOrder",
      description: "Adds an item to the user's order.",
      parameters: {
        type: "object",
        properties: {
          item_id: {
            type: "string",
            description: "The ID of the item to add to the order.",
          },
          quantity: {
            type: "number",
            description: "The quantity of the item to add.",
          },
          customizations: {
            type: "array",
            description: "Any customizations for the item.",
            items: {
              type: "string",
            },
          },
        },
        required: ["item_id", "quantity"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "viewCurrentOrder",
      description: "Views the current order.",
      parameters: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "finalizeOrder",
      description: "Finalizes the order and prepares for payment.",
      parameters: {
        type: "object",
        properties: {
          delivery_address: {
            type: "string",
            description: "The delivery address for the order.",
          },
          customer_name: {
            type: "string",
            description: "The customer's name.",
          },
          phone_number: {
            type: "string",
            description: "The customer's phone number.",
          },
          email: {
            type: "string",
            description: "The customer's email address.",
          },
          delivery_instructions: {
            type: "string",
            description: "Any special delivery instructions.",
          },
        },
        required: ["delivery_address", "customer_name", "phone_number", "email"],
        additionalProperties: false,
      },
    },
  ],
  toolLogic: {
    getMenu: async ({ store_id }) => {
      console.log("[toolLogic] calling getMenu(), store_id:", store_id);
      
      // Save the store ID for later use
      orderState.storeId = store_id;
      
      try {
        // Check if we have the menu in cache
        if (menuCache[store_id]) {
          return {
            menu_categories: menuCache[store_id],
          };
        }
        
        // Use our client-side service to get the menu
        const menuCategories = await dominosService.getMenu(store_id);
        
        // Cache the menu data
        menuCache[store_id] = menuCategories;
        
        return {
          menu_categories: menuCategories,
        };
      } catch (error) {
        console.error("Error getting menu:", error);
        
        // Return dummy menu data if the API call fails
        const dummyMenu: MenuCategory[] = [
          {
            name: "Pizzas",
            items: [
              {
                code: "14SCREEN",
                name: "Hand Tossed Large Cheese",
                description: "Cheese made with 100% real mozzarella on top of our garlic-seasoned crust with a rich, buttery taste.",
                price: "12.99",
              },
              {
                code: "P_14SCREEN",
                name: "Hand Tossed Pepperoni",
                description: "Pepperoni and cheese made with 100% real mozzarella on top of our garlic-seasoned crust with a rich, buttery taste.",
                price: "14.99",
              },
              {
                code: "PS_14SCREEN",
                name: "Hand Tossed Pepperoni & Sausage",
                description: "Pepperoni, sausage and cheese made with 100% real mozzarella on top of our garlic-seasoned crust with a rich, buttery taste.",
                price: "15.99",
              },
            ],
          },
          {
            name: "Sides",
            items: [
              {
                code: "B8PCPT",
                name: "Parmesan Bread Twists",
                description: "Drizzled with garlic and Parmesan cheese seasoning and sprinkled with more Parmesan cheese. Best served with marinara sauce.",
                price: "5.99",
              },
              {
                code: "W08PHOTW",
                name: "Hot Buffalo Wings",
                description: "Marinated and oven-baked, then smothered in hot buffalo sauce. Customize with your choice of dipping cup.",
                price: "8.99",
              },
            ],
          },
          {
            name: "Drinks",
            items: [
              {
                code: "2LCOKE",
                name: "Coke",
                description: "The authentic cola sensation that is a refreshing part of sharing life's enjoyable moments.",
                price: "2.99",
              },
              {
                code: "2LSPRITE",
                name: "Sprite",
                description: "Unique Lymon (lemon-lime) flavor, clear, clean and crisp with no caffeine.",
                price: "2.99",
              },
            ],
          },
          {
            name: "Desserts",
            items: [
              {
                code: "MARBRWNE",
                name: "Domino's Marbled Cookie Brownie™",
                description: "Taste the decadent blend of gooey milk chocolate chunk cookie and delicious fudge brownie. Oven baked with 9 pieces to make it perfectly shareable.",
                price: "6.99",
              },
            ],
          },
        ];
        
        // Cache the dummy menu data
        menuCache[store_id] = dummyMenu;
        
        return {
          menu_categories: dummyMenu,
          error: "Could not connect to Domino's API. Using dummy data instead."
        };
      }
    },
    
    addItemToOrder: ({ item_id, quantity, customizations = [] }) => {
      console.log("[toolLogic] calling addItemToOrder(), item_id:", item_id, "quantity:", quantity, "customizations:", customizations);
      
      try {
        // Get the menu item from cache if available
        let itemName = "Unknown Item";
        let itemPrice = 0;
        
        // Look through all cached menus to find the item
        Object.values(menuCache).forEach(categories => {
          categories.forEach(category => {
            category.items.forEach(item => {
              if (item.code === item_id) {
                itemName = item.name;
                itemPrice = parseFloat(item.price || "0");
              }
            });
          });
        });
        
        // If we found the item, add it to the order
        if (itemName !== "Unknown Item") {
          const itemTotal = itemPrice * quantity;
          
          // Create options object from customizations
          const options: Record<string, Record<string, string>> = {};
          
          // Add customizations if provided
          if (customizations && customizations.length > 0) {
            customizations.forEach((customization: string) => {
              if (customization.includes("Extra Cheese")) {
                options.C = { "1/1": "2" }; // Double cheese
              } else if (customization.includes("Extra Sauce")) {
                options.X = { "1/1": "2" }; // Double sauce
              } else if (customization.includes("Pepperoni")) {
                options.P = { "1/1": "1" }; // Add pepperoni
              } else if (customization.includes("Sausage")) {
                options.S = { "1/1": "1" }; // Add sausage
              } else if (customization.includes("Mushrooms")) {
                options.M = { "1/1": "1" }; // Add mushrooms
              } else if (customization.includes("Onions")) {
                options.O = { "1/1": "1" }; // Add onions
              } else if (customization.includes("Green Peppers")) {
                options.G = { "1/1": "1" }; // Add green peppers
              } else if (customization.includes("Black Olives")) {
                options.R = { "1/1": "1" }; // Add black olives
              } else if (customization.includes("Pineapple")) {
                options.N = { "1/1": "1" }; // Add pineapple
              } else if (customization.includes("Ham")) {
                options.H = { "1/1": "1" }; // Add ham
              } else if (customization.includes("Bacon")) {
                options.K = { "1/1": "1" }; // Add bacon
              } else if (customization.includes("Jalapenos")) {
                options.J = { "1/1": "1" }; // Add jalapenos
              }
            });
          }
          
          // If no customizations were added, add default sauce and cheese for pizzas
          if (Object.keys(options).length === 0 && item_id.includes("SCREEN")) {
            options.X = { "1/1": "1" }; // Normal sauce
            options.C = { "1/1": "1" }; // Normal cheese
          }
          
          // Add to current order
          const newItem: OrderItem = {
            item_id,
            name: itemName,
            price: itemPrice,
            quantity,
            customizations: customizations || [],
            options,
            total: itemTotal,
          };
          
          orderState.items.push(newItem);
          orderState.total += itemTotal;
          
          return {
            success: true,
            added_item: {
              name: itemName,
              quantity,
              customizations,
              price: itemPrice,
              total: itemTotal,
            },
            order_total: orderState.total,
          };
        } else {
          // If we couldn't find the item, return an error
          return {
            success: false,
            message: "Item not found in menu.",
          };
        }
      } catch (error) {
        console.error("Error adding item to order:", error);
        
        return {
          success: false,
          message: "Error adding item to order.",
        };
      }
    },
    
    viewCurrentOrder: () => {
      console.log("[toolLogic] calling viewCurrentOrder()");
      
      return {
        order_items: orderState.items,
        order_total: orderState.total,
      };
    },
    
    finalizeOrder: async ({ delivery_address, customer_name, phone_number, email, delivery_instructions = "" }) => {
      console.log("[toolLogic] calling finalizeOrder(), delivery_address:", delivery_address);
      
      try {
        // Split customer name into first and last name
        const nameParts = customer_name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
        
        // Create a customer info object
        const customerInfo: CustomerInfo = {
          address: delivery_address,
          firstName,
          lastName,
          phone: phone_number,
          email,
        };
        
        // Save customer info to order state
        orderState.customer = customerInfo;
        
        // Create an order data object
        const orderData: OrderData = {
          customer: customerInfo,
          store_id: orderState.storeId,
          items: orderState.items,
        };
        
        // Validate and price the order using our client-side service
        try {
          // Create the order
          const order = await dominosService.createOrder(customerInfo, orderState.storeId);
          orderState.orderId = order.order_id;
          
          // Validate the order
          await dominosService.validateOrder(orderData);
          
          // Price the order
          const priceResult = await dominosService.priceOrder(orderData);
          
          // Update the total with the actual price from the API
          if (priceResult && priceResult.total) {
            orderState.total = priceResult.total;
          }
        } catch (apiError) {
          console.error("Error validating/pricing order:", apiError);
          // Continue with the order even if validation/pricing fails
        }
        
        // Add delivery info to the order
        const finalOrder = {
          items: [...orderState.items],
          total: orderState.total,
          delivery_address,
          delivery_instructions,
          customer_name,
          phone_number,
          email,
          order_id: orderState.orderId || `ORD${Math.floor(Math.random() * 10000)}`,
          estimated_delivery_time: "30-45 minutes",
        };
        
        return {
          success: true,
          finalized_order: finalOrder,
        };
      } catch (error) {
        console.error("Error finalizing order:", error);
        
        // Create a dummy finalized order
        const finalOrder = {
          items: [...orderState.items],
          total: orderState.total,
          delivery_address,
          delivery_instructions,
          customer_name,
          phone_number,
          email,
          order_id: `ORD${Math.floor(Math.random() * 10000)}`,
          estimated_delivery_time: "30-45 minutes",
        };
        
        return {
          success: true,
          finalized_order: finalOrder,
          error: "Could not connect to Domino's API. Using dummy data instead."
        };
      }
    },
  },
};

export default menuAgent; 