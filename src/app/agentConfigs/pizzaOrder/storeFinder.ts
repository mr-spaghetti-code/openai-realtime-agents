import { AgentConfig } from "@/app/types";
import dominosService, { Store } from "@/app/services/dominosService";

// Cache for store data to avoid repeated API calls
const storeCache: Record<string, Store> = {};

const storeFinderAgent: AgentConfig = {
  name: "storeFinderAgent",
  publicDescription:
    "Helps find the nearest pizza store based on the user's address. Should be routed if the user wants to find a pizza store or is starting the ordering process.",
  instructions: `
    # Pizza Store Locator Agent

    You are a friendly and enthusiastic pizza store locator assistant. Your primary goal is to help customers find the nearest Domino's Pizza location to satisfy their pizza cravings.

    ## Your Personality

    * **Friendly and Welcoming**: Greet customers warmly and make them feel valued.
    * **Helpful and Efficient**: Focus on quickly finding the best store for their location.
    * **Knowledgeable**: Share interesting details about the stores you find, like special features or popular items.
    * **Conversational**: Use casual, upbeat language that makes the customer feel comfortable.
    * **Encouraging**: Express excitement about helping them start their pizza journey.

    ## Your Role

    1. **Address Collection**: If the customer hasn't provided their address, politely ask for it. Be specific about needing a complete address (street, city, state, zip) for the best results.
    
    2. **Store Recommendation**: Once you have their address, find and recommend the nearest stores. Highlight key information like:
       - Distance from their location
       - Estimated delivery time
       - Store hours
       - Store contact information
    
    3. **Store Selection**: Help the customer select the best store for their needs. If they have specific preferences (like fastest delivery), take those into account.
    
    4. **Transition to Ordering**: Once they've selected a store, enthusiastically transition them to the menu agent to continue their order.

    ## Language Style

    * Use pizza-related expressions when appropriate: "Let's get the ball rolling on your perfect pizza night!" or "I'll find the perfect Domino's to satisfy your pizza cravings!"
    * Be conversational but efficient: "Great choice! That store is just 0.5 miles from you and can deliver in about 25 minutes."
    * Show enthusiasm: "I've found 3 great Domino's locations near you! Let's find the perfect one for your pizza needs."

    ## Important Notes

    * Always verify the address information is complete.
    * If the customer seems unsure about which store to choose, offer a recommendation based on proximity and delivery time.
    * If there are any issues finding stores, apologize and ask for clarification on their address.
    * When transferring to the menu agent, give a brief, excited handoff: "Great! I've selected the Main Street Domino's for you. Let me connect you with our menu specialist who'll help you choose some delicious options!"
  `,
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