import { AgentConfig } from "@/app/types";
import dominosService, { Store } from "@/app/services/dominosService";

// Cache for store data to avoid repeated API calls
const storeCache: Record<string, Store> = {};

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
    findNearbyStores: async ({ address }) => {
      console.log("[toolLogic] calling findNearbyStores(), address:", address);
      
      try {
        // Use our client-side service to find nearby stores
        const stores = await dominosService.findNearbyStores(address);
        
        // Cache the store data for later use
        stores.forEach(store => {
          storeCache[store.store_id] = store;
        });
        
        return {
          stores,
        };
      } catch (error) {
        console.error("Error finding nearby stores:", error);
        
        // Return dummy data if the API call fails
        const dummyStores = [
          {
            store_id: "8278",
            name: "Domino's Pizza",
            address: "123 Main St, Anytown, USA",
            distance: "0.5 miles",
            phone: "(555) 123-4567",
            estimated_delivery_time: "30-45 minutes",
          },
          {
            store_id: "8279",
            name: "Domino's Pizza",
            address: "456 Oak Ave, Anytown, USA",
            distance: "1.2 miles",
            phone: "(555) 234-5678",
            estimated_delivery_time: "35-50 minutes",
          },
        ];
        
        // Cache the dummy store data
        dummyStores.forEach(store => {
          storeCache[store.store_id] = store;
        });
        
        return {
          stores: dummyStores,
          error: "Could not connect to Domino's API. Using dummy data instead."
        };
      }
    },
    
    selectStore: async ({ store_id }) => {
      console.log("[toolLogic] calling selectStore(), store_id:", store_id);
      
      try {
        // Check if we have the store in cache
        if (storeCache[store_id]) {
          return {
            selected_store: storeCache[store_id],
          };
        }
        
        // If not in cache, fetch from API
        const store = await dominosService.getStoreDetails(store_id);
        
        // Cache the store data
        storeCache[store_id] = store;
        
        return {
          selected_store: store,
        };
      } catch (error) {
        console.error("Error selecting store:", error);
        
        // If we have the store in cache, return that
        if (storeCache[store_id]) {
          return {
            selected_store: storeCache[store_id],
          };
        }
        
        // Otherwise return a dummy store
        const dummyStore = {
          store_id: store_id,
          name: `Domino's Pizza #${store_id}`,
          address: "123 Main St, Anytown, USA",
          phone: "(555) 123-4567",
          hours: "10:00 AM - 10:00 PM",
        };
        
        // Cache the dummy store
        storeCache[store_id] = dummyStore;
        
        return {
          selected_store: dummyStore,
          error: "Could not connect to Domino's API. Using dummy data instead."
        };
      }
    },
  },
};

export default storeFinderAgent; 