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
  cdoaToDSMListTitle: string;
  formListTitle: string;
}

export default class CancelWithdrawalFormWebPart extends BaseClientSideWebPart<ICancelWithdrawalFormWebPartProps> {
  public render(): void {
    const element: React.ReactElement<ICancelWithdrawalFormWebPartProps> =
      React.createElement(CancelWithdrawalForm, {
        absoluteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: this.context.spHttpClient,
        context: {
          absoluteUrl: this.context.pageContext.web.absoluteUrl,
          msGraphClientFactory: this.context.msGraphClientFactory,
          spHttpClient: this.context.spHttpClient,
        },
        cdoaToDSMListTitle: this.properties.cdoaToDSMListTitle,
        formListTitle: this.properties.formListTitle,
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
                PropertyPaneTextField("cdoaToDSMListTitle", {
                  label: "CDOA to DSM Map List Title",
                  description: "Enter the exact list title (e.g. 'CDOA to DSM Map')"
                }),
                PropertyPaneTextField("formListTitle", {
                  label: "Data List Title", 
                  description: "Enter the exact list title (e.g. 'Cancel Withdrawal Request Form')"
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
