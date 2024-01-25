import { Button } from "devextreme-react";
import React, { useRef } from "react";
import WithLoandingPanel from "../../content/withLoandingPanel";
import { isNotEmpty } from "../../../../_metronic";
import {
  handleErrorMessages,
  handleSuccessMessages
} from "../../../store/ducks/notify-messages";

const ButtonBar = ({
  intl,
  showSearchButton = true,
  showFilterButton = true,
  showRefreshButton = true,
  showExportButton = false,

  viewFilter = false,
  OnClickHidenFilter = () => {},
  OnClickFilter = () => {},
  OnClickRefresh = () => {},
  OnClickExport = () => {},
  validationGroup = "FormEdicion",
  id = "buttonbar",
  setLoading
}) => {
  const objDownload = useRef(null);
  const exportReport = async e => {
    //OnClickExport
    setLoading(true);
    let parametersReport = await OnClickExport();
    let { parameters, event } = parametersReport;

    console.log({ parametersReport, parameters, event });
    await event(parameters)
      .then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = objDownload.current;
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(
            response.fileBase64
          )}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(
            intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" })
          );
        }
      })
      .catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err);
      })
      .finally(() => {
        setLoading(false);
      });
    setLoading(false);
  };

  return (
    <>
      {showSearchButton && (
        <Button
          icon={viewFilter ? "chevronup" : "chevrondown"}
          type="default"
          hint={
            viewFilter
              ? intl.formatMessage({ id: "COMMON.HIDE" })
              : intl.formatMessage({ id: "COMMON.SHOW" })
          }
          onClick={OnClickHidenFilter}
        />
      )}
      &nbsp;
      {showFilterButton && (
        <Button
          icon="fa fa-search"
          type="default"
          hint={intl.formatMessage({ id: "ACTION.FILTER" })}
          onClick={OnClickFilter}
          useSubmitBehavior={true}
          validationGroup={validationGroup}
        />
      )}
      &nbsp;
      {showRefreshButton && (
        <Button
          icon="refresh"
          type="default"
          hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
          onClick={OnClickRefresh}
        />
      )}
      &nbsp;
      {showExportButton && (
        <Button
          icon="fa fa-file-excel"
          type="default"
          hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
          onClick={exportReport}
        />
      )}
      {showExportButton && (
        <a
          ref={objDownload}
          id={`idd_${id}`}
          href="#id"
          style={{ display: "none" }}
        >
          download
        </a>
      )}
    </>
  );
};

export default WithLoandingPanel(ButtonBar);
