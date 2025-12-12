'use strict';

/**
 * Custom auth controller to handle registration with name and phoneNumber
 */

module.exports = {
  async register(ctx) {
    let { username, email, password, name, phoneNumber } = ctx.request.body;

    // Validate required fields
    if (!email || !password) {
      return ctx.badRequest('Missing required fields: email, password');
    }

    // Auto-generate username if not provided
    if (!username) {
      username = email.split('@')[0] + Math.floor(Math.random() * 10000);
    }

    try {
      // Register user with Strapi's default auth
      const userService = strapi.plugin('users-permissions').service('user');
      
      // Create user data
      const userData = {
        username,
        email,
        password,
        provider: 'local',
        confirmed: true, // Auto-confirm for now, can be changed
      };

      // Register the user
      const user = await userService.add(userData);

      // Update with custom fields if provided
      if (name || phoneNumber) {
        const updateData = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        await strapi.entityService.update(
          'plugin::users-permissions.user',
          user.id,
          { data: updateData }
        );

        // Refresh user data
        const updatedUser = await strapi.entityService.findOne(
          'plugin::users-permissions.user',
          user.id,
          { populate: '*' }
        );

        // Generate JWT token
        const jwt = strapi.plugin('users-permissions').service('jwt').issue({
          id: updatedUser.id,
        });

        return ctx.send({
          jwt,
          user: updatedUser,
        });
      }

      // Generate JWT token
      const jwt = strapi.plugin('users-permissions').service('jwt').issue({
        id: user.id,
      });

      return ctx.send({
        jwt,
        user,
      });
    } catch (error) {
      return ctx.badRequest(error.message || 'Registration failed');
    }
  },
};

