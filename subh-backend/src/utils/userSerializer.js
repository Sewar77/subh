export const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    firstName: user.name,
    email: user.email,
    role: user.role,
    userType: user.user_type,
    phone_number: user.phonenumber,
  };
};
