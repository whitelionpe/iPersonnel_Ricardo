import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Form, { GroupItem, Item } from 'devextreme-react/form';
import Typography from "@material-ui/core/Typography";
import {
  Portlet,
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";

import TabPanel from "../../../../../partials/content/TabPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
//FrameReport:
import FrameReport from '../../../../../partials/components/iframeReport/iFrameReport';
// import { obtener } from '../../../../api/seguridad/usuario.api';
import CustomTabNav from '../../../../../partials/components/Tabs/CustomTabNav';
import Guid from 'devextreme/core/guid';
import { dateFormat, isNotEmpty } from "../../../../../../_metronic/utils/utils";
import Constants from "../../../../../store/config/Constants";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const OcupacionBuses = (props) => {
  const { intl, setLoading } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const classes = useStylesEncabezado();
  const usuario = useSelector(state => state.auth.user);

  // ------------------------------
  // Configuracion de reporte
  // ------------------------------

  const [dataRowEditNew, setDataRowEditNew] = useState({
    esNuevoRegistro: true,
    Fecha: new Date(),
    Reporte: ''
  });

  // ------------------------------
  // Tabs - Reporte
  // ------------------------------ 
  const [tabs, setTabs] = useState([{
    id: "idTabGeneral",
    nombre: intl.formatMessage({ id: "CAMP.RESERVATION.GENERAL" }),
    icon: <i class="flaticon2-search text-success" style={{ fontSize: "15px" }} />,
    bodyRender: () => {

      return <Form formData={dataRowEditNew}>
        <GroupItem itemType="group" colCount={4}>
          <Item dataField="Fecha"
            label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" }) }}
            editorType="dxDateBox"
            editorOptions={{
            type: "date",
            showClearButton: true,
            displayFormat: "dd/MM/yyyy",
            }}
          />
        </GroupItem>
      </Form>
    }
  }]);

  const [tabActivo, setTabActivo] = useState(0);
  const [count, setCount] = useState(0);

  /* =========================================================================================================================================== */

  const generarReporte = async () => {
    if (count > 20) {
      return;
    }
    let guid = new Guid();
    let id = guid.toString();

    if (isNotEmpty(dataRowEditNew.Fecha)) {

      var fecha = dateFormat(dataRowEditNew.Fecha, 'yyyyMMdd');
      var fechaFormato = dateFormat(dataRowEditNew.Fecha, 'dd-MM-yyyy')

      let parametros = {
        Fecha: fecha,
        Compania : isNotEmpty(Constants.DESCRIPCION_COMPANIA_DEFAULT) ? Constants.DESCRIPCION_COMPANIA_DEFAULT:"",
        IdCliente: perfil.IdCliente,
        };

      let item = {
        id: "id_" + id,
        nombre: `${intl.formatMessage({ id: "CASINO.REPORT.SUBMENU" }).toUpperCase()}${`(${count + 1})`}`,
        icon: <i class="flaticon2-file text-danger" style={{ fontSize: "15px" }} />,
        VerFrame: false,
        bodyRender: (e) => {
          return <FrameReport
          ReportName={'TRANSPORTE_003_OCUPACION_BUSES'}
          ReportDescription={''}
          PathReporte={'2PERSONNEL/Report'}
            Parametros={parametros}
            Width={100}
            Height={600}
            HeightFrame={600}
            VerFrame={true}
            SetVerFrame={() => { }}
          />
        },
        buttonDelete: true
      };

      setTabs(tabs => [...tabs, item]);
      if (tabs.length <= 1) {
        setCount(1);
      } else {
        setCount(count + 1);
      }
    }
  }

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <CustomBreadcrumbs Title={intl.formatMessage({ id: "TRANSPORT.MAIN" })} SubMenu={intl.formatMessage({ id: "CAMP.REPORT.REPORTS" })} Subtitle={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.OCUPACIÓN_DE_BUSES" })} />
          <Portlet>
            <AppBar position="static" className={classes.principal}>
              <Toolbar variant="dense" className={classes.toolbar}>
                <Typography variant="h6" color="inherit" className={classes.title}>
                  {intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.OCUPACIÓN_DE_BUSES" })}
                </Typography>
              </Toolbar>
            </AppBar>
            <div className={classes.root}>
              <TabPanel value={0} className={classes.TabPanel} index={0}>
                {/* --------------------------------------------------------------------- */}
                <HeaderInformation data={() => { }} visible={true} labelLocation={'left'} colCount={1}
                  toolbar={
                    <PortletHeader
                      title={""}
                      toolbar={
                        <PortletHeaderToolbar>
                          &nbsp;
                          <Button
                            type="default"
                            icon="fa fa-search"
                            hint={intl.formatMessage({ id: "ACCESS.REPORT.VIEWREPORT" })}
                            onClick={generarReporte}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
                          >
                          
                          </Button>

                        </PortletHeaderToolbar>
                      }
                    />
                  } />

                <PortletBody >
                  <React.Fragment>
                    <div className="row">
                      <div className="col-12">
                        <CustomTabNav
                          elementos={tabs}
                          setElementos={setTabs}
                          tabActivo={tabActivo}
                          setTabActivo={setTabActivo}
                          validateRequerid={false}
                          evaluateRequerid={false}
                        />
                      </div>
                    </div>
                  </React.Fragment>
                </PortletBody>

              </TabPanel>
            </div>
          </Portlet>
        </div>
      </div>
    </>
  );
};
export default injectIntl(WithLoandingPanel(OcupacionBuses));
