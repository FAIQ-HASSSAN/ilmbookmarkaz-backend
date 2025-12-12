module.exports = (plugin) => {
  // Extend the user model to include name and phoneNumber for Strapi 5
  // This allows these fields to be stored and retrieved via the API
  
  // Add name field to user schema
  if (!plugin.contentTypes.user.schema.attributes.name) {
    plugin.contentTypes.user.schema.attributes.name = {
      type: 'string',
      required: false,
    };
  }

  // Add phoneNumber field to user schema
  if (!plugin.contentTypes.user.schema.attributes.phoneNumber) {
    plugin.contentTypes.user.schema.attributes.phoneNumber = {
      type: 'string',
      required: false,
    };
  }

  // Override the register controller to handle custom fields AFTER registration
  // We don't send them during registration to avoid validation errors
  const originalRegister = plugin.controllers.auth.register;
  
  plugin.controllers.auth.register = async (ctx) => {
    // Extract custom fields from request BEFORE registration
    // Store them separately so we can use them after registration
    const originalBody = ctx.request.body || {};
    const name = originalBody.name;
    const phoneNumber = originalBody.phoneNumber;
    
    // Create new request body with ONLY standard registration fields
    // This prevents "Invalid parameters" validation errors
    // Explicitly remove name and phoneNumber to ensure they're not sent
    const cleanBody = {
      username: originalBody.username,
      email: originalBody.email,
      password: originalBody.password,
    };
    
    // Replace request body with clean version (no custom fields)
    ctx.request.body = cleanBody;
    
    // Call original register with only standard fields
    let response;
    try {
      response = await originalRegister(ctx);
    } catch (error) {
      // If registration fails, throw the error
      throw error;
    }
    
    // If registration successful and we have name/phoneNumber, update the user
    if (response && response.user && response.jwt && (name || phoneNumber)) {
      try {
        // Update user with custom fields
        const updateData = {};
        if (name) updateData.name = name;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        await strapi.entityService.update(
          'plugin::users-permissions.user',
          response.user.id,
          {
            data: updateData,
          }
        );
        
        // Refresh user data in response
        const updatedUser = await strapi.entityService.findOne(
          'plugin::users-permissions.user',
          response.user.id,
          { populate: '*' }
        );
        
        response.user = updatedUser;
      } catch (error) {
        // Log error but don't fail registration
        strapi.log.warn('Failed to update user profile with custom fields:', error);
      }
    }
    
    return response;
  };

  return plugin;
};

