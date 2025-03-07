import storeFinderAgent from "./storeFinder";
import menuAgent from "./menuAgent";
import paymentAgent from "./paymentAgent";
import simulatedHuman from "./simulatedHuman";
import { injectTransferTools } from "../utils";

// Set up downstream agents for each agent
storeFinderAgent.downstreamAgents = [menuAgent, paymentAgent, simulatedHuman];
menuAgent.downstreamAgents = [storeFinderAgent, paymentAgent, simulatedHuman];
paymentAgent.downstreamAgents = [storeFinderAgent, menuAgent, simulatedHuman];
simulatedHuman.downstreamAgents = [storeFinderAgent, menuAgent, paymentAgent];

// Inject transfer tools
const agents = injectTransferTools([
  storeFinderAgent,
  menuAgent,
  paymentAgent,
  simulatedHuman,
]);

export default agents; 