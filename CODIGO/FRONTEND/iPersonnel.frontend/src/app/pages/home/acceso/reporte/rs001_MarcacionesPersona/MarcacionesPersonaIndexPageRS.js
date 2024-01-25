import React, { Fragment, useState, useEffect } from 'react';

import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { useStylesEncabezado, useStylesTab } from "../../../../../store/config/Styles";
import CustomBreadcrumbs from "../../../../../partials/layout/CustomBreadcrumbs";
import { isNotEmpty } from "../../../../../../_metronic";
import { Portlet } from "../../../../../partials/content/Portlet";
import TabPanel from "../../../../../partials/content/TabPanel";
import { dateFormat, getDateOfDay } from '../../../../../../_metronic/utils/utils';

import CustomTabNav from '../../../../../partials/components/Tabs/CustomTabNav';
import MarcacionesPersonaFilterPage from './MarcacionesPersonaFilterPage';
import Guid from 'devextreme/core/guid';
import FrameReport from '../../../../../partials/components/iframeReport/iFrameReport';

const MarcacionesPersonaIndexPageRS = (props) => {
  const { intl, setLoading, dataMenu } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const { FechaFin } = getDateOfDay();
  let hoy = new Date();
  let fecIni = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const [dataRowEditNew, setDataRowEditNew] = useState({
    esNuevoRegistro: true,
    Compania: "",
    ListaDivision: [],
    UnidadOrganizativa: "",
    ListaPersona: [],
    FechaInicio: fecIni,
    FechaFin: FechaFin,
    HoraInicio: fecIni,
    HoraFin: FechaFin,
    IdReporte: '',
    IdZona: '',
    IdPuerta: '',
    IdTipoMarcacion: '',
    Funcion: '',
    TipoAcceso: '',
    Reporte: ''
  });


  const [tabs, setTabs] = useState([{
    id: "idTabGeneral",
    nombre: 'General',
    icon: <i class="flaticon2-search text-success" style={{ fontSize: "15px" }} />,
    bodyRender: (e) => { return <MarcacionesPersonaFilterPage dataRowEditNew={dataRowEditNew} setDataRowEditNew={setDataRowEditNew} /> }
  }]);

  // const pintarFiltro = () => {
  //   return
  // }

  const [tabActivo, setTabActivo] = useState(0);
  const [count, setCount] = useState(0);

  const generarReporte = (e) => {
    //console.log('hoja -> ', count, tabs.length);
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (count > 20) {
        handleInfoMessages('20 es Maximo de pestañas creadas', '');
        //console.log('Maximo de pestañas creadas');
        return;
      }
      //console.log("generarReporte elementos.", dataRowEditNew);
      //if (dataRowEditNew.FechaInicio != '' && dataRowEditNew.IdReporte != '') {
      setLoading(true);
      let guid = new Guid();
      let id = guid.toString();

      let IdCliente = perfil.IdCliente;
      let Companias = dataRowEditNew.IdCompania;//dataRowEditNew.ListaCompania.map(x => (x.IdCompania)).join(',');
      let UnidadesOrganizativa = dataRowEditNew.IdUnidadOrganizativa;//dataRowEditNew.ListaUnidadOrganizativa.map(x => (x.IdUnidadOrganizativa)).join(',');
      let IdZona = dataRowEditNew.IdZona;
      let IdPuerta = dataRowEditNew.IdPuerta;
      let IdTipoMarcacion = dataRowEditNew.IdTipoMarcacion;
      let Funcion = dataRowEditNew.Funcion;
      let TipoAcceso = dataRowEditNew.TipoAcceso;
      let FechaInicio = dataRowEditNew.FechaInicio;
      let FechaFin = dataRowEditNew.FechaFin;
      let Personas = dataRowEditNew.ListaPersona.map(x => (x.IdPersona)).join(',');
      let HoraInicio = new Date(dataRowEditNew.HoraInicio);//.toLocaleString();
      let HoraFin = new Date(dataRowEditNew.HoraFin);//.toLocaleString();
      let Reporte = dataRowEditNew.Reporte;

      // console.log("HoraInicio", HoraInicio);
      // console.log("HoraFin", HoraFin);

      let parametros = {
        IdCliente: isNotEmpty(IdCliente) ? IdCliente : "%",
        Companias: isNotEmpty(Companias) ? Companias : "%",
        UnidadesOrganizativa: isNotEmpty(UnidadesOrganizativa) ? UnidadesOrganizativa : "%",
        IdZona: isNotEmpty(IdZona) ? IdZona : "%",
        IdPuerta: isNotEmpty(IdPuerta) ? IdPuerta : "%",
        IdTipoMarcacion: isNotEmpty(IdTipoMarcacion) ? IdTipoMarcacion : "%",
        Funcion: isNotEmpty(Funcion) ? Funcion : "%",
        TipoAcceso: isNotEmpty(TipoAcceso) ? TipoAcceso : "%",
        FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyy-MM-dd') : " ",
        FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyy-MM-dd') : " ",
        Personas: isNotEmpty(Personas) ? Personas : "%",
        HoraInicio: isNotEmpty(HoraInicio) ? dateFormat(HoraInicio, 'hh:mm:ss') : " ",
        HoraFin: isNotEmpty(HoraFin) ? dateFormat(HoraFin, 'hh:mm:ss') : " "
      }

      //console.log("report.parametros", parametros);

      let item = {
        id: "id_" + id,
        nombre: `${'REPORTE '}${`(${count + 1})`}`,
        icon: <i class="flaticon2-file text-danger" style={{ fontSize: "15px" }} />,
        VerFrame: false,
        bodyRender: (e) => {
          return <FrameReport
            ReportName={'ACCESO_001_MARCACIONES_PERSONA'}
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

      //let temptabs = tabs.length;
      setTabs(tabs => [...tabs, item]);
      //setTabActivo(temptabs);
      if (tabs.length <= 1) {
        setCount(1);
      } else {
        setCount(count + 1);
      }
      //Despues de 5 segundos abrir el nuevo tab.
      setTimeout(() => {
        document.getElementById(`id_${id}-tab`).click();
        //setLoading(false);
      }, 5000);

    }

  }

  return (

    <Fragment>
      <div className="row">
        <div className="col-md-12">
          <CustomBreadcrumbs
            Title={intl.formatMessage({ id: "ACCESS.REPORT.MENU" })}
            SubMenu={intl.formatMessage({ id: "ACCESS.REPORT.SUBMENU" })}
            Subtitle={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
          />
          <Portlet >
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
                </Typography>
              </Toolbar>
            </AppBar>
            <>
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
                              icon="fa fa-search"
                              type="default"
                              hint={intl.formatMessage({ id: "ACCESS.REPORT.VIEWREPORT" })}
                              onClick={generarReporte}
                              useSubmitBehavior={true}
                              validationGroup="FormEdicion"
                              disabled={props.procesados}

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

                  {/* --------------------------------------------------------------------- */}
                </TabPanel>
              </div>
            </>
          </Portlet>
        </div>
      </div>
    </Fragment>
  );

};

export default injectIntl(WithLoandingPanel(MarcacionesPersonaIndexPageRS));
