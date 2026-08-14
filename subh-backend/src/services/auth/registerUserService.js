import pool from "../../config/db.js";
import { createUser } from "../../models/auth.Models.js";
import { createCompanyProfile } from "../../models/companyProfile.Model.js";

export const registerUserAccount = async ({ user, companyProfile = null }, {
  dbPool = pool,
} = {}) => {
  const client = await dbPool.connect();

  try {
    await client.query("BEGIN");
    const createdUser = await createUser(user, client);
    let createdCompanyProfile = null;

    if (companyProfile) {
      createdCompanyProfile = await createCompanyProfile(
        { ...companyProfile, userId: createdUser.id },
        client,
      );
    }

    await client.query("COMMIT");
    return { user: createdUser, companyProfile: createdCompanyProfile };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
