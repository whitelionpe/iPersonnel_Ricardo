import React from "react";
import { injectIntl } from "react-intl";
import CustomBreadcrumbs from "../../layout/CustomBreadcrumbs";
import { Portlet } from "../../content/Portlet";
import { AppBar, Toolbar, Typography } from "@material-ui/core";
import {
  useStylesEncabezado,
  useStylesTab
} from "../../../store/config/Styles";
import TabPanel from "../../content/TabPanel";
import DynamicReportBody from "./DynamicReportBody";
import DynamicReportHeader from "./DynamicReportHeader";

const DynamicReport = ({
  id = "",
  menutitle = "",
  submenuTitle = "",
  menusubtitle = "",
  titleReport = "",
  eventSearch = () => { },
  eventRefresh = () => { },
  eventExport = { parameters: {}, event: () => { } },
  dataSource = {
    columns: [],
    labels: [],
    data: []
  },
  additionalProperties = [],
  dataGridProperties = {},
  children,
  intl
}) => {
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();

  return (
    <div className="row">
      <div className="col-md-12">
        <CustomBreadcrumbs
          Title={menutitle}
          SubMenu={submenuTitle}
          Subtitle={menusubtitle}
        />
        <Portlet>
          <AppBar position="static" className={classesEncabezado.principal}>
            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
              <Typography
                variant="h6"
                color="inherit"
                className={classesEncabezado.title}
              >
                {titleReport}
              </Typography>
            </Toolbar>
          </AppBar>
          <>
            <DynamicReportHeader
              id={id}
              intl={intl}
              eventSearch={eventSearch}
              eventRefresh={eventRefresh}
              eventExport={eventExport}
            >
              {children}
            </DynamicReportHeader>
            <DynamicReportBody
              intl={intl}
              dataSource={dataSource}
              additionalProperties={additionalProperties}
              dataGridProperties={dataGridProperties}
            />
          </>
        </Portlet>
      </div>
    </div>
  );
};

export default injectIntl(DynamicReport);
