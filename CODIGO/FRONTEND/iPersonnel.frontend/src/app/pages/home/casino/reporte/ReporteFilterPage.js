import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
//import './ReporteFilterPage.css';
//import DropBoxServicio from "./DropBoxServicio";
import DropDownBox from 'devextreme-react/drop-down-box';

//BUSCAR:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { obtenerTodos as obtenerCmbTipoReporte } from "../../../../api/sistema/moduloAplicacionReporte.api";
import { obtenerTodos as obtenerCmbComedor } from "../../../../api/casino/comedor.api";
import { obtenerTodos as obtenerCmbServicio } from "../../../../api/casino/comedorServicio.api";


//FILTROS OBTENIDOS:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
import AdministracionUnidadOrganizativaBuscar from "../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionCompaniaBuscar from "../../../../partials/components/AdministracionCompaniaBuscar";
import { obtenerTodos as obtenerTodosTipoPosicion } from "../../../../api/administracion/tipoPosicion.api";
import AdministracionCentroCostoBuscar from "../../../../partials/components/AdministracionCentroCostoBuscar";
import { obtenerTodos as obtenerTodosTipoDocumento } from "../../../../api/sistema/tipodocumento.api";
import { obtenerTodos as obtenerTodosGrupoComedor } from "../../../../api/casino/casinoGrupo.api";
import { listarEstadoSimple } from "../../../../../_metronic";



