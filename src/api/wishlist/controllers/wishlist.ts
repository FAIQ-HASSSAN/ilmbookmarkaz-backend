/**
 * wishlist controller
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::wishlist.wishlist', ({ strapi }) => ({
  async find(ctx) {
    // Only return wishlist for current user
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // Ensure filters is an object and add user filter
    const existingFilters = (ctx.query.filters as Record<string, any>) || {};
    ctx.query.filters = {
      ...existingFilters,
      user: {
        id: {
          $eq: user.id,
        },
      },
    };

    return await super.find(ctx);
  },

  async create(ctx) {
    // Automatically set user to current user
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    ctx.request.body.data = {
      ...ctx.request.body.data,
      user: user.id,
    };

    return await super.create(ctx);
  },

  async update(ctx) {
    // Only allow updating own wishlist
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    // If no ID provided, find or create user's wishlist
    if (!ctx.params.id) {
      const userWishlists = await strapi.entityService.findMany('api::wishlist.wishlist', {
        filters: {
          user: {
            id: {
              $eq: user.id,
            },
          },
        },
      }) as any[];

      if (userWishlists.length === 0) {
        // Create wishlist if it doesn't exist
        const newWishlist = await strapi.entityService.create('api::wishlist.wishlist', {
          data: {
            user: user.id,
            products: ctx.request.body.data?.products || [],
          },
        }) as any;
        return ctx.send({ data: newWishlist });
      } else {
        ctx.params.id = userWishlists[0].id;
      }
    }

    // Verify ownership
    const wishlist = await strapi.entityService.findOne('api::wishlist.wishlist', ctx.params.id, {
      populate: ['user'],
    }) as any;

    if (!wishlist) {
      return ctx.notFound('Wishlist not found');
    }

    // Check if user owns this wishlist
    const wishlistUserId = wishlist.user?.id || wishlist.user;
    if (wishlistUserId !== user.id) {
      return ctx.forbidden('You can only update your own wishlist');
    }

    return await super.update(ctx);
  },

  async delete(ctx) {
    // Only allow deleting own wishlist
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('You must be authenticated');
    }

    const wishlist = await strapi.entityService.findOne('api::wishlist.wishlist', ctx.params.id, {
      populate: ['user'],
    }) as any;

    if (!wishlist || (wishlist.user && wishlist.user.id !== user.id)) {
      return ctx.forbidden('You can only delete your own wishlist');
    }

    return await super.delete(ctx);
  },
}));

