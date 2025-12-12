import bcrypt from 'bcryptjs';

interface LifecycleEvent {
  params: {
    data?: Record<string, any>;
  };
  result: Record<string, any>;
}

export default {
  async beforeCreate(event: LifecycleEvent) {
    const { params } = event;

    console.log("Before Create =>", params);

    if (params.data?.email) {
      params.data.email = params.data.email.toLowerCase();
      console.log(params.data.email);
    }
  },

  async afterCreate(event: LifecycleEvent) {
    console.log("After Create _________________________");

    const { result } = event;

    if (result.password) {
      const cleanedPassword = result.password.replace(/\s/g, '');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(cleanedPassword, saltRounds);

      await strapi.db.query('api::ezimart-user.ezimart-user').updateMany({
        where: { email: result.email },
        data: { password: hashedPassword },
      });
    }
  },
};
