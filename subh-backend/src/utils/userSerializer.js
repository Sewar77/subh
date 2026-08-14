const serializeCompanySummary = (companyProfile) => {
  if (!companyProfile) return null;

  return {
    companyName:
      companyProfile.company_name ?? companyProfile.companyName ?? null,
    employeeCount:
      companyProfile.employee_count ?? companyProfile.employeeCount ?? null,
    verificationStatus:
      companyProfile.verification_status ??
      companyProfile.verificationStatus ??
      null,
  };
};

const serializeAdminCompanyProfile = (companyProfile) => {
  const summary = serializeCompanySummary(companyProfile);
  if (!summary) return null;

  return {
    ...summary,
    ein: companyProfile.ein ?? null,
    registrationNumber:
      companyProfile.registration_number ??
      companyProfile.registrationNumber ??
      null,
    registrationState:
      companyProfile.registration_state ??
      companyProfile.registrationState ??
      null,
    website: companyProfile.website ?? null,
  };
};

export const serializeUser = (
  user,
  { companyProfile = null, companyView = "none" } = {},
) => {
  if (!user) {
    return null;
  }

  const fullName = user.full_name ?? user.fullName ?? user.name ?? null;
  const phoneNumber = user.phone_number ?? user.phoneNumber ?? null;
  const userType = user.user_type ?? user.userType ?? null;
  const isActive = user.is_active ?? user.isActive ?? false;
  const emailVerified = user.email_verified ?? user.emailVerified ?? false;

  const serialized = {
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

  if (companyView === "summary" && companyProfile) {
    serialized.companyProfile = serializeCompanySummary(companyProfile);
  }
  if (companyView === "admin" && companyProfile) {
    serialized.companyProfile = serializeAdminCompanyProfile(companyProfile);
  }

  return serialized;
};
