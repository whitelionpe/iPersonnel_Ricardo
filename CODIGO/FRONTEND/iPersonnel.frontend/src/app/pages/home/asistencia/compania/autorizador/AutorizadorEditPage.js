import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import Form, {  Item, GroupItem, PatternRule } from "devextreme-react/form";

import AdministracionPosicionPersonaBuscar from "../../../../../partials/components/AdministracionPosicionPersonaBuscar";
import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";

import { listarEstadoSimple, listarEstado, isNotEmpty, PatterRuler } from "../../../../../../_metronic";
import CustomTabNav from '../../../../../partials/components/Tabs/CustomTabNav';
import { DataGrid, Column, Editing, Button as ColumnButton,  Selection,Summary, TotalItem } from "devextreme-react/data-grid";
import Alerts from "../../../../../partials/components/Alert/Alerts";
import MenuTreeViewPage from "../../../../../partials/content/TreeView/MenuTreeViewPage";

import { obtenerTodos as obtenerCmbTipoPosicion } from "../../../../../api/administracion/tipoPosicion.api";
import { obtenerTodos as obtenerCmbFuncion } from "../../../../../api/administracion/funcion.api";
import { obtenerTodos as obtenerTodosDivisiones } from "../../../../../api/sistema/division.api";
import Confirm from "../../../../../partials/components/Confirm";

import AccountTreeIcon from '@material-ui/icons/AccountTree';
import DateRange from '@material-ui/icons/DateRange'
import AccountBalance from '@material-ui/icons/AccountBalance';

