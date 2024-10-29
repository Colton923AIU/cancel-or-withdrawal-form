import * as React from "react";

import { useSharePointList } from "../../hooks";
import getUserByID from "../../helpers/getUserByID/getUserByID";
import { SPHttpClient } from "@microsoft/sp-http";

type TCDOAtoDSMListItem = {
  CDOAId: number;
  DSMId: number;
};

type TUseDataProps = {
  absoluteUrl: string;
  spHttpClient: SPHttpClient;
  spListLink: string;
};

type TUserData = {
  "@odata.context": string;
  "@odata.editLink": string;
  "@odata.id": string;
  "@odata.type": string;
  Email: string;
  Expiration: string;
  Id: number;
  IsEmailAuthenticationGuestUser: boolean;
  IsHiddenInUI: boolean;
  IsSharedByEmailGuestUser: boolean;
  IsSiteAdmin: boolean;
  LoginName: string;
  PrincipalType: number;
  Title: string;
  UserId: {
    NameId: string;
    NameIdIssuer: string;
  };
  UserPrincipalName: string;
};

const useData: ({
  absoluteUrl,
  spHttpClient,
  spListLink,
}: TUseDataProps) => { CDOA: TUserData; DSM: TUserData }[] | null = ({
  absoluteUrl,
  spHttpClient,
  spListLink,
}: TUseDataProps) => {
  const cdoaToDSMList = useSharePointList({
    absoluteUrl: absoluteUrl,
    client: spHttpClient,
    spListLink: spListLink,
  })?.map((item) => {
    return {
      CDOAId: item.CDOAId,
      DSMId: item.DSMId,
    } as TCDOAtoDSMListItem;
  });

  // Wrap the async operation in useEffect to avoid returning promises directly in the render
  const [resolvedData, setResolvedData] = React.useState<
    {
      CDOA: TUserData;
      DSM: TUserData;
    }[]
  >([]);
  const stopFetching = React.useRef(false);

  React.useEffect(() => {
    if (stopFetching.current) return;
    if (cdoaToDSMList) {
      const asyncPromise = async () => {
        await Promise.all(
          cdoaToDSMList.map(async (item) => {
            return {
              CDOA: (await getUserByID({
                id: item.CDOAId.toString(),
                spHttpClient: spHttpClient,
                url: spListLink,
              })) as TUserData,
              DSM: (await getUserByID({
                id: item.DSMId.toString(),
                spHttpClient: spHttpClient,
                url: spListLink,
              })) as TUserData,
            };
          })
        ).then((data) => {
          setResolvedData(data);
          stopFetching.current = true;
        });
      };
      void asyncPromise();
    }
  }, [cdoaToDSMList]);

  if (resolvedData.length === 0) {
    return null;
  }
  return resolvedData;
};

export default useData;
