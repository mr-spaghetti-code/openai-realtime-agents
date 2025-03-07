import { AgentConfig } from "@/app/types";

const paymentAgent: AgentConfig = {
  name: "paymentAgent",
  publicDescription:
    "Processes payments for pizza orders. Should be routed if the user is ready to pay for their order.",
  instructions:
    "You are a helpful payment processor for pizza orders. Your job is to collect payment information from the user and process their payment. Be sure to handle the payment securely and provide a confirmation once the payment is processed. Ask for the necessary payment details and guide the user through the payment process.",
  tools: [
    {
      type: "function",
      name: "getOrderSummary",
      description:
        "Gets a summary of the order to be paid for.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The ID of the order to get a summary for.",
          },
        },
        required: ["order_id"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "processPayment",
      description: "Processes a payment for an order.",
      parameters: {
        type: "object",
        properties: {
          order_id: {
            type: "string",
            description: "The ID of the order to process payment for.",
          },
          payment_method: {
            type: "string",
            enum: ["credit_card", "debit_card", "paypal", "cash"],
            description: "The payment method to use.",
          },
          card_number: {
            type: "string",
            description: "The credit/debit card number (if applicable).",
          },
          expiry_date: {
            type: "string",
            description: "The card expiry date in MM/YY format (if applicable).",
          },
          cvv: {
            type: "string",
            description: "The card CVV (if applicable).",
          },
          tip_amount: {
            type: "number",
            description: "The tip amount to add to the order.",
          },
        },
        required: ["order_id", "payment_method"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "getPaymentConfirmation",
      description: "Gets the confirmation details for a processed payment.",
      parameters: {
        type: "object",
        properties: {
          payment_id: {
            type: "string",
            description: "The ID of the payment to get confirmation for.",
          },
        },
        required: ["payment_id"],
        additionalProperties: false,
      },
    },
  ],
  toolLogic: {
    getOrderSummary: ({ order_id }) => {
      console.log("[toolLogic] calling getOrderSummary(), order_id:", order_id);
      
      // Dummy order data
      const orderSummary = {
        order_id,
        items: [
          {
            name: "Pepperoni Pizza",
            quantity: 1,
            price: 14.99,
            customizations: ["Extra Cheese"],
            total: 14.99,
          },
          {
            name: "Garlic Bread",
            quantity: 1,
            price: 5.99,
            customizations: [],
            total: 5.99,
          },
          {
            name: "Soda",
            quantity: 2,
            price: 2.99,
            customizations: [],
            total: 5.98,
          },
        ],
        subtotal: 26.96,
        tax: 2.70,
        delivery_fee: 3.99,
        total: 33.65,
        delivery_address: "123 Main St, Anytown, USA",
        estimated_delivery_time: "30-45 minutes",
      };

      return {
        order_summary: orderSummary,
      };
    },
    
    processPayment: ({ 
      order_id, 
      payment_method, 
      tip_amount = 0 
    }) => {
      console.log(
        "[toolLogic] calling processPayment(), order_id:", order_id,
        "payment_method:", payment_method,
        "tip_amount:", tip_amount
      );
      
      // In a real app, we would process the payment here using card_number, expiry_date, and cvv
      // For this example, we'll just return a success response
      
      // Dummy order data
      const orderSummary = {
        order_id,
        subtotal: 26.96,
        tax: 2.70,
        delivery_fee: 3.99,
        tip: tip_amount,
        total: 33.65 + (tip_amount || 0),
      };
      
      const paymentId = "PAY" + Math.floor(Math.random() * 10000);
      
      return {
        success: true,
        payment_id: paymentId,
        payment_method,
        amount: orderSummary.total,
        timestamp: new Date().toISOString(),
        order_summary: orderSummary,
      };
    },
    
    getPaymentConfirmation: ({ payment_id }) => {
      console.log("[toolLogic] calling getPaymentConfirmation(), payment_id:", payment_id);
      
      // Dummy payment confirmation data
      const paymentConfirmation = {
        payment_id,
        order_id: "ORD" + Math.floor(Math.random() * 10000),
        status: "completed",
        amount: 33.65,
        payment_method: "credit_card",
        timestamp: new Date().toISOString(),
        receipt_url: "https://example.com/receipts/" + payment_id,
        estimated_delivery_time: "30-45 minutes",
      };

      return {
        payment_confirmation: paymentConfirmation,
      };
    },
  },
};

export default paymentAgent; 