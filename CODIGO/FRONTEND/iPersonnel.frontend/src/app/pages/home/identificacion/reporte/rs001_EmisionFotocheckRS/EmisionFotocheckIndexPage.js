import React, { Fragment, useState } from 'react';
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
import EmisionFotocheckFilterPage from './EmisionFotocheckFilterPage';
import Guid from 'devextreme/core/guid';
import FrameReport from '../../../../../partials/components/iframeReport/iFrameReport';

const EmisionFotocheckIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  //const perfil = useSelector((state) => state.perfil.perfilActual);
  const { IdCliente, IdPerfil, IdDivision } = useSelector(state => state.perfil.perfilActual);
  // const { IdDivision } = useSelector(state => state.perfil.perfilActual.IdDivision);
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  //const { FechaInicio, FechaFin } = getDateOfDay();
  let hoy = new Date();
  let fecIni = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  let fecFin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  const [dataRowEditNew, setDataRowEditNew] = useState({
    IdCliente: IdCliente,
    IdPerfil: '',
    IdDivisionPerfil: '',
    IdCompania: '',
    Compania: '',
    UnidadOrganizativa: '',
    IdUnidadOrganizativa: '',
    IdEntidad: '',
    IdCaracteristica: '',
    IdCaracteristicaDetalle: '',
    Condicion: '',
    Devuelto: '',
    IdMotivo: '',
    IdTipoCredencial: '',
    Impreso: '',
    Vigencia: '',
    Activo: '',
    FechaInicio: fecIni,
    FechaFin: fecFin,
    FechaInicioVencimiento: '',
    FechaFinVencimiento: ''
  });


  const [tabs, setTabs] = useState([{
    id: "idTabGeneral",
    nombre: 'General',
    icon: <i class="flaticon2-search text-success" style={{ fontSize: "15px" }} />,
    bodyRender: (e) => {
      return <EmisionFotocheckFilterPage
        dataRowEditNew={dataRowEditNew}
        setDataRowEditNew={setDataRowEditNew}
      />
    }
  }]);

  const [tabActivo, setTabActivo] = useState(0);
  const [count, setCount] = useState(0);

  const generarReporte = (e) => {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (count > 20) {
        handleInfoMessages('20 es Máximo de pestañas creadas', '');
        return;
      }
      //if (dataRowEditNew.FechaInicio != '') {
      setLoading(true);
      let guid = new Guid();
      let id = guid.toString();

      //console.log("add_id",id);
      // let IdCliente = IdCliente;
      let IdDivisionPerfil = IdDivision;
      let Companias = dataRowEditNew.IdCompania;//dataRowEditNew.ListaCompania.map(x => (x.IdCompania)).join(',');
      let UnidadesOrganizativa = dataRowEditNew.IdUnidadOrganizativa; //dataRowEditNew.ListaUnidadOrganizativa.map(x => (x.IdUnidadOrganizativa)).join(',');
      let IdEntidad = dataRowEditNew.IdEntidad;
      let IdCaracteristica = dataRowEditNew.IdCaracteristica;
      let IdCaracteristicaDetalle = dataRowEditNew.IdCaracteristicaDetalle;
      let Condicion = dataRowEditNew.Condicion;
      let Devuelto = dataRowEditNew.Devuelto;
      let IdMotivo = dataRowEditNew.IdMotivo;
      let IdTipoCredencial = dataRowEditNew.IdTipoCredencial;
      let Impreso = dataRowEditNew.Impreso;
      let Vigencia = dataRowEditNew.Vigencia;
      let Activo = dataRowEditNew.Activo;
      let FechaInicio = dataRowEditNew.FechaInicio;
      let FechaFin = dataRowEditNew.FechaFin;
      let FechaInicioVencimiento = dataRowEditNew.FechaInicioVencimiento;
      let FechaFinVencimiento = dataRowEditNew.FechaFinVencimiento;

      let parametros = {
        IdCliente: isNotEmpty(IdCliente) ? IdCliente : "%",
        IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "%",
        IdDivisionPerfil: isNotEmpty(IdDivisionPerfil) ? IdDivisionPerfil : "%",
        Companias: isNotEmpty(Companias) ? Companias : "%",
        UnidadesOrganizativa: isNotEmpty(UnidadesOrganizativa) ? UnidadesOrganizativa : "%",
        IdEntidad: isNotEmpty(IdEntidad) ? IdEntidad : "%",
        IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "%",
        IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : "%",
        Condicion: isNotEmpty(Condicion) ? Condicion : "%",
        Devuelto: isNotEmpty(Devuelto) ? Devuelto : "%",
        IdMotivo: isNotEmpty(IdMotivo) ? IdMotivo : "%",
        IdTipoCredencial: isNotEmpty(IdTipoCredencial) ? IdTipoCredencial : "%",
        Impreso: isNotEmpty(Impreso) ? Impreso : "%",
        Vigencia: isNotEmpty(Vigencia) ? Vigencia : "%",
        Activo: isNotEmpty(Activo) ? Activo : "%",
        FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyy-MM-dd') : " ",
        FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyy-MM-dd') : " ",
        FechaInicioVencimiento: isNotEmpty(FechaInicioVencimiento) ? dateFormat(FechaInicioVencimiento, 'yyyy-MM-dd') : " ",
        FechaFinVencimiento: isNotEmpty(FechaFinVencimiento) ? dateFormat(FechaFinVencimiento, 'yyyy-MM-dd') : " ",
      }

      //console.log("parametro", parametros);

      let item = {
        id: "id_" + id,
        nombre: `${'REPORTE '}${`(${count+1})`}`,
        icon: <i class="flaticon2-file text-danger" style={{ fontSize: "15px" }} />,
        VerFrame: false,
        bodyRender: (e) => {
          return <FrameReport
            ReportName={'IDENTIFICACION_001_EMISION_FOTOCHECKS'}
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
      if (tabs.length < 1) {
        setCount(1);
      } else {
        setCount(count + 1);
      }
      //Despues de 1 segundos abrir el nuevo tab.
      //document.getElementsByClassName('nav-item-custom')[temptabs].children[0].click();
      setTimeout(() => {
        document.getElementById(`id_${id}-tab`).click();
        //setLoading(false);
      }, 1000);

      //}
    }
  }



  return (
    <Fragment>
      <div className="row">
        <div className="col-md-12">
          <CustomBreadcrumbs
            Title={intl.formatMessage({ id: "IDENTIFICATION.REASON.MENU" })}
            SubMenu={intl.formatMessage({ id: `${isNotEmpty(dataMenu.info.Tag) ? dataMenu.info.Tag : ""}` })}
            Subtitle={intl.formatMessage({ id: "IDENTIFICATION.REPORT" })}
          />
          <Portlet >
            <AppBar position="static" className={classesEncabezado.principal}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                  {intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.MARCACIONES" })}
                </Typography>
              </Toolbar>
            </AppBar>
            <>
              <div className={classes.root}>
                <TabPanel value={0} className={classes.TabPanel} index={0}>
                  <HeaderInformation data={() => { }} visible={true} labelLocation={'left'} colCount={1}
                    toolbar={
                      <PortletHeader
                        title={""}
                        toolbar={
                          <PortletHeaderToolbar>
                            <Button
                              icon="fa fa-search"
                              type="default"
                              hint={intl.formatMessage({ id: "ACCESS.REPORT.VIEWREPORT" })}
                              onClick={generarReporte}
                              useSubmitBehavior={true}
                              validationGroup="FormEdicion"
                              disabled={props.procesados}
                            //text={intl.formatMessage({ id: "ACCESS.REPORT.VIEWREPORT" })}
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
            </>
          </Portlet>
        </div>
      </div>
    </Fragment>
  );

};

export default injectIntl(WithLoandingPanel(EmisionFotocheckIndexPage));
