import Constants from "./Constants";

export const AzureADConfiguration = {
  appId: Constants.AZURE_AD_APP_ID,
  scopes: [
    Constants.AZURE_AD_SCOPE_DEFAULT
  ],
  authority: Constants.AZURE_AD_AUTHORITY
}
