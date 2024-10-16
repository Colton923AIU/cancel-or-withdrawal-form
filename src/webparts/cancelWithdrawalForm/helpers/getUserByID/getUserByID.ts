import { SPHttpClient } from '@microsoft/sp-http';

type TgetUserByIDProps = {
  id: string;
  url: string;
  spHttpClient: SPHttpClient;
};

const getUserByID: ({
  id,
  url,
  spHttpClient,
}: TgetUserByIDProps) => Promise<any> = async ({
  id,
  url,
  spHttpClient,
}: TgetUserByIDProps) => {
  const basePath = new URL(url).origin;
  const subsites = url.split('Lists')[0].split('com')[1];

  const listUrl = basePath + subsites + `_api/web/getUserByID(${id})`;
  try {
    const response = await spHttpClient.get(
      listUrl,
      SPHttpClient.configurations.v1
    );
    const data = await response.json();
    if (data) {
      return data;
    }
  } catch {
    console.log('Response from SP List Getter Failed');
    return undefined;
  }
};

export default getUserByID;
