/**
 * order controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::order.order', ({ strapi }) => ({
  async create(ctx) {
    try {
      const user = ctx.state.user;

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Prepare order data
      const orderData = ctx.request.body.data || {};

      // Log incoming data for debugging
      strapi.log.info('Creating order with data:', JSON.stringify(orderData, null, 2));

      // Validate items
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return ctx.badRequest('Order must contain at least one item');
      }

      // Process items - ensure all required fields are present
      const processedItems = orderData.items.map((item: any) => {
        // Remove undefined product relation if not set
        const processedItem: any = {
          productName: item.productName || 'Product',
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
          total: Number(item.total) || (Number(item.price) || 0) * (Number(item.quantity) || 1),
        };

        // Only add optional fields if they have values
        if (item.productSku) processedItem.productSku = item.productSku;
        if (item.variant) processedItem.variant = item.variant;
        if (item.product && item.product !== null && item.product !== undefined) {
          processedItem.product = item.product;
        }

        return processedItem;
      });

      // Calculate subtotal from items
      let subtotal = orderData.subtotal;
      if (!subtotal || subtotal === 0) {
        subtotal = processedItems.reduce((sum: number, item: any) => {
          return sum + Number(item.total);
        }, 0);
      }

      // Set defaults
      const shipping = Number(orderData.shipping) || 0;
      const tax = Number(orderData.tax) || 0;
      const discount = Number(orderData.discount) || 0;
      const total = Number(orderData.total) || (subtotal + shipping + tax - discount);

      // Validate shipping address
      if (!orderData.shippingAddress) {
        return ctx.badRequest('Shipping address is required');
      }

      // Clean up shipping address - remove empty email field (Strapi email type doesn't accept empty strings)
      const shippingAddress: any = { ...orderData.shippingAddress };
      if (!shippingAddress.email || shippingAddress.email.trim() === '') {
        delete shippingAddress.email;
      }

      // Prepare the order payload
      const payload: any = {
        orderNumber,
        items: processedItems,
        subtotal: Number(subtotal),
        shipping: Number(shipping),
        tax: Number(tax),
        discount: Number(discount),
        total: Number(total),
        status: orderData.status || 'pending',
        paymentMethod: orderData.paymentMethod || 'cod',
        paymentStatus: orderData.paymentStatus || 'pending',
        shippingAddress: shippingAddress,
        user: orderData.user || null,
      };

      // User field is optional - only set if provided and valid
      // The schema expects api::ezimart-user.ezimart-user, but we'll allow guest orders
      if (orderData.user) {
        payload.user = orderData.user;
      }
      // If no user provided, order will be created as guest order (user field will be null/undefined)

      ctx.request.body.data = payload;

      return await super.create(ctx);
    } catch (error: any) {
      strapi.log.error('Error creating order:', error);
      return ctx.badRequest(error.message || 'Failed to create order');
    }
  },

  async find(ctx) {
    // If user is authenticated, only return their orders
    const user = ctx.state.user;
    if (user) {
      const existingFilters = (ctx.query.filters as Record<string, any>) || {};
      ctx.query.filters = {
        ...existingFilters,
        user: {
          id: {
            $eq: user.id,
          },
        },
      };
    }

    return await super.find(ctx);
  },
}));

