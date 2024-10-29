import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "CancelWithdrawalFormWebPartStrings";
import CancelWithdrawalForm from "./components/CancelWithdrawalForm";
import { IPeoplePickerContext } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { SPHttpClient } from "@microsoft/sp-http";

export interface ICancelWithdrawalFormWebPartProps {
  absoluteUrl: string;
  context: IPeoplePickerContext;
  spHttpClient: SPHttpClient;
  cdoaToDSMListURL: "https://livecareered.sharepoint.com/sites/Forms/Lists/CDOA%20to%20DSM%20Map/AllItems.aspx";
  formList: `https://livecareered.sharepoint.com/sites/Forms/_api/web/Lists/getbytitle('Cancel%20or%20Withdrawal%20Request%20Form%20Test')/items`;
}

export default class CancelWithdrawalFormWebPart extends BaseClientSideWebPart<ICancelWithdrawalFormWebPartProps> {
  public render(): void {
    const list1 =
      "https://livecareered.sharepoint.com/sites/Forms/Lists/CDOA%20to%20DSM%20Map/AllItems.aspx";
    const list2 =
      "https://livecareered.sharepoint.com/sites/Forms/_api/web/Lists/getbytitle('Cancel%20or%20Withdrawal%20Request%20Form%20Test')/items";
    const element: React.ReactElement<ICancelWithdrawalFormWebPartProps> =
      React.createElement(CancelWithdrawalForm, {
        absoluteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        context: {
          absoluteUrl: this.context.pageContext.web.absoluteUrl,
          msGraphClientFactory: this.context.msGraphClientFactory,
          spHttpClient: this.context.spHttpClient,
        },
        cdoaToDSMListURL: list1,
        formList: list2,
      });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
