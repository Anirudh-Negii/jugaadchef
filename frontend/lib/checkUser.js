import { currentUser } from "@clerk/nextjs/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    console.error("No user is currently signed in.");
    return null;
  }
  if (!STRAPI_API_TOKEN) {
    console.error("Strapi API token is missing in the environment variables.");
    return null;
  }

  const subscriptionTier = "free"; // pricing logic to be implemented later

  try {
    // Check if the user exists in Strapi
    const existingUserResponse = await fetch(
      `${STRAPI_URL}/api/users?filters[clerkId][$eq]=${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (!existingUserResponse.ok) {
      const errorText = await existingUserResponse.text();
      console.error("Error fetching user from Strapi:", errorText);
      return null;
    }

    const existingUserData = await existingUserResponse.json();

    if (existingUserData.length > 0) {
      const existingUser = existingUserData[0];

      if (existingUser.subscriptionTier !== subscriptionTier) {
        await fetch(`${STRAPI_URL}/api/users/${existingUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${STRAPI_API_TOKEN}`,
          },
          body: JSON.stringify({ subscriptionTier }),
        });
      }

      return { ...existingUser, subscriptionTier };
    }

    // If the user doesn't exist, create a new user in Strapi
    // Get authorization roles from Strapi
    const rolesResponse = await fetch(
      `${STRAPI_URL}/api/users-permissions/roles`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_TOKEN}`,
        },
      },
    );

    const rolesData = await rolesResponse.json();
    const authenticatedRole = rolesData.roles?.find((role) => role.type === "authenticated");

    if (!authenticatedRole) {
      console.error("Authenticated role not found in Strapi.");
      return null;
    }

    const userData = {
      username: user.username || user.emailAddresses[0].emailAddress.split("@")[0],
      email: user.emailAddresses[0].emailAddress,
      password: `clerk_managed_${user.id}_${Date.now()}`, // Generate a password based on Clerk user ID
      confirmed: true,
      blocked: false,
      role: authenticatedRole.id,
      clerkId: user.id,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      subscriptionTier,
    };

    const newUserResponse = await fetch(`${STRAPI_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify(userData),
    });

    if (!newUserResponse.ok) {
      const errorText = await newUserResponse.text();
      console.error("Error creating user in Strapi:", errorText);
      return null;
    }
    const newUser = await newUserResponse.json();
    return newUser;
  } catch (error) {
    console.error("Error in checkUser function:", error.message);
    return null;
  }
};
