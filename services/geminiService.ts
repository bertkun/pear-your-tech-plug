import { OrderStatus } from '../types';

/**
 * Local mock service for generating order status updates.
 * No external API keys or Google Gemini required.
 */
export const generateOrderStatusUpdate = async (status: OrderStatus): Promise<string> => {
  try {
    // Simulate a short async delay to mimic a real API call
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return a deterministic, premium‑sounding message
    return `Your order is now: ${status}. We'll notify you of the next steps.`;
  } catch (error) {
    console.error(`Error generating status update for ${status}:`, error);
    return `Your order is now: ${status}.`;
  }
};
