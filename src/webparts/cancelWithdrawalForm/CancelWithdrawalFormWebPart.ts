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
  cdoaToDSMListURL: string;
  formList: string;
}

export default class CancelWithdrawalFormWebPart extends BaseClientSideWebPart<ICancelWithdrawalFormWebPartProps> {
  public render(): void {
    // "https://livecareered.sharepoint.com/sites/Forms/Lists/CDOA%20to%20DSM%20Map/AllItems.aspx";
    // "https://livecareered.sharepoint.com/sites/Forms/_api/web/Lists(guid'94A734FD-3047-4D2A-B3B3-9CC591E017A2')/items";

    const element: React.ReactElement<ICancelWithdrawalFormWebPartProps> =
      React.createElement(CancelWithdrawalForm, {
        absoluteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        context: {
          absoluteUrl: this.context.pageContext.web.absoluteUrl,
          msGraphClientFactory: this.context.msGraphClientFactory,
          spHttpClient: this.context.spHttpClient,
        },
        cdoaToDSMListURL: this.properties.cdoaToDSMListURL,
        formList: this.properties.formList,
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
                PropertyPaneTextField("cdoaToDSMListURL", {
                  label: "CDOA to DSM Map Link",
                }),
                PropertyPaneTextField("formList", {
                  label: "Data List Link",
                }),
              ],
            },
          ],
        },
      ],
    };
  }
  protected get disableReactivePropertyChanges(): boolean {
    return true;
  }
}