const AutorizadorEditPage = props => { 
  const { intl, modoEdicion, settingDataField, accessButton , IdCliente } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estadoRegistro, setEstadoRegistro] = useState([]);
  const [IdTipoAutorizacion, setIdTipoAutorizacion] = useState(props.dataRowEditNew.IdTipoAutorizacion);

  const classesEncabezado = useStylesEncabezado();

  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);

  const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
  const [cmbFuncion, setCmbFuncion] = useState([]);
  const [cmbDivisiones, setCmbDivisiones] = useState([]);

  const [valuePrincial, setValuePrincipal] = useState("");

  const [filtroLocal, setFiltroLocal] = useState({
    IdCliente, IdDivision: "", IdUnidadOrganizativa: "", IdFuncion: "", IdTipoPosicion: "", IdCompania:""
  });
 
  const [dataGrid, setDataGrid] = useState(null);
  const [selectedRowJustificaciones, setSelectedRowJustificaciones] = useState([]);
  const [selectedRowDivision, setSelectedRowDivision] = useState([]);
  const [selectedRowUnidadOrganizativa, setSelectedRowUnidadOrganizativa] = useState([]);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});


  let datacheck = [];

  async function cargarCombos() {
    let estados = listarEstado();
    let estadoSimple = listarEstadoSimple();
    setEstadoRegistro(estados);
    setEstadoSimple(estadoSimple);

       //Listar divisiones
       await obtenerTodosDivisiones({
        IdCliente,
      }).then(divisiones => {
        setCmbDivisiones(divisiones);
      });
      //Listar Tipo posicion
      await obtenerCmbTipoPosicion({
        IdCliente,
      }).then(cmbTipoPosicion => {
        setCmbTipoPosicion(cmbTipoPosicion);
      });
      //Listar Funciones
      await obtenerCmbFuncion({ IdCliente }).then(cmbFuncion => {
        setCmbFuncion(cmbFuncion);
      });

  }
 
  function grabar(e) {

    let result = e.validationGroup.validate();

    if (result.isValid) {
      let selectedRowDivisionAux = (selectedRowDivision.length === 0) ? null : selectedRowDivision[0].selectNodo.filter(x => x.Nivel > 2) //Nivel 2 Nivel padre
      let selectedRowUnidadOrganizativaAux = (selectedRowUnidadOrganizativa.length === 0) ? null : selectedRowUnidadOrganizativa[0].selectNodo.filter(x => x.Nivel > 1)   //Nivel 1 Nivel padre
      
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarAutorizador(props.dataRowEditNew,selectedRowJustificaciones,selectedRowDivisionAux,selectedRowUnidadOrganizativaAux);
      } else { 
        props.actualizarAutorizador(props.dataRowEditNew,selectedRowJustificaciones,selectedRowDivisionAux,selectedRowUnidadOrganizativaAux);
      }
    }
  }

  async function onValueChangedPrincipal(e) {
    if(e.value === 'S')
    {
      setIsVisible(true);
    }
  }

  async function onConfirm(value) {
    if (value === true ){
      setValuePrincipal("S");
      setIsVisible(false);

    }else{
      setValuePrincipal("N");
      setIsVisible(false);
    }
   }

  const agregarPopupPosicion = (posiciones) => {
    const { IdDivision, IdPosicion, Posicion, IdFuncion, IdTipoPosicion, Contratista, Fiscalizable, Confianza, PosicionPadre, PersonaPosicionPadre,NombreCompleto } = posiciones[0];
    props.dataRowEditNew.IdDivision = IdDivision;
    props.dataRowEditNew.IdPosicion = IdPosicion;
    props.dataRowEditNew.Posicion = Posicion;
    props.dataRowEditNew.IdFuncion = IdFuncion;
    props.dataRowEditNew.IdTipoPosicion = IdTipoPosicion;
    props.dataRowEditNew.Contratista = Contratista;
    props.dataRowEditNew.Fiscalizable = Fiscalizable;
    props.dataRowEditNew.Confianza = Confianza;
    props.dataRowEditNew.PosicionPadre = PosicionPadre;
    props.dataRowEditNew.PersonaPosicionPadre = PersonaPosicionPadre;
    props.dataRowEditNew.NombreCompleto = NombreCompleto;

  }

  const selectUnidadOrganizativa = async (dataPopup) => {
    const { IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup;
    props.dataRowEditNew.IdUnidadOrganizativa = IdUnidadOrganizativa;
    props.dataRowEditNew.UnidadOrganizativa = UnidadOrganizativa;
    setPopupVisibleUnidad(false);

  };

  // ::::::::::::::::::::::  OPCIONES TAB  HORIZONTAL INI ::::::::::::::::::::::::::::

  function onEditorPrepared(e) {
    if (e.row != undefined) {
      if (e.row.data.selected === 1) {
        datacheck.push(e.row.data.IdJustificacion);
      }
    }
    setTimeout(function () {
      if (dataGrid != null)  dataGrid.instance.selectRows(datacheck);
      }, 50);
  }

  function onSelectionChanged(e) {
    setSelectedRowJustificaciones(e.selectedRowsData);
  }

  function seleccionarNodo(selectNodo, dataAll) {
    setSelectedRowDivision([{ selectNodo }, { dataAll }]);
  }

  function seleccionarNodoUnidadOrganizativa(selectNodo, dataAll) {
    setSelectedRowUnidadOrganizativa([{ selectNodo }, { dataAll }]);
  }

  // ::::::::::::::::::::::  OPCIONES TAB  HORIZONTAL END :::::::::::::::::::::::::::: ()
  function cancelarEdicion ()
  {
      props.cancelarEdicion();
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  const renderJustificaciones = (e) => {
    return (
      <>
      <br></br>
      <div style={{width:'50%'}}>
        <DataGrid
          dataSource = {props.dataJustificaciones}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="IdJustificacion"
          ref={(ref) => { setDataGrid(ref); }}
          onSelectionChanged={(e => onSelectionChanged(e))}
          onEditorPrepared={onEditorPrepared}
          >
          <Selection mode={"multiple"} />
          <Column dataField="IdJustificacion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
          <Column dataField="Justificacion" caption={intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" })}/>
          <Summary>
              <TotalItem
              cssClass="classColorPaginador_"
                  column="IdJustificacion"
                  alignment="right"
                  summaryType="count"
                  displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
              />
              </Summary>
        </DataGrid>
    
        {props.isVisibleAlert && (
                <Alerts
                severity={"info"}
                msg1={ intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.MSG1" }) }
                msg2={intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.MSG2" }) }
                /> 
          )}
      </div>
      </>
 
    );
}

  const renderDivisiones = (e) => {
    return (
      <>
      <br></br>
        <MenuTreeViewPage
        menus={props.divisionesTreeView} 
        showCheckBoxesModes={"normal"}
        selectionMode={"multiple"}
        seleccionarNodo={seleccionarNodo}
        />
      </>
    );
}

const renderUnidadOrganizativa = (e) => {
    return (
      <>
      <br></br>
        <MenuTreeViewPage
        menus={props.unidadOrganizativaTreeView}
        showCheckBoxesModes={"normal"}
        selectionMode={"multiple"}
        seleccionarNodo={seleccionarNodoUnidadOrganizativa}
        />
      </>
        )
}

// Viktor planteo que sea Hardcode
const elementos_HE = [ 
  { id: "idDivisiones", nombre: intl.formatMessage({ id: "SYSTEM.DIVISIONS" }),   icon : <AccountTreeIcon fontSize="large" />,  bodyRender: (e) => { return renderDivisiones() } },
  { id: "idUnidadOrganizativas",     nombre: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA.ABR" }),  icon :<AccountBalance fontSize="large" />,bodyRender: (e) => { return renderUnidadOrganizativa() } },
]

const elementos_JU = [ 
    { id: "idJustificaciones", nombre: intl.formatMessage({ id: "CONFIG.MENU.ASISTENCIA.JUSTIFICACIONES" }), icon: <DateRange fontSize="large"/>,   bodyRender: (e) => { return renderJustificaciones() } },
    { id: "idDivisiones", nombre: intl.formatMessage({ id: "SYSTEM.DIVISIONS" }),   icon : <AccountTreeIcon fontSize="large" />,  bodyRender: (e) => { return renderDivisiones() } },
    { id: "idUnidadOrganizativas",     nombre: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA.ABR" }),  icon :<AccountBalance fontSize="large" />,bodyRender: (e) => { return renderUnidadOrganizativa() } },
]

  return (
    <>
      <PortletHeader
        title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              onClick={grabar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={modoEdicion}
              disabled={!accessButton.grabar}
            />
              &nbsp;
              <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <GroupItem itemType="group" colCount={2} colSpan={2}>

              <Item
                dataField="IdDivision"
                label={{
                  text: intl.formatMessage({
                    id: "SYSTEM.DIVISION",
                  }),
                }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbDivisiones,
                  valueExpr: "IdDivision",
                  displayExpr: "Division",
                  showClearButton: true,
                  readOnly : props.dataRowEditNew.esNuevoRegistro ? false : true,

                }}
              />
              <Item
                dataField="UnidadOrganizativa"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT",
                  }),
                }}
                editorOptions={{
                  readOnly: true,
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        disabled: props.dataRowEditNew.esNuevoRegistro? false:true,
                        onClick: () => {
                          setPopupVisibleUnidad(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                dataField="IdTipoPosicion"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.POSITION.POSITIONTYPE",
                  }),
                }}
                visible={false}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbTipoPosicion,
                  valueExpr: "IdTipoPosicion",
                  displayExpr: "TipoPosicion",
                  showClearButton: true,
                  readOnly : props.dataRowEditNew.esNuevoRegistro ? false : true,
                  visible:false
                }}
              />

              <Item
                dataField="IdFuncion"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.POSITION.FUNCTION",
                  }),
                }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbFuncion,
                  valueExpr: "IdFuncion",
                  displayExpr: "Funcion",
                  showClearButton: true,
                  readOnly : props.dataRowEditNew.esNuevoRegistro ? false : true,

                }}
              />

              <Item
                dataField="GeneraSolicitud"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.GENERATEREQUEST" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

          <Item
              dataField="Posicion"
              label={{ text: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.POSITION" }) }}
              isRequired={true}
              editorOptions={{
                readOnly : true,
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
                    disabled:   props.dataRowEditNew.esNuevoRegistro ? false : true,
                    onClick: () => {
                      const { IdDivision, IdUnidadOrganizativa, IdFuncion, IdTipoPosicion, IdCompania } = props.dataRowEditNew;
                      setFiltroLocal({ IdDivision, IdUnidadOrganizativa, IdFuncion, IdTipoPosicion, IdCompania });
                      setPopupVisiblePosicion(true);
                    },
                  }
                }]
              }}
              />

            <Item
                dataField="NombreCompleto"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.RESPONSABLE" }) }}
                readOnly ={true}
                editorOptions ={{
                  readOnly:true
                }}
              />

              <Item
                dataField="Nivel"
                label={{text: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.LEVEL", }),}}
                isRequired={true}
                editorType="dxNumberBox"
                dataType="number"
                editorOptions={{
                  readOnly : props.dataRowEditNew.esNuevoRegistro ? false : true,
                  inputAttr: { style: "text-transform: uppercase; text-align: right",},
                  showSpinButtons: true,
                  showClearButton: false,
                  min: 0,
                  max: props.nivelMax , 
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA",
                  })}
                />
              </Item>

             <Item
                dataField="Principal"
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.AUTHORIZER.PRINCIPAL" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  value: props.dataRowEditNew.esNuevoRegistro ? valuePrincial : (  valuePrincial!="" ?  valuePrincial :  props.dataRowEditNew.Principal ),
                  items: estadoRegistro,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  onValueChanged: (e) => onValueChangedPrincipal(e),
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />
              </GroupItem>

            </GroupItem>
          </Form>

          <br></br>

          <CustomTabNav
            elementos={ IdTipoAutorizacion === 'HE' ? elementos_HE : elementos_JU}
            tabActivo={0}
            validateRequerid={true}
          />

          {/*******>POPUP DE UNIDAD ORGA.>******** */}
          { popupVisibleUnidad && (
          <AdministracionUnidadOrganizativaBuscar
            selectData={selectUnidadOrganizativa}
            showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
            cancelarEdicion={() => setPopupVisibleUnidad(false)}
          />
          )}

          {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
          { popupVisiblePosicion && (
            <AdministracionPosicionPersonaBuscar
            selectData={agregarPopupPosicion}
            showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
            cancelar={() => setPopupVisiblePosicion(false)}
            filtro={filtroLocal}
            />
          )}

        </React.Fragment>
      </PortletBody>

      <Confirm
          message={intl.formatMessage({ id: "¿Estas seguro que el Autorizador sera el principal?" })}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          setInstance={setInstance}
          onConfirm={() => onConfirm(true)}
          onHide={() => onConfirm(false)}
          title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
          confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
          cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
    />

    </>
  );
};

export default injectIntl(AutorizadorEditPage);
