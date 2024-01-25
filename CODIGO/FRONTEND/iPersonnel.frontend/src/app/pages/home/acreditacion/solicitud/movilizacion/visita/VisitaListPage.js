import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { Item, GroupItem } from "devextreme-react/form";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Button as ColumnButton
} from "devextreme-react/data-grid";

import { isNotEmpty, listarEstado, listarEstadoAprobacion, STATUS_ACREDITACION_SOLICITUD, getStartAndEndOfMonthByDay, dateFormat, convertyyyyMMddToDate, listarSexoSimple } from "../../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import WithLoandingPanel from "../../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../../store/ducks/notify-messages";

import { storeListarMovilizacionVisita as loadUrl, serviceSolicitud } from "../../../../../../api/acreditacion/solicitud.api";
import { initialFilter } from "./VisitaIndexPage";
import HeaderInformation from "../../../../../../partials/components/HeaderInformation";
import AdministracionUnidadOrganizativaBuscar from "../../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionContratoBuscar from "../../../../../../partials/components/AdministracionContratoBuscar";
import { Tooltip } from 'devextreme-react/tooltip';
import { Popover } from 'devextreme-react/popover';
import RemoveFromQueue from "@material-ui/icons/RemoveFromQueue";
import { listarbySolicitud, obtenerbysolicitante } from "../../../../../../api/acreditacion/visitaPersona.api";
import { cargarRequisitosDatoEvaluar } from "../../../../../../partials/content/Acreditacion/Visitas/VisitasUtils";
import VisitaListPageDetallePopup from "./VisitaListPageDetallePopup";

