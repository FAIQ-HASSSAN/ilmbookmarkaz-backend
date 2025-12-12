/**
 * address controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::address.address', ({ strapi }) => ({
  async find(ctx) {
    // Only return addresses for current user
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // Filter by current user
    const existingFilters = (ctx.query.filters as Record<string, any>) || {};
    ctx.query.filters = {
      ...existingFilters,
      user: {
        id: {
          $eq: user.id,
        },
      },
    };

    // Populate user relation
    const existingPopulate = ctx.query.populate as Record<string, any> || {};
    ctx.query.populate = {
      ...existingPopulate,
      user: true,
    };

    return await super.find(ctx);
  },

  async create(ctx) {
    // Automatically set user to current user
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // If this is set as default, unset other defaults for this user
    if (ctx.request.body.data?.isDefault) {
      // Find all user's addresses and unset default
      const userAddresses = await strapi.entityService.findMany('api::address.address', {
        filters: {
          user: {
            id: {
              $eq: user.id,
            },
          },
        },
      }) as any[];

      // Update each address to set isDefault to false
      for (const addr of userAddresses) {
        await strapi.entityService.update('api::address.address', addr.id, {
          data: {
            isDefault: false,
          },
        });
      }
    }

    // Set user relation
    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    // Only allow updating own addresses
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // Verify ownership
    const address = await strapi.entityService.findOne('api::address.address', ctx.params.id, {
      populate: ['user'],
    }) as any;

    if (!address) {
      return ctx.notFound('Address not found');
    }

    // Check if user owns this address
    const addressUserId = address.user?.id || address.user;
    if (addressUserId !== user.id) {
      return ctx.forbidden('You can only update your own addresses');
    }

    // If this is set as default, unset other defaults for this user
    if (ctx.request.body.data?.isDefault) {
      // Find all user's addresses except current one and unset default
      const userAddresses = await strapi.entityService.findMany('api::address.address', {
        filters: {
          id: {
            $ne: ctx.params.id,
          },
          user: {
            id: {
              $eq: user.id,
            },
          },
        },
      }) as any[];

      // Update each address to set isDefault to false
      for (const addr of userAddresses) {
        await strapi.entityService.update('api::address.address', addr.id, {
          data: {
            isDefault: false,
          },
        });
      }
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    // Only allow deleting own addresses
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // Verify ownership
    const address = await strapi.entityService.findOne('api::address.address', ctx.params.id, {
      populate: ['user'],
    }) as any;

    if (!address) {
      return ctx.notFound('Address not found');
    }

    // Check if user owns this address
    const addressUserId = address.user?.id || address.user;
    if (addressUserId !== user.id) {
      return ctx.forbidden('You can only delete your own addresses');
    }

    return await super.delete(ctx);
  },
}));

