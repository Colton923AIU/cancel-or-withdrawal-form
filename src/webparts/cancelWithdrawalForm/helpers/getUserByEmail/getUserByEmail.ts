import { SPHttpClient } from '@microsoft/sp-http';

type TgetUserIdByemail = {
  spHttpClient: SPHttpClient;
  email: string;
  formList: string;
};

const getUserIdByemail: ({
  spHttpClient,
  email,
  formList,
}: TgetUserIdByemail) => Promise<{
  Id: number;
  Title: any;
  Email: any;
}> = async ({ spHttpClient, email, formList }: TgetUserIdByemail) => {
  const basePath = new URL(formList).origin;
  const subsites = formList.split('Lists')[0].split('com')[1];
  const listUrl =
    basePath + subsites + `siteusers?$filter=Email%20eq%20'${email}'`;

  const response = await spHttpClient.get(
    listUrl,
    SPHttpClient.configurations.v1
  );

  if (!response.ok) {
    throw new Error('Error fetching user: ' + response.statusText);
  }

  const data = await response.json();
  const user = data.value[0];
  return {
    Id: parseInt(user.Id),
    Title: user.Title,
    Email: user.Email,
  };
};

export default getUserIdByemail;
