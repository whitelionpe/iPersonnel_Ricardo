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
import EmisionFotocheckFilterPage from './BiometriaFilterPage';
import Guid from 'devextreme/core/guid';
import FrameReport from '../../../../../partials/components/iframeReport/iFrameReport';

const BiometriaIndexPage = (props) => {

  const { intl, setLoading, dataMenu } = props;
  const [tabActivo, setTabActivo] = useState(0);
  const [count, setCount] = useState(0);

  //const perfil = useSelector((state) => state.perfil.perfilActual);
  const { IdCliente, IdPerfil, IdDivision } = useSelector(state => state.perfil.perfilActual);
  //const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);
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
    Condicion: 'TRABAJADOR',
    Identificacion: 'N',
    Tipos: '',
    Activo: 'S',
    FechaInicio: fecIni,
    FechaFin: fecFin
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


  const generarReporte = (e) => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (count > 20) {
        handleInfoMessages('20 es Maximo de pestañas creadas', '');
        return;
      }

      //if (dataRowEditNew.FechaInicio != '') {
      setLoading(true);
      let guid = new Guid();
      let id = guid.toString();

      //let IdCliente = perfil.IdCliente;
      let IdDivisionPerfil = IdDivision;
      let Companias = dataRowEditNew.IdCompania;//dataRowEditNew.ListaCompania.map(x => (x.IdCompania)).join(',');
      let UnidadesOrganizativa = dataRowEditNew.IdUnidadOrganizativa;//dataRowEditNew.ListaUnidadOrganizativa.map(x => (x.IdUnidadOrganizativa)).join(',');
      let IdEntidad = dataRowEditNew.IdEntidad;
      let IdCaracteristica = dataRowEditNew.IdCaracteristica;
      let IdCaracteristicaDetalle = dataRowEditNew.IdCaracteristicaDetalle;
      let Condicion = dataRowEditNew.Condicion;
      let Identificacion = dataRowEditNew.Identificacion;
      let Tipos = dataRowEditNew.Tipos;
      let Activo = dataRowEditNew.Activo;
      let FechaInicio = dataRowEditNew.FechaInicio;
      let FechaFin = dataRowEditNew.FechaFin;

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
        Identificacion: isNotEmpty(Identificacion) ? Identificacion : "%",
        Tipos: isNotEmpty(Tipos) ? Tipos : "%",
        Activo: isNotEmpty(Activo) ? Activo : "%",
        FechaInicio: isNotEmpty(FechaInicio) ? dateFormat(FechaInicio, 'yyyy-MM-dd') : " ",
        FechaFin: isNotEmpty(FechaFin) ? dateFormat(FechaFin, 'yyyy-MM-dd') : " "
      }

     // console.log("parametro", parametros);

      let item = {
        id: "id_" + id,
        nombre: `${'REPORTE '}${`(${count + 1})`}`,
        icon: <i class="flaticon2-file text-danger" style={{ fontSize: "15px" }} />,
        VerFrame: false,
        bodyRender: (e) => {
          return <FrameReport
            ReportName={'IDENTIFICACION_002_BIOMETRIA'}
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

      //Despues de 5 segundos abrir el nuevo tab.
      setTimeout(() => {
        document.getElementById(`id_${id}-tab`).click();
        //setLoading(false);
      }, 5000);

    }
    //}
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
                  {intl.formatMessage({ id: "CONFIG.MENU.IDENTIFICACION.BIOMETRIA" })}
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

export default injectIntl(WithLoandingPanel(BiometriaIndexPage));
