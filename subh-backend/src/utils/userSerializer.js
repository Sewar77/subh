export const serializeUser = (user) => {
  if (!user) {
    return null;
  }

  const fullName = user.full_name ?? user.fullName ?? user.name ?? null;
  const phoneNumber = user.phone_number ?? user.phoneNumber ?? null;
  const userType = user.user_type ?? user.userType ?? null;
  const isActive = user.is_active ?? user.isActive ?? false;
  const emailVerified = user.email_verified ?? user.emailVerified ?? false;

  return {
    id: user.id,
    name: fullName,
    fullName,
    email: user.email,
    phoneNumber,
    role: user.role,
    userType,
    user_type: userType,
    isActive,
    is_active: isActive,
    emailVerified,
    createdAt: user.created_at ?? user.createdAt ?? null,
    updatedAt: user.updated_at ?? user.updatedAt ?? null,
  };
};
