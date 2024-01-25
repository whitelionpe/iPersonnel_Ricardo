import React, { useState } from "react";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { Button } from "devextreme-react";
import Icon from '@material-ui/core/Icon';
import { useSelector } from "react-redux";
import FrameReport from '../../../../../partials/components/iframeReport/iFrameReport';
import ProgramacionesManifiestosUrbanitoFilter from './ProgramacionesManifiestosUrbanitoFilter';
import CustomTabNav from '../../../../../partials/components/Tabs/CustomTabNav';
import Guid from 'devextreme/core/guid';
import { dateFormat, getDateOfDay } from '../../../../../../_metronic/utils/utils';
import TabPanel from "../../../../../partials/content/TabPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import Constants from "../../../../../store/config/Constants";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const ProgramacionesManifiestosUrbanito = (props) => {

  const { intl, setLoading } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const usuario = useSelector(state => state.auth.user);
  const classes = useStylesEncabezado();
  const { FechaInicio, FechaFin } = getDateOfDay();

  const initialState = {
    FechaDesde: new Date(), //new Date(),
    FechaHasta: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), //FechaFin,
    Placa: '',
    IdPiloto:'',
    IdPasajero:'',
    Rutas:'',
  }

  const [VerFrame, SetVerFrame] = useState(false);
  const [filterData, setFilterData] = useState(initialState);


  const [tabs, setTabs] = useState([{
    id: "idTabGeneral",
    nombre: intl.formatMessage({ id: "CAMP.RESERVATION.GENERAL" }),
    icon: <i class="flaticon2-search text-success" style={{ fontSize: "15px" }} />,
    bodyRender: (e) => { return <ProgramacionesManifiestosUrbanitoFilter {...e} /> }
  }]);
  const [tabActivo, setTabActivo] = useState(0);
  const [count, setCount] = useState(0);

  const cargarReporte = async (e) => {

    if (count > 10) {
      return;
    }

    let guid = new Guid();
    let id = guid.toString();
  
    let {
      FechaDesde,
      FechaHasta,
      Placa,
      IdPiloto,
      IdPasajero,
      Rutas
    } = filterData;

    FechaDesde = dateFormat(FechaDesde,'yyyyMMdd');
    FechaHasta = dateFormat(FechaHasta,'yyyyMMdd');
    
    let enviarParametros = {
      fechaDesde :FechaDesde,
      fechaHasta :FechaHasta,
      placa : Placa,
      idpiloto: IdPiloto,
      idPasajero:IdPasajero,
      rutas: Rutas,
      IdCliente:perfil.IdCliente,

    }

    let item = {
      id: "id_" + id,
      nombre: `${intl.formatMessage({ id: "CASINO.REPORT.SUBMENU" }).toUpperCase()}${`(${count + 1})`}`,
      icon: <i class="flaticon2-file text-danger" style={{ fontSize: "15px" }} />,
      VerFrame: true,
      bodyRender: (e) => {
        return <FrameReport
          ReportName={'TRANSPORTE_006_PROGRAMACIONES_MANIFIESTOS_URBANITO'}
          ReportDescription={''}
          PathReporte={'2PERSONNEL/Report'}
          Parametros={enviarParametros}
          Width={100}
          Height={600}
          HeightFrame={600}
          VerFrame={true}
          SetVerFrame={SetVerFrame}
        />
      },
      buttonDelete: true
    };

    let temptabs = tabs.length;
    setTabs(tabs => [...tabs, item]);
    if (tabs.length <= 1) {
      setCount(1);
    } else {
      setCount(count + 1);
    }
    document.getElementsByClassName('nav-item-custom')[temptabs].children[0].click();
  }

  const refresh = () => {
    setFilterData({ ...initialState });
  }

  return (
    <>
      <div className="row">
        <div className="col-md-12">
          <CustomBreadcrumbs Title={intl.formatMessage({ id: "TRANSPORT.MAIN" })} SubMenu={intl.formatMessage({ id: "CAMP.REPORT.REPORTS" })} Subtitle={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.SERVICIO_INTERNO_URBANI" })} />
          <Portlet>
            <AppBar position="static" className={classes.principal}>
              <Toolbar variant="dense" className={classes.toolbar}>
                <Typography variant="h6" color="inherit" className={classes.title}>
                  {intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.SERVICIO_INTERNO_URBANI" })}
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
                            onClick={refresh}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
                          >
                            <Icon className="fas fa-sync-alt clsIconRefresh" />
                          </Button>
                          &nbsp;
                          <Button
                            type="default"
                            icon="fa fa-search"
                            hint={intl.formatMessage({ id: "ACCESS.REPORT.VIEWREPORT" })}
                            onClick={cargarReporte}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
                          >
                            
                          </Button>
                        </PortletHeaderToolbar>
                      }
                    />
                  } />

                <PortletBody>
                  <div className="row">
                    <div className="col-12">
                      <CustomTabNav
                        elementos={tabs}
                        setElementos={setTabs}
                        tabActivo={tabActivo}
                        setTabActivo={setTabActivo}
                        validateRequerid={false}
                        evaluateRequerid={false}
                        parametrosGenerales={{
                          filterData: filterData,
                          setFilterData: setFilterData
                        }}
                      />
                    </div>
                  </div>

                </PortletBody>

              </TabPanel>
            </div>
          </Portlet>
        </div >
      </div>
    </>
  );
};
export default injectIntl(WithLoandingPanel(ProgramacionesManifiestosUrbanito));