const VisitaListPage = props => {
  const { intl, focusedRowKey, setLoading, refresh } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [isVisiblePopUpCompaniaContratista, setisVisiblePopUpCompaniaContratista] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);
  const [estado, setEstado] = useState([]);
  const [estadosAprobacion, setEstadosAprobacion] = useState([]);
  const { IdDivision } = props.selected;
  const [solicitudVisita, setSolicitudVisita] = useState({});
  const [personaVisita, setPersonaVisita] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tipoDocumentos, setTipoDocumentos] = useState([]);
  const [sexoSimple, setSexoSimple] = useState([]);
  const [viewPopupPersona, setViewPopupPersona] = useState(false);
  const [optRequisito, setOptRequisito] = useState([]);
  const [personaRequisitos, setpersonaRequisitos] = useState([]);

  const [permisosDatosPersona, setPermisoDatosPersona] = useState({
    IDTIPODOCUMENTO: false,
    DOCUMENTO: false,
    APELLIDO: false,
    NOMBRE: false,
    DIRECCION: false,
    FECHANACIMIENTO: false,
    SEXO: false,
    TELEFONOMOVIL: false,
    EMAIL: false
  });

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente,
    IdDivisionPerfil,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",

  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();
  const [withTitleVisible, setWithTitleVisible] = useState(false);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {
    let dataEstados = listarEstadoAprobacion();
    let estado = listarEstado();

    setEstadosAprobacion(dataEstados);
    setEstado(estado);
  }


  const seleccionarRegistro = evt => {



    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const abrirSolicitudDetalle = evt => {
    props.abrirSolicitudDetalle(evt.row.data);
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompaniaMandante: IdCompania, CompaniaMandante: Compania } })
    setPopupVisibleCompania(false);
  }

  const selectCompaniaContratista = (contratista) => {
    const { IdCompania, Compania } = contratista[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompaniaContratista: IdCompania, CompaniaContratista: Compania } })
    setisVisiblePopUpCompaniaContratista(false);
  }

  const selectUnidadOrganizativa = async (selectedRow) => {
    let strUnidadesOrganizativas = selectedRow.map(x => x.IdUnidadOrganizativa).join('|');
    let UnidadesOrganizativasDescripcion = selectedRow.map(x => x.Menu).join(',');
    props.dataSource.loadDataWithFilter({ data: { UnidadesOrganizativas: strUnidadesOrganizativas, UnidadesOrganizativasDescripcion } });
    setPopupVisibleUnidad(false);
  };

  const selectPosicion = async (dataPopup) => {

    const { IdPosicion, Posicion } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdPosicion, Posicion } });
    setPopupVisiblePosicion(false);
  }

  const selectPersonas = (data) => {
    //console.log("selectPersonas", data, IdTipoDocumento);
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      //console.log(strPersonas);
      props.dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }
  }

  const agregarContrato = (contrato) => {
    const { IdContrato, Contrato } = contrato[0];
    if (isNotEmpty(IdContrato)) {
      props.dataSource.loadDataWithFilter({ data: { IdContrato: IdContrato, Contrato: Contrato } });
    }
  };


  function cellRenderColorTiempoCredencial(param) {

    if (param && param.data) {
      const { DiasTranscurridos, IdSolicitud } = param.data;

      if (!isNotEmpty(DiasTranscurridos))
        return <> {/* COLOR GRIS : NO ESPECIFICA*/}</>

      if (DiasTranscurridos >= props.colorRojo) { //DiasTranscurridos >= props.colorRojo

        return <>
          {/* COLOR ROJO : MAYORES A 4 DIAS*/}
          <i className="fas fa-circle text-red-color icon-10x" id={`id_${DiasTranscurridos}_${IdSolicitud}`} ></i>
          <Tooltip
            target={`#id_${DiasTranscurridos}_${IdSolicitud}`}
            showEvent="mouseenter"
            hideEvent="mouseleave"
            hideOnOutsideClick={false}
          >
            <div><p>{intl.formatMessage({ id: "ACCREDITATION.LEGEND.ELAPSED" })}: <label className="estado_item_rechazado clsEstados_ColorDias">{DiasTranscurridos} d</label></p></div>
          </Tooltip>
        </>

      }
      else if (DiasTranscurridos <= props.colorVerde) {//DiasTranscurridos <= props.colorVerde
        return <>
          {/* COLOR VERDE : MENOR A 2 DIAS*/}
          <i className="fas fa-circle  text-success icon-10x" id={`id_${DiasTranscurridos}_${IdSolicitud}`} ></i>
          <Tooltip
            target={`#id_${DiasTranscurridos}_${IdSolicitud}`}
            showEvent="mouseenter"
            hideEvent="mouseleave"
            hideOnOutsideClick={false}
          >
            <div><p>{intl.formatMessage({ id: "ACCREDITATION.LEGEND.ELAPSED" })}: <label className="estado_item_aprobado clsEstados_ColorDias">{DiasTranscurridos} d</label></p></div>
          </Tooltip>
        </>
      } else if (DiasTranscurridos > props.colorVerde && DiasTranscurridos < props.colorRojo) {

        return <>
          {/* COLOR NARANJA : MEDIO ENTRE 2 A 4 DIAS*/}
          <i className="fas fa-circle text-warning icon-10x" id={`id_${DiasTranscurridos}_${IdSolicitud}`} ></i>
          <Tooltip
            target={`#id_${DiasTranscurridos}_${IdSolicitud}`}
            showEvent="mouseenter"
            hideEvent="mouseleave"
            hideOnOutsideClick={false}
          >
            <div><p>{intl.formatMessage({ id: "ACCREDITATION.LEGEND.ELAPSED" })}: <label className="estado_item_incompleto clsEstados_ColorDias">{DiasTranscurridos} d</label></p></div>
          </Tooltip>
        </>
      }
    }
  }

  const cellEstadoRender = e => {
    let estado = e?.data?.EstadoAprobacion;
    if (!estado) return "";
    let css = "";
    let estado_txt = "";
    if (e.data.EstadoAprobacion.trim() === "") {
      estado = "I";
    }

    switch (estado) {
      case "I":
        css = "estado_item_incompleto";
        estado_txt = intl
          .formatMessage({ id: "COMMON.INCOMPLETE" });
        break;
      case "P":
        css = "estado_item_pendiente";
        estado_txt = intl.formatMessage({ id: "COMMON.EARRING" });
        break;
      case "O":
        css = "estado_item_observado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.OBSERVED" });
        break;
      case "R":
        css = "estado_item_rechazado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.REJECTED" });
        break;
      case "A":
        css = "estado_item_aprobado";
        estado_txt = intl
          .formatMessage({ id: "COMMON.APPROVED" });
        break;
      default: break;
    }

    return css === "" ? (
      <div className={"estado_item_general"}>{estado_txt}</div>
    ) : (
      <div className={`estado_item_general  ${css}`}>{estado_txt}</div>
    );
  };

  const leyendaGrid = () => {
    return (<>
      <div className="content">
        <div className="row">
          <i className="fas fa-circle  text-success icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.LEGEND.UNDER" }) + props.colorVerde + intl.formatMessage({ id: "ACCREDITATION.LEGEND.DAY" })}   </i> &nbsp; &nbsp;
        </div>
        <div className="row">
          <i className="fas fa-circle  text-warning icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.LEGEND.HALF" }) + props.colorVerde + " - " + props.colorRojo + intl.formatMessage({ id: "ACCREDITATION.LEGEND.DAYS" })}   </i> &nbsp; &nbsp;
        </div>
        <div className="row">
          <i className="fas fa-circle  text-red-color icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.LEGEND.HIGH" }) + props.colorRojo + intl.formatMessage({ id: "ACCREDITATION.LEGEND.DAYS" })}   </i> &nbsp; &nbsp;
        </div>
        {/* <div className="row">
          <i className="fas fa-circle  text-gray-color icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.LEGEND.INDETERMINATE" }) + ": " + intl.formatMessage({ id: "ACCREDITATION.LEGEND.NA" })}   </i> &nbsp; &nbsp;
        </div> */}
      </div>
    </>)
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }


  const exportReport = async () => {

    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    // Recorremos los filtros usados:
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      // Filtramos solo los Array
      if (currentValue instanceof Array) {

        // Recorremos cada uno de los filtros en el array
        for (let j = 0; j < currentValue.length; j++) {

          //Llenamos filterData para decompilarlo en el siguente punto.
          filterData[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];
    //console.log("filtro.orden", selector);


    // Decompilando filterData
    const { IdCliente, IdCompaniaContratista, IdDivision, IdSolicitud, Documento, NombreCompleto, CompaniaContratista, EstadoAprobacion,
      FechaInicio, FechaFin, IdCompaniaMandante, EstadoSolicitud, UnidadesOrganizativas,
      Personas, Procesado, Visitante } = filterData;


    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          //ListColumnName.push(item.options.caption);
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdCompaniaContratista: isNotEmpty(IdCompaniaContratista) ? IdCompaniaContratista : "",
        IdDivision: IdDivision,
        IdSolicitud: isNotEmpty(IdSolicitud) ? IdSolicitud : "",
        Documento: isNotEmpty(Documento) ? Documento : "",
        NombreCompleto: isNotEmpty(NombreCompleto) ? NombreCompleto : "",
        CompaniaContratista: isNotEmpty(CompaniaContratista) ? CompaniaContratista : "",
        EstadoAprobacion: isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "",
        FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
        FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
        IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "",
        EstadoSolicitud: isNotEmpty(EstadoSolicitud) ? EstadoSolicitud : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        Procesado: isNotEmpty(Procesado) ? Procesado : "",
        Visitante: isNotEmpty(Visitante) ? Visitante : "",
        TituloHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.GESTIÓN_DE_ACREDITACIÓN" }),
        NombreHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.GESTIÓN_DE_ACREDITACIÓN" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceSolicitud.exportarExcelMovilizacionVisita(params).then(response => {
        if (isNotEmpty(response.fileBase64)) {
          let download = document.getElementById('iddescarga');
          download.href = `data:application/vnd.ms-excel;base64,${encodeURIComponent(response.fileBase64)}`;
          download.download = response.fileName;
          download.click();
          handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.DOWNLOAD.SUCESS" }));
        }

      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      }).finally(() => {
        setLoading(false);
      });

    }
  }

  const loadingVisitData = async IdSolicitud => {
    setLoading(true);
    let visitas = await listarbySolicitud({ IdSolicitud })
      .then(resp => resp.data)
      .catch(err => [])
      .finally(() => {
        setLoading(false);
      });

    setPersonaVisita(visitas);
    return visitas;
  };

  useEffect(() => {
    cargarCombos();
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])
  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);


  const transformData = {
    FechaInicio: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'),
    FechaFin: (rawValue) => dateFormat(rawValue, 'yyyyMMdd hh:mm'),
  }
  const reverseTransformData = {
    FechaInicio: (value) => convertyyyyMMddToDate(value),
    FechaFin: (value) => convertyyyyMMddToDate(value),
  }

  const eventRefreshDataGridDetail = IdSolicitud => {
    refresh();

    // loadingVisitData(IdSolicitud);
  };


  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdCompaniaContratista',
      'IdSolicitud',
      'Documento',
      'NombreCompleto',
      'CompaniaContratista',
      'EstadoAprobacion',
      'IdCompaniaMandante',
      'EstadoSolicitud',
      'IdUnidadOrganizativa',
      'UnidadesOrganizativas',
      'Personas',
      'Procesado',
      'FechaInicio',
      'FechaFin',
      'Visitante'
    ];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={2} colSpan={2}>
          <Item dataField="IdCompania" visible={false} />
          <Item dataField="IdUnidadOrganizativa" visible={false} />
          <Item dataField="IdPosicion" visible={false} />
          <Item dataField="IdCompaniaContratista" visible={false} />

          <Item
            dataField="EstadoAprobacion"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.STATUS" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estadosAprobacion,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="Procesado"
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.PROCESS" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: estado,
              valueExpr: "Valor",
              displayExpr: "Descripcion",
              showClearButton: true,
              onValueChanged: () => getInstance().filter(),
            }}
          />

          <Item
            dataField="CompaniaContratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COMPANY" }) }}
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
                    setisVisiblePopUpCompaniaContratista(true);
                  },
                }
              }]
            }}
          />


          <Item
            dataField="UnidadesOrganizativasDescripcion"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION.ORGANIZATIONALUNIT" }) }}
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
          <Item dataField="Personas"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.REPORT.PEOPLES" }) }}
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
                    setPopupVisiblePersonas(true);
                  },
                }
              }]
            }}
          />

          <Item />

          <Item
            dataField="FechaInicio"
            label={{
              text: intl.formatMessage({ id: "ACCREDITATION.REQUEST" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter()
            }}
          />

          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "ACCREDITATION.REQUEST" }) + " " + intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="datetime"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter()

            }}
          />


        </GroupItem>

      </GroupItem>
    );
  }

  const eventGetRecord = async e => {
    //console.log("eventGetRecord", { e });
    let { IdSecuencial, IdSolicitud } = e.row.data;
    setModoEdicion(false);
    await uploadPersonData(IdSolicitud, IdSecuencial);
    setViewPopupPersona(true);
    // console.log("test_modal",evt.row.data);
  };

  const uploadPersonData = async (IdSolicitud, IdSecuencial) => {
    //setLoading(true);
    let datos = await obtenerbysolicitante({
      IdSolicitud: IdSolicitud,
      IdSecuencial: IdSecuencial
    })
      .then(resp => resp)
      .catch(err => [])
      .finally(re => {
        //setLoading(false);
      });
    console.log("test_selecx", datos);

    if (!!datos && datos.length > 0) {
      let datosVisita = datos[0][0];
      let datosPersonas = datos[1];
      let datosRequisitos = datos[2];
      let datosDatosEvaluar = datos[3];
      let datosPersonaDatosEvaluar = datos[4];

      let datosDatosEvaluarDetalle = datos[5];
      let datosTiempoAcreditacion = datos[0][0].TiempoAcreditacion;

      setSexoSimple(listarSexoSimple());
      setTipoDocumentos(
        datosPersonas.map(x => ({
          IdTipoDocumento: x.IdTipoDocumento,
          TipoDocumento: x.TipoDocumento
        }))
      );
      let { datosPersona, datosEvaluar } = cargarRequisitosDatoEvaluar(
        datosRequisitos,
        datosDatosEvaluar,
        datosPersonaDatosEvaluar,
        datosDatosEvaluarDetalle
      );

      setPersonaVisita(prev => ({
        ...prev,
        ...datosVisita,
        ...datosPersonas[0],
        ...datosPersona,
        Observacion: datosPersonaDatosEvaluar[0].Observacion,
        IdCompania: datosVisita.IdCompaniaMandante,
        NombreCompleto: datosVisita.PersonaVisitada,
        esNuevoRegistro: false,
        TiempoAcreditacion: datosTiempoAcreditacion
      }));

      setOptRequisito(datosEvaluar);

      /*console.log("======================");
      console.log({ datosEvaluar, datosPersona });
      console.log("======================");*/

      setpersonaRequisitos(datosEvaluar);
    }
  };

  const renderDataGrid = ({ gridRef, dataSource }) => {
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setVarIdSolicitud("")
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    dataGridRef = gridRef;
    return (
      <>
        <DataGrid
          dataSource={dataSource}
          ref={gridRef}
          //onEditingStart={editarRegistro}
          //onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          // onRowDblClick={seleccionarRegistroDblClick}
          // onCellPrepared={onCellPrepared}
          focusedRowEnabled={true}
          focusedRowKey={focusedRowKey}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          onRowExpanding={async e => {
            ////console.log("onRowExpanding", e);

            let grid = e.component;
            grid.collapseAll(-1);
            let rows = grid.getVisibleRows();
            ////console.log(rows);
            //let rowIndex = grid.getRowIndexByKey(e.key);
            let row = rows.find(x => x.key === e.key);

            ////console.log(row.data);
            setSolicitudVisita(row.data);
            // //console.log("obtenerPersonas", { Solicitud });
            let { IdSolicitud } = row.data;

            let visitas = await loadingVisitData(IdSolicitud);
            if (visitas.length === 0) {
              e.cancel = true;
            } else {
              grid.expandRow(e.key);
            }

            ////console.log("cargo :::", { visitas });
            //setPersonas(visitas);
          }}
          onSelectionChanged={e => {
            ////console.log("onSelectionChanged", e);
            e.component.collapseAll(-1);
            e.component.expandRow(e.currentSelectedRowKeys[0]);
          }}
        >
          <Editing mode="row"
            useIcons={props.showButtons}
            allowUpdating={props.showButtons}
            allowDeleting={props.showButtons}
            texts={textEditing} />
          <FilterRow visible={true} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />

          <Column
            dataField="RowIndex"
            caption="-"
            width={"5%"}
            alignment="center"
            cellRender={cellRenderColorTiempoCredencial}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />

          <Column
            dataField="IdSolicitud"
            caption={intl.formatMessage({ id: "ACCREDITATION.REQUEST" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            alignment={"center"}
            width={"6%"}
          />

          <Column
            width="11%"
            dataField="FechaSolicitud"
            caption={intl.formatMessage({ id: "ADMINISTRATION.REQUEST.DATE" })}
            dataType="date"
            format="dd/MM/yyyy hh:mm"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
          />

          <Column dataField="CompaniaContratista"
            caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.COMPANY" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"15%"}
          />

          <Column dataField="Visitante"
            caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.VISITOR" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"17%"}
          />

          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            allowFiltering={false}
            width={"8%"}
            alignment="center"
          />

          <Column
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })}
            dataField="FechaInicio"
            width={"8%"}
            alignment={"center"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />
          <Column
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })}
            dataField="FechaFin"
            width={"8%"}
            alignment={"center"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.RESPONSIBLE" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"17%"}
          />
          <Column
            dataField="EstadoVisita"
            caption={intl.formatMessage({ id: "COMMON.STATE" })}
            width={"103px"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            cellRender={cellEstadoRender}
          />
          <Column type="buttons"
            width={"40px"}
            visible={true}>
            <ColumnButton
              icon="fa fa-eye"
              hint={intl.formatMessage({ id: "ACTION.VIEW" })}
              onClick={eventGetRecord}
            />
          </Column>
        </DataGrid>
      </>
    );
  }

  return (
    <>
      <a id="iddescarga" className="" ></a>
      {props.showHeaderInformation && (
        <HeaderInformation
          visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
          toolbar={
            <PortletHeader
              title=""
              toolbar={
                <PortletHeaderToolbar>
                  <PortletHeaderToolbar>

                    <Button icon="fa fa-plus"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.NEW" })}
                      visible={props.showButtons}
                      onClick={props.nuevoRegistro}
                      disabled={customDataGridIsBusy}
                    />
                    &nbsp;
                    <Button
                      icon="filter"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                      onClick={() => setIsActiveFilters(!isActiveFilters)}
                      disabled={customDataGridIsBusy}
                    />
                    &nbsp;
                    <Button
                      icon="refresh" //fa fa-broom
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                      disabled={customDataGridIsBusy}
                      onClick={resetLoadOptions} />
                    &nbsp;
                    <Button
                      icon="fa fa-file-excel"
                      type="default"
                      hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                      disabled={true}
                    />

                  </PortletHeaderToolbar>
                </PortletHeaderToolbar>
              }
            />
          } />
      )}


      {!props.showHeaderInformation && (
        <PortletHeader
          title={intl.formatMessage({ id: "ACTION.LIST" })}
          toolbar={
            <PortletHeaderToolbar>
              <Button icon="fa fa-plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                visible={props.showButtons}
                onClick={props.nuevoRegistro}
                disabled={customDataGridIsBusy}
              />
              &nbsp;
              <Button
                icon="filter"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                onClick={() => setIsActiveFilters(!isActiveFilters)}
                disabled={customDataGridIsBusy}
              />
              &nbsp;
              <Button icon="refresh" //fa fa-broom
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                disabled={customDataGridIsBusy}
                onClick={resetLoadOptions} />
              &nbsp;
              <Button
                icon="fa fa-file-excel"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                disabled={customDataGridIsBusy}
                onClick={exportReport}
              //disabled={true}
              />

            </PortletHeaderToolbar>
          }
        />)}



      <PortletBody>
        <CustomDataGrid
          uniqueId={props.uniqueId} //'personaList'
          dataSource={props.dataSource}
          rowNumberName='RowIndex'
          loadWhenStartingComponent={props.isFirstDataLoad && !props.refreshData}
          renderDataGrid={renderDataGrid}
          loadUrl={loadUrl}
          forceLoad={forceLoadTypes.Unforced}
          sendToServerOnlyIfThereAreChanges={true}
          ifThereAreNoChangesLoadFromStorage={ifThereAreNoChangesLoadFromStorage}
          caseSensitiveWhenCheckingForChanges={true}
          uppercaseFilterRow={true}
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'NombreCompleto', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          // CUSTOM FILTER
          visibleCustomFilter={isActiveFilters}
          renderFormContentCustomFilter={renderFormContentCustomFilter}
          transformData={transformData}
          reverseTransformData={reverseTransformData}
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize='md'
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />

        <div className="dx-field-value-static">
          <p style={{ color: "black" }}>
            <span id="subject2"></span>
            <RemoveFromQueue />
            <a
              id="link2"
              style={{ color: "black" }}
              onMouseEnter={() => setWithTitleVisible(!withTitleVisible)}
              onMouseLeave={() => setWithTitleVisible(!withTitleVisible)}
            > {intl.formatMessage({ id: "ACCREDITATION.LEGEND" })}
            </a>

          </p>
          <Popover
            target="#link2"
            position="top"
            width={300}
            showTitle={true}
            title={intl.formatMessage({ id: "ACCREDITATION.LEGEND.TITLE" })}
            visible={withTitleVisible}
          >
            {leyendaGrid()}
          </Popover>
        </div>

      </PortletBody>

      {/*******>POPUP DE COMPANIAS>******** */}
      {popupVisibleCompania && (
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"administracionCompaniaBuscar"}
          isContratista={"N"}
        />
      )}

      {isVisiblePopUpCompaniaContratista && (
        <AdministracionCompaniaBuscar
          selectData={selectCompaniaContratista}
          showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaContratista, setisVisiblePopUp: setisVisiblePopUpCompaniaContratista }}
          cancelarEdicion={() => setisVisiblePopUpCompaniaContratista(false)}
          uniqueId={"administracionCompaniaContratistaBuscar"}
          isContratista={"S"}
        />
      )
      }
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

      {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
      {popupVisiblePosicion && (
        <AdministracionPosicionBuscar
          selectData={selectPosicion}
          showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
          cancelarEdicion={() => setPopupVisiblePosicion(false)}
          uniqueId={"posionesBuscarPersonaList"}

        />
      )}

      {popupVisiblePersonas && (
        <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        />
      )}


      {/*******>POPUP DE CONTRATO>****************************** */}
      {popupVisibleContrato && (
        <AdministracionContratoBuscar
          selectData={agregarContrato}
          showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
          cancelar={() => setPopupVisibleContrato(false)}
        />
      )}

      {viewPopupPersona && (
        <VisitaListPageDetallePopup
          dataRowEditNew={personaVisita}
          permisosDatosPersona={permisosDatosPersona}
          optRequisito={optRequisito}
          setOptRequisito={setOptRequisito}
          personaRequisitos={personaRequisitos}
          setpersonaRequisitos={setpersonaRequisitos}
          modoEdicion={modoEdicion}
          // personalDataRules={personalDataRules}
          // setFlLoadPersonalDataRules={setFlLoadPersonalDataRules}
          // flLoadPersonalDataRules={flLoadPersonalDataRules}
          tipoDocumentos={tipoDocumentos}
          sexoSimple={sexoSimple}
          // cancelarEdicion={cancelarEdicion}
          // cargarDatos={verEdit}
          // eventoRetornar={eventoRetornar}
          // ActualizarGrilla={actualizarGrillas}
          // setVerPopup={setPopupVisible}
          // setFileView={setFileView}
          showPopup={{
            isVisiblePopUp: viewPopupPersona,
            setisVisiblePopUp: setViewPopupPersona
          }}
          tabActivo={0}
          intl={intl}
          setLoading={setLoading}
          colorRojo={props.colorRojo}
          colorVerde={props.colorVerde}
        />
      )}
    </>
  );
};
VisitaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
VisitaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'desmovilizacionPersonaList',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(VisitaListPage));
