import { SPHttpClient } from "@microsoft/sp-http";

type TgetUserIdByemail = {
  spHttpClient: SPHttpClient;
  email: string;
  formListTitle: string;
  absoluteUrl: string;
};

// Helper function to build SharePoint list URL from site URL and list title
const buildListUrl = (siteUrl: string, listTitle: string): string => {
  return `${siteUrl}/Lists/${listTitle}/AllItems.aspx`;
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
  formListTitle,
  absoluteUrl,
}: TgetUserIdByemail): Promise<User> => {
  // Ensure email is URL-encoded
  const encodedEmail = encodeURIComponent(email);
  const listUrl = buildListUrl(absoluteUrl, formListTitle);
  const basePath = new URL(listUrl).origin;
  const subsites = listUrl.split("Lists")[0].split("com")[1];
  const listApiUrl =
    basePath +
    subsites +
    `_api/web/siteusers?$filter=Email%20eq%20'${encodedEmail}'`;

  try {
    const response = await spHttpClient.get(
      listApiUrl,
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
