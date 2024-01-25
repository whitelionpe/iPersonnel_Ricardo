import React, { Fragment } from 'react';
import CustomBreadcrumbs from "../../../partials/layout/CustomBreadcrumbs";
import { Portlet } from "../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import TabPanel, { tabPropsIndex } from "../../../partials/content/TabPanel";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import {
  useStylesEncabezado,
  useStylesTab,
} from "../../../store/config/Styles";
import { LegendTitle } from 'devextreme-react/chart';
import { isNotEmpty } from '../../../../_metronic';

//import { PaginationSetting } from '../../../../_metronic/utils/utils'; 

const TabNavContainer = ({
  title = '', //intl.formatMessage({ id: "CAMP.REPORT.MENU" })
  submenu = '',//intl.formatMessage({ id: "CONFIG.MENU.CAMPAMENTOS.CONSULTAS" })
  subtitle = '',//intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })
  nombrebarra = '',//intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })
  handleChange = () => { },
  componentTabsHeaders = [], //{label,icon,disabled,onClick}
  componentTabsBody = [],
  tabIndex = 0,
  value = '',
  className = {},
  orientation='vertical',
  isVisibleCustomBread = true,
  isVisibleAppBar = true,
  children = undefined
}) => {

  const classes = useStylesTab();
  const classesEncabezado = useStylesEncabezado();

  if (className === null) {
    className = classes.tabContent;
  }

  return (
    <Fragment>
      <div className="row">
        <div className="col-md-12">

          { isVisibleCustomBread && (
            <CustomBreadcrumbs
            Title={title}
            SubMenu={submenu}
            Subtitle={subtitle}
          />
          )}
        
          <Portlet className={classesEncabezado.border}>

          { isVisibleAppBar && (
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {nombrebarra}
                </Typography>
              </Toolbar>
            </AppBar>
              )}
            <>
                <div className={orientation === 'vertical'? classes.root:''}>
                <Tabs
                  orientation={orientation}
                  //value={value}
                  value={tabIndex}
                  onChange={handleChange}
                  // aria-label="Vertical tabs"
                  className={classes.tabs}
                  variant={orientation === 'vertical'? "fullWidth" :''}
                  indicatorColor="primary"
                  textColor="primary"
                >
                  {
                    componentTabsHeaders.map((item, index) => (
                      <Tab
                        key={`tph_${index}`}
                        label={item.label}
                        icon={item.icon}
                        className={isNotEmpty(item.className) ? item.className : className}
                        disabled={item.disabled}
                        {...tabPropsIndex(index)}
                        onClick={item.onClick}
                      />
                    ))
                  }

                </Tabs>

                {componentTabsBody.length > 0 && componentTabsBody.map((item, index) => (
                  <TabPanel
                    key={`tpb_${index}`}
                    value={tabIndex}
                    className={classes.TabPanel}
                    index={index}>
                    {item}
                  </TabPanel>
                ))}

                {!!children && Array.isArray(children) && (
                  children.map((child, index) => (
                    <TabPanel
                      key={`tpb_${index}`}
                      value={tabIndex}
                      className={classes.TabPanel}
                      index={index}>
                      {child}
                    </TabPanel>
                  ))
                )}
                
                {!!children && !Array.isArray(children) && (
                  <TabPanel
                    value={tabIndex}
                    className={classes.TabPanel}
                    index={0}>
                    {children}
                  </TabPanel>
                )}
              </div>
                      
            </>
          </Portlet>
        </div>
      </div>
    </Fragment>
  );
};

export default TabNavContainer;
