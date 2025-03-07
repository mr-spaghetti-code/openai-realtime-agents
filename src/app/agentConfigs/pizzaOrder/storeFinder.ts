import { AgentConfig } from "@/app/types";

const storeFinderAgent: AgentConfig = {
  name: "storeFinderAgent",
  publicDescription:
    "Helps find the nearest pizza store based on the user's address. Should be routed if the user wants to find a pizza store or is starting the ordering process.",
  instructions:
    "You are a helpful pizza store locator. Your job is to find the nearest pizza store based on the user's address. Ask for the user's address if not provided, and then suggest the nearest store. Once a store is selected, transfer the user to the menu agent to continue with their order.",
  tools: [
    {
      type: "function",
      name: "findNearbyStores",
      description:
        "Finds pizza stores near the provided address and returns a list of options.",
      parameters: {
        type: "object",
        properties: {
          address: {
            type: "string",
            description: "The user's address to find nearby stores.",
          },
        },
        required: ["address"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "selectStore",
      description: "Selects a store from the list of nearby stores.",
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
  ],
  toolLogic: {
    findNearbyStores: ({ address }) => {
      console.log("[toolLogic] calling findNearbyStores(), address:", address);
      
      // Dummy data for nearby stores
      const stores = [
        {
          store_id: "store1",
          name: "Pizza Paradise",
          address: "123 Main St, Anytown, USA",
          distance: "0.5 miles",
          rating: 4.5,
          delivery_time: "20-30 min",
        },
        {
          store_id: "store2",
          name: "Slice Haven",
          address: "456 Oak Ave, Anytown, USA",
          distance: "1.2 miles",
          rating: 4.7,
          delivery_time: "25-35 min",
        },
        {
          store_id: "store3",
          name: "Dough Delights",
          address: "789 Pine Blvd, Anytown, USA",
          distance: "1.8 miles",
          rating: 4.3,
          delivery_time: "30-40 min",
        },
      ];

      return {
        stores: stores,
      };
    },
    selectStore: ({ store_id }) => {
      console.log("[toolLogic] calling selectStore(), store_id:", store_id);
      
      // Dummy data for store selection
      const storeMap: Record<string, {
        store_id: string;
        name: string;
        address: string;
        phone: string;
        hours: string;
      }> = {
        "store1": {
          store_id: "store1",
          name: "Pizza Paradise",
          address: "123 Main St, Anytown, USA",
          phone: "(555) 123-4567",
          hours: "10:00 AM - 10:00 PM",
        },
        "store2": {
          store_id: "store2",
          name: "Slice Haven",
          address: "456 Oak Ave, Anytown, USA",
          phone: "(555) 234-5678",
          hours: "11:00 AM - 11:00 PM",
        },
        "store3": {
          store_id: "store3",
          name: "Dough Delights",
          address: "789 Pine Blvd, Anytown, USA",
          phone: "(555) 345-6789",
          hours: "10:30 AM - 10:30 PM",
        },
      };

      return {
        selected_store: storeMap[store_id] || null,
      };
    },
  },
};

export default storeFinderAgent; 