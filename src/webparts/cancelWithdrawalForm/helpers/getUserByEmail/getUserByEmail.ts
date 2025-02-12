import { SPHttpClient } from "@microsoft/sp-http";

type TgetUserIdByemail = {
  spHttpClient: SPHttpClient;
  email: string;
  formList: string;
};

// Define the expected response structure more precisely
type User = {
  Id: number;
  Title: string;
  Email: string;
};

const getUserIdByemail = async ({
  spHttpClient,
  email,
  formList,
}: TgetUserIdByemail): Promise<User> => {
  // Ensure email is URL-encoded
  const encodedEmail = encodeURIComponent(email);
  const basePath = new URL(formList).origin;
  const subsites = formList.split("Lists")[0].split("com")[1];
  const listUrl =
    basePath +
    subsites +
    `_api/web/siteusers?$filter=Email%20eq%20'${encodedEmail}'`;

  try {
    const response = await spHttpClient.get(
      listUrl,
      SPHttpClient.configurations.v1
    );

    if (!response.ok) {
      throw new Error("Error fetching user: " + response.statusText);
    }

    const data = await response.json();

    // Check if data.value is not empty
    if (data.value && data.value.length > 0) {
      const user = data.value[0];
      return {
        Id: parseInt(user.Id, 10), // Ensure we parse the Id as an integer
        Title: user.Title,
        Email: user.Email,
      };
    } else {
      throw new Error("No user found with the provided email.");
    }
  } catch (error) {
    console.error("Error in getUserIdByemail:", error);
    throw error; // Re-throw the error to handle it where the function is called
  }
};

export default getUserIdByemail;