const ReporteFilterPage = props => {

  const { intl, setLoading, dataMenu } = props;
  //console.log("ReporteFilterPage",dataMenu);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  //Búsqueda
  const [cmbTipoReporte, setCmbTipoReporte] = useState([]);
  const [cmbComedor, setCmbComedor] = useState([]);
  const [cmbServicio, setCmbServicio] = useState([]);

  //Filtros
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [cmbTipoPosicion, setCmbTipoPosicion] = useState([]);
  const [cmbTipoDocumento, setCmbTipoDocumento] = useState([]);
  const [cmbGrupoComedor, setCmbGrupoComedor] = useState([]);
  const [cmbEstadoSimple, setCmbEstadoSimple] = useState([]);

  const [Filtros, setFiltros] = useState({ FlRepositorio: "1" });
  const [treeBoxValue, setTreeBoxValue] = useState([]);

  async function cargarCombos() {
    //let x = dataMenu;
    const { IdModulo, IdAplicacion } = dataMenu.info;
    //console.log("cargarCombos", IdModulo, IdAplicacion);

    //debugger;
    let cmbTipoReporte = await obtenerCmbTipoReporte({ IdCliente, IdModulo, IdAplicacion, IdReporte: '%' });//modulo 08 , aplicacion AP00
    setCmbTipoReporte(cmbTipoReporte);

    let cmbComedor = await obtenerCmbComedor({ IdCliente, IdDivision, IdTipo: '%' });
    if (cmbComedor.length > 0) {
      cmbComedor.unshift({ IdComedor: '', Comedor: '[---TODOS---]' });
    } setCmbComedor(cmbComedor);

    /*  await obtenerCmbServicio({ IdCliente, IdDivision, IdComedor: '%' }).then(cmbServicio => {
       console.log("obtenerCmbServicio", cmbServicio);
       setCmbServicio(cmbServicio);
       if (cmbServicio.length > 0) {
         cmbServicio.unshift({ IdServicio: '', Servicio: '[---TODOS---]' });
       }
     }); */
    cmbServicio.unshift({ IdServicio: '', Servicio: '[---TODOS---]' });

    //debugger;


    //FILTROS OBTENIDOS::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

    let [cmbTipoPosicion, cmbTipoDocumento, cmbGrupoComedor, cmbEstadoSimple] = await Promise.all([
      obtenerTodosTipoPosicion({ IdCliente, IdDivision }),
      obtenerTodosTipoDocumento({ IdTipoDocumento: '%' }),
      obtenerTodosGrupoComedor({ IdCliente, IdDivision }),
      listarEstadoSimple()
    ])
    if (cmbTipoPosicion.length > 0) {
      cmbTipoPosicion.unshift({ IdTipoPosicion: '', TipoPosicion: '[---TODOS---]' });
      //console.log("obtenerTodosTipoPosicion", cmbTipoPosicion);
      setCmbTipoPosicion(cmbTipoPosicion);
    }
    if (cmbTipoDocumento.length > 0) {
      cmbTipoDocumento.unshift({ IdTipoDocumento: '', TipoDocumento: '[---TODOS---]' });
      setCmbTipoDocumento(cmbTipoDocumento);
    }
    if (cmbGrupoComedor.length > 0) {
      cmbGrupoComedor.unshift({ IdGrupo: '', Grupo: '[---TODOS---]' });
      setCmbGrupoComedor(cmbGrupoComedor);
    }
    if (cmbEstadoSimple.length > 0) {
      cmbEstadoSimple.unshift({ Valor: '', Descripcion: '[---TODOS---]' });
      setCmbEstadoSimple(cmbEstadoSimple);
    }

  }


  async function onValueServicio(value) {
    let cmbServicio = await obtenerCmbServicio({ IdCliente, IdDivision, IdComedor: value });
    if (cmbServicio.length > 0) {
      cmbServicio.unshift({ IdServicio: '', Servicio: '[---TODOS---]' });
    }
    setCmbServicio(cmbServicio);
  }


  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    //console.log("selectCompania",IdCompania, Compania);
    props.dataFilter.IdCompania = IdCompania;
    props.dataFilter.Compania = Compania;
    setPopupVisibleCompania(false);
  }


  const selectUnidadOrganizativa = async (dataPopup) => {
    const { IdCliente, IdDivision, IdUnidadOrganizativa, UnidadOrganizativa } = dataPopup;
    props.dataFilter.IdUnidadOrganizativa = IdUnidadOrganizativa;
    props.dataFilter.UnidadOrganizativa = UnidadOrganizativa;
    setPopupVisibleUnidad(false);
  };


  const selectCentroCosto = dataPopup => {
    //console.log("selectCentroCosto", dataPopup);
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    props.dataFilter.IdCentroCosto = IdCentroCosto;
    props.dataFilter.CentroCosto = CentroCosto;
    setisVisibleCentroCosto(false);
  };


  useEffect(() => {
    cargarCombos();
  }, []);



  return (
    <>
      <PortletHeader
        title={""}
        toolbar={
          <PortletHeaderToolbar>

            <Button
              icon="fa fa-check"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
              //onClick={props.aceptar}
              disabled={true}
            //disabled={!accessButton.grabar}
            />
            &nbsp;
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
            //onClick={props.cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody >
        <React.Fragment>
          <Form formData={props.dataFilter} validationGroup="FormEdicion" labelLocation="top" >
            <GroupItem itemType="group" colCount={8} colSpan={8} cssClass="options-reporte" >

              <Item
                dataField="IdReporte"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.SUBMENU" }) }}
                editorType="dxSelectBox"
                colSpan={4}
                editorOptions={{
                  items: cmbTipoReporte,
                  valueExpr: "IdReporte",
                  displayExpr: "Reporte",
                  onKeyUp: (evt) => {
                    if (evt.event.keyCode === 13) {
                      //onBuscarFiltros();
                    }
                  },
                  onClosed: (evt) => {
                    //onBuscarFiltros();
                  },
                }}
              />

              <Item
                dataField="IdComedor"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.DINNINGROOM" }) }}
                editorType="dxSelectBox"
                //isRequired={true}
                colSpan={2}
                editorOptions={{
                  items: cmbComedor,
                  valueExpr: "IdComedor",
                  displayExpr: "Comedor",
                  onValueChanged: (e => onValueServicio(e.value)),
                  onKeyUp: (evt) => {
                    if (evt.event.keyCode === 13) {
                      //onBuscarFiltrosComedor();
                    }
                  },
                  onClosed: (evt) => {
                    //onBuscarFiltrosComedor();
                  },
                }}
              />
              {/* <Item
                dataField="IdServicio"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.SERVICE" }) }}
                editorType="dxSelectBox"
                //isRequired={true}
                colSpan={2}
                editorOptions={{
                  items: cmbServicio,
                  valueExpr: "IdServicio",
                  displayExpr: "Servicio",
                  value: "",
                  onKeyUp: (evt) => {
                    if (evt.event.keyCode === 13) {
                      // onBuscarFiltrosServicio();
                    }
                  },
                  onClosed: (evt) => {
                    //onBuscarFiltrosServicio();
                  },
                }}
              /> */}

              <Item
                colSpan={2}
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.SERVICE" }) }}
              >
                <DropDownBox
                  value={props.treeBoxValue}
                  valueExpr="IdServicio"
                  displayExpr="Servicio"
                  placeholder="Seleccione..."
                  showClearButton={true}
                //dataFilter={treeDataSource}
                //onValueChanged={syncTreeViewSelection}
                //contentRender={treeViewRender}
                />
                {/*  <DropBoxServicio
                  idServicio={props.IdServicio}
                  menuTreev={props.menuTreev}
                  //dataField="IdServicio"
                  //servicioData={obtenerCmbServicio}
                  //displayExpr={obtenerCmbServicio}
                  treeBoxValue={cmbServicio}
                  setTreeBoxValue={setCmbServicio}
                /> */}
              </Item>

            </GroupItem>


            <GroupItem itemType="group" colCount={8} colSpan={6}>
              <Item
                colSpan={4}
                dataField="Compania"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.COMPANY" }) }}
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
                colSpan={4}
                dataField="UnidadOrganizativa"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.ORGANIZATIONALUNIT" }) }}
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
                colSpan={4}
                dataField="IdTipoPosicion"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.TYPEPOSITION" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbTipoPosicion,
                  valueExpr: "IdTipoPosicion",
                  displayExpr: "TipoPosicion",
                  searchEnabled: true,
                  value: "",
                  //onValueChanged: () => getInstance().filter(),
                }}
              />

              <Item
                colSpan={4}
                dataField="CentroCosto"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.COSTCENTER" }), }}
                editorOptions={{
                  //readOnly: true,
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
                        disabled: false,
                        onClick: () => {
                          //let { IdCliente, IdUnidadOrganizativa } = props.dataFilter;
                          //setFiltros({ ...Filtros, IdCliente, IdUnidadOrganizativa: props.dataFilter.IdUnidadOrganizativa })
                          setFiltros({ ...Filtros, IdCliente })
                          setisVisibleCentroCosto(true);
                        },
                      },
                    },
                  ],
                }}
              />
              <Item
                colSpan={4}
                dataField="IdTipoDocumento"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTTYPE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbTipoDocumento,
                  valueExpr: "IdTipoDocumento",
                  displayExpr: "TipoDocumento",
                  searchEnabled: true,
                  value: ""
                  //onValueChanged: () => getInstance().filter(),
                }}
              />

              <Item
                colSpan={4}
                dataField="IdDocumento"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.DOCUMENTNUMBER" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />
              <Item
                colSpan={4}
                dataField="IdPlanilla"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.SPREADCODE" }) }}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' }
                }}
              />

              <Item
                colSpan={4}
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.WORKINGSTATUS" }) }}
                editorType="dxSelectBox"
                //isRequired={true}
                editorOptions={{
                  items: cmbEstadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  value: ""
                }}
              />
              <Item
                colSpan={4}
                dataField="IdGrupo"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.DININGGROUP" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: cmbGrupoComedor,
                  valueExpr: "IdGrupo",
                  displayExpr: "Grupo",
                  searchEnabled: true,
                  value: ""
                  //onValueChanged: () => getInstance().filter(),
                }}
              />

              <Item
                colSpan={2}
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.STARTDATE" }) }}
                //isRequired={true}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy"
                }}
              />

              <Item
                colSpan={2}
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.REPORT.ENDDATE" }) }}
                //isRequired={true}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy"
                }}
              />

            </GroupItem>
          </Form>


          {/*******>POPUP DE COMPANIAS>******** */}
          <AdministracionCompaniaBuscar
            selectData={selectCompania}
            showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
            cancelarEdicion={() => setPopupVisibleCompania(false)}
            uniqueId={"companiabuscarPersonaListPage"}
          />
          {/*******>POPUP DE UNIDAD ORGA.>******** */}
          <AdministracionUnidadOrganizativaBuscar
            selectData={selectUnidadOrganizativa}
            showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
            cancelarEdicion={() => setPopupVisibleUnidad(false)}
          />

          {/*******>POPUP CENTRO COSTO.>******** */}
          <AdministracionCentroCostoBuscar
            selectData={selectCentroCosto}
            showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
            cancelarEdicion={() => setisVisibleCentroCosto(false)}
            uniqueId={"CentroCostoListPage"}
            Filtros={Filtros}
            selectionMode={"row"}
          //selectionMode={"multiple"}
          //Filtros={{ FlRepositorio: "1" }}
          />
        </React.Fragment>

      </PortletBody>
    </>


  );
};

export default injectIntl(ReporteFilterPage);
