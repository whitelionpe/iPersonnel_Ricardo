import React, { useState } from "react";
import {
  Portlet,
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../../partials/content/Portlet";
import Form, { GroupItem, Item } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import CustomBreadcrumbs from "../../../../../../partials/layout/CustomBreadcrumbs";
import { useStylesEncabezado } from "../../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import TabPanel from "../../../../../../partials/content/TabPanel";
import HeaderInformation from "../../../../../../partials/components/HeaderInformation";
import FrameReport from '../../../../../../partials/components/iframeReport/iFrameReport';
import CustomTabNav from "../../../../../../partials/components/Tabs/CustomTabNav";
import Guid from "devextreme/core/guid";
import { dateFormat, isNotEmpty } from "../../../../../../../_metronic/utils/utils";
import TransporteRutaBuscar from '../../../../../../partials/components/transporte/popUps/TransporteRutaBuscar';
import { injectIntl } from "react-intl";
import { WithLoandingPanel } from "../../../../../../partials/content/withLoandingPanel";
import AdministracionCompaniaBuscar from "../../../../../../partials/components/AdministracionCompaniaBuscar";
import Constants from "../../../../../../store/config/Constants";

const ManifiestoFinal = (props) => {

  const { intl, setLoading } = props;
  const classes = useStylesEncabezado();
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [popUpVisibleRuta, setpopUpVisibleRuta] = useState(false);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);

  // ------------------------------
  // Configuracion de reporte
  // ------------------------------
  const [dataRowEditNew, setDataRowEditNew] = useState({
    Fecha: "",
    IdRuta: "",
    Ruta: "",
  });

  // ------------------------------
  // Tabs - Reporte 
  // ------------------------------
  const [tabs, setTabs] = useState([
    {
      id: "idTabGeneral", 
      nombre: intl.formatMessage({ id: "CAMP.RESERVATION.GENERAL" }),
      icon: <i class="flaticon2-search text-success" style={{ fontSize: "15px" }} />,
      bodyRender: () => {
        return (
          <Form formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem>
              <GroupItem itemType="group" colCount={2}>

              <Item
                  dataField="Compania"
                  label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                  readOnly={true}
                  editorOptions={{
                    readOnly: true,
                    hoverStateEnabled: false,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    showClearButton: true,
                    value:isNotEmpty(Constants.DESCRIPCION_COMPANIA_DEFAULT) ? Constants.DESCRIPCION_COMPANIA_DEFAULT:"",
                    buttons: [{
                      name: 'search',
                      location: 'after',
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: 'text',
                        icon: 'search',
                        disabled: true,
                        onClick: () => {
                          setPopupVisibleCompania(true);
                        },
                      }
                    }]
                  }}
                />
                <Item></Item>

                <Item
                  dataField="Fecha"
                  label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.DATE" }) }}
                  isRequired={true}
                  editorType="dxDateBox"
                  editorOptions={{
                    type: "date",
                    showClearButton: true,
                    displayFormat: "dd/MM/yyyy HH:mm",
                  }}
                />

              <Item dataField="Ruta" 
                with="50"
                label={{ text: intl.formatMessage({ id: "TRANSPORTE.ROUTE" }) }}
                editorOptions={{
                  readOnly: true,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    readOnly: false,
                    options: {
                      stylingMode: 'text',
                      icon: 'search',
                      disabled:false,
                      onClick: () => {
                        setpopUpVisibleRuta(true);
                      }
                    }
                  }]
                }}
              />

              </GroupItem>
            </GroupItem>
          </Form>
        );
      },
    },
  ]);
  const [tabActivo, setTabActivo] = useState(0);
  const [count, setCount] = useState(0);

  /* =========================================================================================================================================== */

  const generarReporte = async (e) => {
    let result = e.validationGroup.validate();
    if (result.isValid){

      if (count > 20) {
        return;
      }
      let guid = new Guid();
      let id = guid.toString();

      if (isNotEmpty(dataRowEditNew.Fecha)) {
        var fecha = dateFormat(dataRowEditNew.Fecha, "yyyyMMdd");
        var fechaFormato = dateFormat(dataRowEditNew.Fecha, "dd-MM-yyyy");

        let parametros = {
          Fecha: fecha,
          IdRuta: isNotEmpty(dataRowEditNew.IdRuta) ? dataRowEditNew.IdRuta : "",
          IdCliente: perfil.IdCliente,
          Compania : isNotEmpty(Constants.DESCRIPCION_COMPANIA_DEFAULT) ? Constants.DESCRIPCION_COMPANIA_DEFAULT:""
        };
        
        let item = {
          id: "id_" + id,
          nombre: `${intl.formatMessage({ id: "CASINO.REPORT.SUBMENU" }).toUpperCase()}${`(${count + 1})`}`,
          icon: <i class="flaticon2-file text-danger" style={{ fontSize: "15px" }} />,
          VerFrame: false,
          bodyRender: (e) => {
            return <FrameReport
              ReportName={'TRANSPORTE_001_MANIFIESTO_FINAL_RESUMEN'}
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

        setTabs((tabs) => [...tabs, item]);
        if (tabs.length <= 1) {
          setCount(1);
        } else {
          setCount(count + 1);
        }
        //Despues de 5 segundos abrir el nuevo tab.
        setTimeout(() => {
          document.getElementById(`id_${id}-tab`).click();
        }, 5000);
      }
  }
  };

  const selectRuta = async (datos) => {
    const { IdRuta, Ruta, Origen,Destino } = datos[0];
      dataRowEditNew.IdRuta = IdRuta;
      dataRowEditNew.Ruta = Ruta;
      dataRowEditNew.Origen = Origen;
      dataRowEditNew.Destino = Destino;
    setpopUpVisibleRuta(false);
};

const selectCompania = (dataPopup) => {
  const { IdCompania, Compania } = dataPopup[0];
  dataRowEditNew.IdCompania = IdCompania;
  dataRowEditNew.Compania = Compania;
  setPopupVisibleCompania(false);
}

  return (
    <>
      <div className="row">
        <div className="col-md-12"> 
          <CustomBreadcrumbs Title={intl.formatMessage({ id: "TRANSPORT.MAIN" })} SubMenu={intl.formatMessage({ id: "CAMP.REPORT.REPORTS" })} Subtitle={intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.MANIFIESTO_FINAL" })} />
          <Portlet>
            <AppBar position="static" className={classes.principal}>
              <Toolbar variant="dense" className={classes.toolbar}>
                <Typography
                  variant="h6"
                  color="inherit"
                  className={classes.title}
                >
                  {intl.formatMessage({ id: "CONFIG.MENU.TRANSPORTE.MANIFIESTO_FINAL" })}
                </Typography>
              </Toolbar>
            </AppBar>

              <div className={classes.root}>
                <TabPanel value={0} className={classes.TabPanel} index={0}>
                  <HeaderInformation
                    data={() => {}}
                    visible={true}
                    labelLocation={"left"}
                    colCount={1}
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
                    }
                  />

                  <PortletBody>
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

   {/*******>POPUP DE RUTA>******** */}
      {popUpVisibleRuta && (
          <TransporteRutaBuscar
              selectData={selectRuta}
              showPopup={{ isVisiblePopUp: popUpVisibleRuta, setisVisiblePopUp: setpopUpVisibleRuta }}
              cancelarEdicion={() => setpopUpVisibleRuta(false)}
              uniqueId={"TransporteRutaBuscarReporteManifiestoReporte001"}
              showButton={true}
          />
      )}
      
      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
      <AdministracionCompaniaBuscar
        selectData={selectCompania}
        showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
        cancelarEdicion={() => setPopupVisibleCompania(false)}
        uniqueId={"administracionCompaniaBuscarReporte001"}
        />
      )}
    </>
  );
};

export default injectIntl(WithLoandingPanel(ManifiestoFinal));
