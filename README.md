# Cancel or Withdrawal Form

## Summary

SharePoint Framework (SPFx) web part for managing student cancellation and withdrawal requests. This form provides a comprehensive interface for collecting and processing student information, supporting both cancellation and withdrawal workflows with conditional fields based on request type.

## Used SharePoint Framework Version

![version](https://img.shields.io/badge/version-1.19.0-green.svg)

## Applies to

- [SharePoint Framework](https://aka.ms/spfx)
- [Microsoft 365 tenant](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)

> Get your own free development tenant by subscribing to [Microsoft 365 developer program](http://aka.ms/o365devprogram)

## Prerequisites

- Node.js version 18.17.1 or higher (but less than 19.0.0)
- SharePoint environment with appropriate list permissions
- CDOA to DSM mapping list configured in SharePoint

## Solution

| Solution    | Author(s)                                               |
| ----------- | ------------------------------------------------------- |
| corw | Internal Development Team |

## Version history

| Version | Date             | Comments        |
| ------- | ---------------- | --------------- |
| 1.2     | January 2025     | Updated field labels: DSM→CDSM, Cancel Reason Note→Cancel Reason Notes (multiline), updated Financial Aid Advisor field label |
| 1.1     | March 10, 2021   | Update comment  |
| 1.0     | January 29, 2021 | Initial release |

## Disclaimer

**THIS CODE IS PROVIDED _AS IS_ WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.**

---

## Minimal Path to Awesome

- Clone this repository
- Ensure that you are at the solution folder
- in the command-line run:
  - **npm install**
  - **npm run serve** (for development)
  - **npm run ship** (for production deployment)

## Features

This web part provides a comprehensive form for managing student cancellation and withdrawal requests with the following features:

### Core Functionality
- **Dual workflow support**: Handles both student cancellations and withdrawals
- **Conditional form fields**: Dynamic form that shows/hides fields based on request type
- **Data validation**: Built-in form validation using Yup schema validation
- **SharePoint integration**: Seamlessly integrates with SharePoint lists for data storage

### Form Fields
- **Student Information**: Name, ID, start date
- **Request Type**: Cancel or Withdrawal selection with conditional fields
- **CDOA/CDSM Integration**: Automated mapping between CDOA and CDSM
- **Date Tracking**: Start dates, last contact, withdrawal request dates
- **Notes and Reasons**: Multiline text areas for detailed information capture
- **People Picker**: Financial Aid/Admissions Advisor selection
- **Status Tracking**: ESA, LDA, and documentation status

### Technical Features
- React Hook Form for efficient form state management
- Fluent UI components for consistent SharePoint experience
- TypeScript for type safety and better development experience
- Responsive design for various screen sizes
- Error handling and user feedback

## Technical Architecture

- **Frontend**: React with TypeScript
- **Form Management**: React Hook Form with Yup validation
- **UI Framework**: Fluent UI React components
- **State Management**: React hooks (useState, custom hooks)
- **API Integration**: SharePoint REST API via SPHttpClient
- **Build System**: SPFx build toolchain with Webpack

## References

- [Getting started with SharePoint Framework](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-developer-tenant)
- [Building for Microsoft teams](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/build-for-teams-overview)
- [Use Microsoft Graph in your solution](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/get-started/using-microsoft-graph-apis)
- [Publish SharePoint Framework applications to the Marketplace](https://docs.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-overview)
- [Microsoft 365 Patterns and Practices](https://aka.ms/m365pnp) - Guidance, tooling, samples and open-source controls for your Microsoft 365 development
