import { AgentConfig } from "@/app/types";

// Create a shared order state outside the agent config
const orderState = {
  items: [] as Array<{
    item_id: string;
    name: string;
    price: number;
    quantity: number;
    customizations: string[];
    total: number;
  }>,
  total: 0,
};

const menuAgent: AgentConfig = {
  name: "menuAgent",
  publicDescription:
    "Displays the menu for the selected pizza store and takes the user's order. Should be routed if the user wants to see the menu or place an order.",
  instructions:
    "You are a helpful pizza menu assistant. Your job is to display the menu for the selected store and help the user place their order. Ask for their preferences, suggest popular items, and help them customize their order. Once the order is complete, transfer the user to the payment agent to process their payment.",
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
          delivery_instructions: {
            type: "string",
            description: "Any special delivery instructions.",
          },
        },
        required: ["delivery_address"],
        additionalProperties: false,
      },
    },
  ],
  toolLogic: {
    getMenu: ({ store_id }) => {
      console.log("[toolLogic] calling getMenu(), store_id:", store_id);
      
      // Dummy menu data
      const menuItems = [
        {
          item_id: "pizza1",
          name: "Margherita",
          description: "Classic pizza with tomato sauce, mozzarella, and basil",
          price: 12.99,
          category: "Pizza",
          customizable: true,
          popular: true,
        },
        {
          item_id: "pizza2",
          name: "Pepperoni",
          description: "Pizza with tomato sauce, mozzarella, and pepperoni",
          price: 14.99,
          category: "Pizza",
          customizable: true,
          popular: true,
        },
        {
          item_id: "pizza3",
          name: "Vegetarian",
          description: "Pizza with tomato sauce, mozzarella, bell peppers, onions, mushrooms, and olives",
          price: 15.99,
          category: "Pizza",
          customizable: true,
          popular: false,
        },
        {
          item_id: "side1",
          name: "Garlic Bread",
          description: "Freshly baked bread with garlic butter",
          price: 5.99,
          category: "Sides",
          customizable: false,
          popular: true,
        },
        {
          item_id: "side2",
          name: "Chicken Wings",
          description: "Spicy chicken wings with blue cheese dip",
          price: 8.99,
          category: "Sides",
          customizable: false,
          popular: true,
        },
        {
          item_id: "drink1",
          name: "Soda",
          description: "Choice of Coke, Sprite, or Fanta",
          price: 2.99,
          category: "Drinks",
          customizable: false,
          popular: true,
        },
        {
          item_id: "drink2",
          name: "Bottled Water",
          description: "500ml bottled water",
          price: 1.99,
          category: "Drinks",
          customizable: false,
          popular: false,
        },
      ];

      // Customization options
      const customizationOptions = [
        "Extra Cheese",
        "Extra Sauce",
        "Thin Crust",
        "Thick Crust",
        "No Cheese",
        "Well Done",
        "Add Mushrooms",
        "Add Pepperoni",
        "Add Sausage",
        "Add Bacon",
        "Add Onions",
        "Add Bell Peppers",
        "Add Olives",
      ];

      return {
        menu_items: menuItems,
        customization_options: customizationOptions,
      };
    },
    
    addItemToOrder: ({ item_id, quantity, customizations = [] }) => {
      console.log("[toolLogic] calling addItemToOrder(), item_id:", item_id, "quantity:", quantity, "customizations:", customizations);
      
      // Dummy menu data for lookup
      const menuItemsMap: Record<string, {
        item_id: string;
        name: string;
        description: string;
        price: number;
        category: string;
      }> = {
        "pizza1": {
          item_id: "pizza1",
          name: "Margherita",
          description: "Classic pizza with tomato sauce, mozzarella, and basil",
          price: 12.99,
          category: "Pizza",
        },
        "pizza2": {
          item_id: "pizza2",
          name: "Pepperoni",
          description: "Pizza with tomato sauce, mozzarella, and pepperoni",
          price: 14.99,
          category: "Pizza",
        },
        "pizza3": {
          item_id: "pizza3",
          name: "Vegetarian",
          description: "Pizza with tomato sauce, mozzarella, bell peppers, onions, mushrooms, and olives",
          price: 15.99,
          category: "Pizza",
        },
        "side1": {
          item_id: "side1",
          name: "Garlic Bread",
          description: "Freshly baked bread with garlic butter",
          price: 5.99,
          category: "Sides",
        },
        "side2": {
          item_id: "side2",
          name: "Chicken Wings",
          description: "Spicy chicken wings with blue cheese dip",
          price: 8.99,
          category: "Sides",
        },
        "drink1": {
          item_id: "drink1",
          name: "Soda",
          description: "Choice of Coke, Sprite, or Fanta",
          price: 2.99,
          category: "Drinks",
        },
        "drink2": {
          item_id: "drink2",
          name: "Bottled Water",
          description: "500ml bottled water",
          price: 1.99,
          category: "Drinks",
        },
      };
      
      const item = menuItemsMap[item_id];
      if (!item) {
        return {
          success: false,
          message: "Item not found",
        };
      }
      
      const itemTotal = item.price * quantity;
      
      // Add to current order
      orderState.items.push({
        item_id,
        name: item.name,
        price: item.price,
        quantity,
        customizations: customizations || [],
        total: itemTotal,
      });
      
      orderState.total += itemTotal;
      
      return {
        success: true,
        added_item: {
          name: item.name,
          quantity,
          customizations,
          price: item.price,
          total: itemTotal,
        },
        order_total: orderState.total,
      };
    },
    
    viewCurrentOrder: () => {
      console.log("[toolLogic] calling viewCurrentOrder()");
      
      return {
        order_items: orderState.items,
        order_total: orderState.total,
      };
    },
    
    finalizeOrder: ({ delivery_address, delivery_instructions = "" }) => {
      console.log("[toolLogic] calling finalizeOrder(), delivery_address:", delivery_address, "delivery_instructions:", delivery_instructions);
      
      // Add delivery info to the order
      const finalOrder = {
        items: [...orderState.items],
        total: orderState.total,
        delivery_address,
        delivery_instructions,
        order_id: "ORD" + Math.floor(Math.random() * 10000),
        estimated_delivery_time: "30-45 minutes",
      };
      
      // Reset current order
      orderState.items = [];
      orderState.total = 0;
      
      return {
        success: true,
        finalized_order: finalOrder,
      };
    },
  },
};

export default menuAgent; 