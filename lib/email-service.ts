import { resend, FROM_EMAIL } from "./email";
import {
  generateShippingConfirmationEmail,
  generateDeliveryNotificationEmail,
  ShippingConfirmationData,
} from "./email-templates";

/**
 * Send shipping confirmation email
 */
export async function sendShippingConfirmationEmail(
  email: string,
  data: ShippingConfirmationData
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Order Has Shipped - #${data.orderNumber}`,
      html: generateShippingConfirmationEmail(data),
    });

    console.log("Shipping confirmation email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("Failed to send shipping confirmation email:", error);
    throw error;
  }
}

/**
 * Send delivery notification email
 */
export async function sendDeliveryNotificationEmail(
  email: string,
  customerName: string,
  orderNumber: string
) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Your Order Has Been Delivered - #${orderNumber}`,
      html: generateDeliveryNotificationEmail(customerName, orderNumber),
    });

    console.log("Delivery notification email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("Failed to send delivery notification email:", error);
    throw error;
  }
}
