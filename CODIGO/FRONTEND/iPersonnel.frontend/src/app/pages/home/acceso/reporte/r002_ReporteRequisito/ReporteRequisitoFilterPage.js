import React, { Fragment, useEffect, useState } from 'react';
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, PatternRule, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar, Portlet } from "../../../../../partials/content/Portlet";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import PropTypes from 'prop-types';
import {
  isNotEmpty, dateFormat, getDateOfDay, addDaysToDate, listarTipoReporte, listarEntidadControl
} from "../../../../../../_metronic";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import { obtenerTodos as obtenerTodosRequisitos } from '../../../../../api/acceso/requisito.api';
import { obtenerTodos as obtenerTodosFunciones } from '../../../../../api/administracion/funcion.api';
import AccesoPerfilBuscar from "../../../../../partials/components/AccesoPerfilBuscar";
import { obtenerTodos as obtnerPerfil } from '../../../../../api/acceso/perfil.api';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";


const ReporteRequisitoFilterPage = (props) => {
  const classesEncabezado = useStylesEncabezado();
  const { intl, setLoading } = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const [viewFilter, setViewFilter] = useState(true);
  const [cmbRequisitos, setcmbRequisitos] = useState([]);
  const [cmbPerfiles, setcmbPerfiles] = useState([]);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [fechaValue, setFechaValue] = useState(getDateOfDay());
  const [isVisiblePopUpPerfil, setisVisiblePopUpPerfil] = useState(false);
  const [modoEdicionVigenciaActual, setModoEdicionVigenciaActual] = useState(false);

  async function cargarCombos() {
    let dataPerfiles = await obtnerPerfil({ IdCliente });
    setcmbPerfiles(dataPerfiles);
  }

  const selectCompania = (dataPopup) => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataRowEditNew.IdUnidadesOrganizativas = strUnidadesOrganizativas;
    props.dataRowEditNew.UnidadesOrganizativas = UnidadesOrganizativasDescripcion;
    setPopupVisibleUnidad(false);
  };

  const selectPerfil = (dataPopup) => {
    const { IdPerfil, Perfil } = dataPopup[0];
    props.dataRowEditNew.IdPerfil = IdPerfil;
    props.dataRowEditNew.Perfil = Perfil;
    setisVisiblePopUpPerfil(false);
  }

  async function valueChangedTipoReporte(value) {
    setLoading(true);
    await obtenerTodosRequisitos({ IdCliente, IdEntidad: value }).then(requisitos => {
      setcmbRequisitos(requisitos);
    }).finally(() => { setLoading(false) });

  }

  useEffect(() => {
    cargarCombos();
    valueChangedTipoReporte("P");
  }, []);


  const eventRefresh = () => {
    let { FechaInicio } = getDateOfDay();
    props.setDataRowEditNew({
      TipoReporte: 'P',
      IdDivision: '',
      IdCompania: '',
      Compania: '',
      UnidadesOrganizativas: '',
      IdUnidadesOrganizativas: '',
      IdPerfil: '',
      Perfil: '',
      IdRequisito: '',
      DiasVencimiento: '0',
      FechaCorte: FechaInicio,
      VigenciaActual: false
    });
    props.clearDataGrid();
  }

  /*Filtro para obtener reporte de requisitos*********************************/
  const filtrar = async () => {

    let filtro = {
      IdCliente: IdCliente,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : "%",
      TipoReporte: isNotEmpty(props.dataRowEditNew.TipoReporte) ? props.dataRowEditNew.TipoReporte : "%",
      IdCompania: isNotEmpty(props.dataRowEditNew.IdCompania) ? props.dataRowEditNew.IdCompania : "",
      IdUnidadOrganizativa: isNotEmpty(props.dataRowEditNew.IdUnidadesOrganizativas) ? props.dataRowEditNew.IdUnidadesOrganizativas : "",
      IdPerfil: isNotEmpty(props.dataRowEditNew.IdPerfil) ? props.dataRowEditNew.IdPerfil : "",
      IdRequisito: isNotEmpty(props.dataRowEditNew.IdRequisito) ? props.dataRowEditNew.IdRequisito : "",
      VigenciaActual: isNotEmpty(props.dataRowEditNew.VigenciaActual) ? props.dataRowEditNew.VigenciaActual ? "S" : "N" : "N",
      DiasVencimiento: isNotEmpty(props.dataRowEditNew.DiasVencimiento) ? props.dataRowEditNew.DiasVencimiento : 0,
      FechaCorte: isNotEmpty(props.dataRowEditNew.FechaCorte) ? dateFormat(props.dataRowEditNew.FechaCorte, 'yyyyMMdd') : ""
    }
    props.filtrarReporte(filtro);

  }

  const hideFilter = () => {
    let form = document.getElementById("FormFilter");
    if (viewFilter) {
      setViewFilter(false);
      form.classList.add('hidden');
    } else {
      form.classList.remove('hidden');
      setViewFilter(true);
    }
  }

  const datosGenerales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >
            <Item dataField="IdCompania" visible={false} />
            <Item dataField="IdUnidadOrganizativa" visible={false} />
            <Item dataField="IdPerfil" visible={false} />

            <Item
              colSpan={2}
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: false,
                    onClick: () => {
                      setPopupVisibleCompania(true);
                    },
                  }
                }]
              }}
            />


            <Item
              colSpan={2}
              dataField="UnidadesOrganizativas"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" }) }}
              editorOptions={{
                readOnly: true,
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    disabled: false,
                    onClick: () => {
                      setPopupVisibleUnidad(true);
                    },
                  }
                }]
              }}
            />

            <Item
              colSpan={2}
              dataField="Perfil"
              label={{ text: intl.formatMessage({ id: "Perfil de Acceso" }) }}
              editorOptions={{
                hoverStateEnabled: false,
                inputAttr: { 'style': 'text-transform: uppercase' },
                showClearButton: true,
                buttons: [{
                  name: 'search',
                  location: 'after',
                  useSubmitBehavior: true,
                  options: {
                    stylingMode: 'text',
                    icon: 'search',
                    onClick: () => {
                      setisVisiblePopUpPerfil(true);
                    },

                  }
                }]

              }}
            />


          </GroupItem>
        </Form>
      </>
    );
  }

  const datosrequisitoyperido = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              colSpan={2}
              dataField="TipoReporte"
              isRequired={true}
              label={{ text: intl.formatMessage({ id: "ACCESS.REPORT.CURRENT.APPLYTO" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: listarTipoReporte(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                onValueChanged: (e) => { valueChangedTipoReporte(e.value); }
              }}
            />

            <Item
              colSpan={2}
              dataField="IdRequisito"
              isRequired={false}
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: cmbRequisitos,
                valueExpr: "IdRequisito",
                displayExpr: "Requisito",
                showClearButton: true,
              }}
            />

            <Item dataField="VigenciaActual"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              colSpan={2}
              editorOptions={{
                text: intl.formatMessage({ id: "ACCESS.REPORT.CURRENT.VALIDITY" }),
                width: "100%",
                onValueChanged: (e) => { setModoEdicionVigenciaActual(e.value) }
              }}
            />

            <Item
              dataField="DiasVencimiento"
              label={{ text: intl.formatMessage({ id: "ACCESS.DATE.UNTIL" }) }}
              isRequired={true}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                inputAttr: {
                  style: "text-transform: uppercase; text-align: right"
                },
                showSpinButtons: true,
                showClearButton: true,
                min: 0,
                readOnly: modoEdicionVigenciaActual
              }}
            >

            </Item>

            <Item
              dataField="FechaCorte"
              label={{ text: intl.formatMessage({ id: "ACCESS.DATE.CURT" }) }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy",
                readOnly: modoEdicionVigenciaActual
              }}
            />


          </GroupItem>
        </Form>
      </>
    );
  }

  return (

    <Fragment>

      <PortletHeader
        title={
          <AppBar position="static" color="default" >
            <Toolbar variant="dense" className={classesEncabezado.toolbar}>
              <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                {intl.formatMessage({ id: "ACCESS.MSG.INFO" })}
              </Typography>
            </Toolbar>
          </AppBar>
        }
        toolbar={
          <PortletHeaderToolbar>

            <Button icon={viewFilter ? "chevronup" : "chevrondown"}
              type="default"
              hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={hideFilter} />
            &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={filtrar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
            />

            &nbsp;
            <Button icon="refresh"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
              onClick={eventRefresh} />

            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              onClick={props.exportReport}
            />

          </PortletHeaderToolbar>

        } />

      <PortletBody >
        <React.Fragment>
          <Form id="FormFilter" formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>

              <div className="row">

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >   <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.GENERALDATA" })} </h5></legend>
                    {datosGenerales()}
                  </fieldset>
                </div>

                <div className="col-md-6">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" >
                      <h5>{intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })} </h5>
                    </legend>
                    {datosrequisitoyperido()}
                  </fieldset>
                </div>
              </div>

            </GroupItem>
          </Form>


        </React.Fragment>
      </PortletBody>

      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"ReportecompaniabuscarRequisitoPage"}
        />

      )}


      {/*******>POPUP DE UNIDAD ORGA.>******** */}
      {popupVisibleUnidad && (
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
        />
      )}

      {isVisiblePopUpPerfil && (
        <AccesoPerfilBuscar
          dataSource={cmbPerfiles}
          selectData={selectPerfil}
          showPopup={{ isVisiblePopUp: isVisiblePopUpPerfil, setisVisiblePopUp: setisVisiblePopUpPerfil }}
          cancelarEdicion={() => setisVisiblePopUpPerfil(false)}
          selectionMode={"row"}
        />

      )}

    </Fragment >

  );
};


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}

TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};


export default injectIntl(WithLoandingPanel(ReporteRequisitoFilterPage));
