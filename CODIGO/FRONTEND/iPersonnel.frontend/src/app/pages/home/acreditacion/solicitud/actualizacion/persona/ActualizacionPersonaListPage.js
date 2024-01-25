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
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import WithLoandingPanel from "../../../../../../partials/content/withLoandingPanel";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../../store/ducks/notify-messages";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../../../partials/content/Grid/DoubleLineLabel";
import HeaderInformation from "../../../../../../partials/components/HeaderInformation";
import { Tooltip } from 'devextreme-react/tooltip';
import { Popover } from 'devextreme-react/popover';
import RemoveFromQueue from "@material-ui/icons/RemoveFromQueue";
import { convertCustomDateTimeString, convertStringToDate } from "../../../../../../partials/components/CustomFilter";

import { isNotEmpty, listarEstado, listarEstadoAprobacion, STATUS_ACREDITACION_SOLICITUD, getStartAndEndOfMonthByDay, dateFormat, convertyyyyMMddToDate } from "../../../../../../../_metronic";
import { storeListarActualizacionPersona as loadUrl, serviceSolicitud } from "../../../../../../api/acreditacion/solicitud.api";
import { initialFilter } from "./ActualizacionPersonaIndexPage";

import AdministracionUnidadOrganizativaBuscar from "../../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionContratoBuscar from "../../../../../../partials/components/AdministracionContratoBuscar";



const ActualizacionPersonaListPage = props => {
  const { intl, focusedRowKey, setLoading } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);
  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [isVisiblePopUpCompaniaContratista, setisVisiblePopUpCompaniaContratista] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);
  const [popupVisibleContrato, setPopupVisibleContrato] = useState(false);

  const [estado, setEstado] = useState([]);
  const [estadosAprobacion, setEstadosAprobacion] = useState([]);


  const { IdDivision } = props.selected;

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente,
    IdDivisionPerfil,
    IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
    FechaInicio,
    FechaFin,
  });
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();
  const [withTitleVisible, setWithTitleVisible] = useState(false);

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {
    let dataEstados_ = listarEstadoAprobacion();
    let dataEstados = dataEstados_.filter((rest) => rest.Valor !== "O")
    
    let estado = listarEstado();

    setEstadosAprobacion(dataEstados.filter(x => x.Valor != 'I'));
    setEstado(estado);
  }


  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }
  const abrirSolicitudDetalle = evt => {
    console.log(evt.row.data);
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
        return <>
          {/* COLOR GRIS : NO ESPECIFICA*/}
          {/* <i className="fas fa-circle text-gray-color icon-10x" id={`ids_${IdSolicitud}`} ></i>
          <Tooltip
            target={`#ids_${IdSolicitud}`}
            showEvent="mouseenter"
            hideEvent="mouseleave"
            hideOnOutsideClick={false}
          >
            <div><p>{intl.formatMessage({ id: "ACCREDITATION.LEGEND.ELAPSED" })}: <label className="estado_item_incompleto clsEstados_ColorDias">{intl.formatMessage({ id: "ACCREDITATION.LEGEND.NA" })}</label></p></div>
          </Tooltip> */}
        </>

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
        //  } else if (DiasTranscurridos > props.colorVerde && DiasTranscurridos < props.colorRojo) {
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

  const cellEstadoRender = (e) => {
    let estado = e.data.EstadoAprobacion;
    let css = '';
    let estado_txt = "";
    if (e.data.EstadoAprobacion.trim() === "") {
      estado = "I";
    }

    switch (estado) {
      case STATUS_ACREDITACION_SOLICITUD.INCOMPLETA: css = 'estado_item_incompleto'; estado_txt = intl.formatMessage({ id: "COMMON.INCOMPLETE" }); break;
      case STATUS_ACREDITACION_SOLICITUD.PENDIENTE: css = 'estado_item_pendiente'; estado_txt = intl.formatMessage({ id: "COMMON.EARRING" }); break;
      case STATUS_ACREDITACION_SOLICITUD.OBSERVADO: css = 'estado_item_observado'; estado_txt = intl.formatMessage({ id: "COMMON.OBSERVED" }); break;
      case STATUS_ACREDITACION_SOLICITUD.RECHAZADO: css = 'estado_item_rechazado'; estado_txt = intl.formatMessage({ id: "COMMON.REJECTED" }); break;
      case STATUS_ACREDITACION_SOLICITUD.APROBADO: css = 'estado_item_aprobado'; estado_txt = intl.formatMessage({ id: "COMMON.APPROVED" }); break;
    };


    return (css === '') ?
      <div className={"estado_item_general"}>{estado_txt}</div>
      : <div className={`estado_item_general  ${css}`}   >{estado_txt}</div>
  }

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
    // console.log("filtro.orden", selector);


    // Decompilando filterData
    const { IdCliente, IdCompaniaContratista, IdDivision, IdSolicitud, Documento, NombreCompleto, CompaniaMandante, EstadoAprobacion,
      FechaInicio, FechaFin, IdCompaniaMandante, IdContrato, EsSubContratista, EstadoSolicitud, UnidadesOrganizativas,
      Personas, Procesado } = filterData;


    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        // console.log("exportReport|item:",item);
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {

          if (item.configCollections.columns) {
            if (item.configCollections.columns.length > 0) {
              item.configCollections.columns.map(itemN2 => {
                ListColumnName.push(item.options.caption.toUpperCase() + " " + itemN2.options.caption.toUpperCase());
                ListDataField.push(itemN2.options.dataField);
              })
            }

          } else {
            ListColumnName.push(item.options.caption.toUpperCase());
            ListDataField.push(item.options.dataField);
          }

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
        CompaniaMandante: isNotEmpty(CompaniaMandante) ? CompaniaMandante : "",
        EstadoAprobacion: isNotEmpty(EstadoAprobacion) ? EstadoAprobacion : "",
        FechaInicio: isNotEmpty(FechaInicio) ? FechaInicio : "",
        FechaFin: isNotEmpty(FechaFin) ? FechaFin : "",
        IdCompaniaMandante: isNotEmpty(IdCompaniaMandante) ? IdCompaniaMandante : "",
        IdContrato: isNotEmpty(IdContrato) ? IdContrato : "",
        EsSubContratista: isNotEmpty(EsSubContratista) ? EsSubContratista : "",
        EstadoSolicitud: isNotEmpty(EstadoSolicitud) ? EstadoSolicitud : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        Procesado: isNotEmpty(Procesado) ? Procesado : "",
        TituloHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.GESTIÓN_DE_ACREDITACIÓN" }),
        NombreHoja: intl.formatMessage({ id: "ACTION.EXPORT" }) + intl.formatMessage({ id: "CONFIG.MENU.ACREDITACION.GESTIÓN_DE_ACREDITACIÓN" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceSolicitud.exportarExcelActualizacionPersona(params).then(response => {
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
  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdCompaniaContratista',
      'IdSolicitud',
      'Documento',
      'NombreCompleto',
      'EstadoAprobacion',
      'IdCompaniaMandante',
      'IdContrato',
      'EsSubContratista',
      'EstadoSolicitud',
      'IdUnidadOrganizativa',
      'UnidadesOrganizativas',
      'Personas',
      'Procesado',
      'FechaInicio',
      'FechaFin'
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
            label={{ text: intl.formatMessage({ id: "ACCREDITATION.MANAGEMENT.APPLICATIONSTATUS" }) }}
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
            dataField="CompaniaMandante"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CLIENTCOMPANY" }) }}
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
            dataField="CompaniaContratista"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACTORCOMPANY" }), }}
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
                    disabled: false,
                    onClick: () => {
                      setisVisiblePopUpCompaniaContratista(true);
                    },
                  },
                },
              ],
            }}
          />

          <Item
            dataField="IdContrato"
            colSpan={1}
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CONTRACT" }) }}
            isRequired={false}
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
                  onClick: (evt) => {
                    setPopupVisibleContrato(true);
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
            label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSONS" }) }}
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
              text: intl.formatMessage({ id: "ACCREDITATION.REQUEST.START.DATE" }),
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="date"
            editorOptions={{
              inputAttr: { style: "text-transform: uppercase" },
              displayFormat: "dd/MM/yyyy",
              onValueChanged: () => getInstance().filter()
            }}
          />

          <Item
            dataField="FechaFin"
            label={{
              text: intl.formatMessage({ id: "ACCREDITATION.REQUEST.END.DATE" }),
            }}
            isRequired={true}
            editorType="dxDateBox"
            dataType="date"
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
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowEnabled={true}
          focusedRowKey={focusedRowKey}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
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
            width={"8%"}
          />
          <Column dataField="CompaniaContratista"
            caption={intl.formatMessage({ id: "ADMINISTRATION.POSITION.CONTRACTOR" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"15%"}
            alignment={"center"}
          />
          <Column
            dataField="FechaSolicitud"
            caption={intl.formatMessage({ id: "ADMINISTRATION.REQUEST.DATE" })}
            dataType="date"
            format="dd/MM/yyyy hh:mm"
            alignment={"center"}
            allowHeaderFiltering={false}
            allowFiltering={false}
          />

          <Column
            dataField="DatoEvaluar"
            caption={intl.formatMessage({ id: "ACCESS.REQUIREMENT" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            alignment={"center"}
          />
          <Column dataField="Documento"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            allowHeaderFiltering={false}
            width={"10%"}
            alignment={"center"}
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"20%"}
          />

          <Column caption={intl.formatMessage({ id: "COMMON.ENDDATE" })} alignment={"center"} >
            <Column caption={intl.formatMessage({ id: "ACREDITATION.PREVIOUS" })} dataField="FechaFinalAnterior" width={"10%"} alignment={"center"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} dataType="date" format="dd/MM/yyyy" />
            <Column caption={intl.formatMessage({ id: "ACREDITATION.NEW" })} dataField="FechaFinNuevo" width={"10%"} alignment={"center"} allowSorting={false} allowFiltering={false} allowHeaderFiltering={false} dataType="date" format="dd/MM/yyyy" />
          </Column>


          <Column
            dataField="EstadoAprobacion"
            caption={intl.formatMessage({ id: "COMMON.STATE" })}
            width={"103px"}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            alignment={"center"}
            cellRender={cellEstadoRender}
          />

          <Column type="buttons" width={"5%"}>
            <ColumnButton
              icon="doc"
              hint={intl.formatMessage({ id: "ACCREDITATION.REQUEST" })}
              onClick={abrirSolicitudDetalle}
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
          uniqueId={props.uniqueId}
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

        {/*******>POPUP DE COMPANIAS>******** */}
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"administracionCompaniaBuscar"}
          isContratista={"N"}
        />

        <AdministracionCompaniaBuscar
          selectData={selectCompaniaContratista}
          showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaContratista, setisVisiblePopUp: setisVisiblePopUpCompaniaContratista }}
          cancelarEdicion={() => setisVisiblePopUpCompaniaContratista(false)}
          uniqueId={"administracionCompaniaContratistaBuscar"}
          isContratista={"S"}

        />

        {/*******>POPUP DE UNIDAD ORGA.>******** */}
        <AdministracionUnidadOrganizativaBuscar
          selectData={selectUnidadOrganizativa}
          showPopup={{ isVisiblePopUp: popupVisibleUnidad, setisVisiblePopUp: setPopupVisibleUnidad }}
          cancelarEdicion={() => setPopupVisibleUnidad(false)}
          selectionMode={"multiple"}
          showCheckBoxesModes={"normal"}
        />

        {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
        <AdministracionPosicionBuscar
          selectData={selectPosicion}
          showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
          cancelarEdicion={() => setPopupVisiblePosicion(false)}
          uniqueId={"posionesBuscarPersonaList"}

        />

        <PersonaTextAreaPopup
          isVisiblePopupDetalle={popupVisiblePersonas}
          setIsVisiblePopupDetalle={setPopupVisiblePersonas}
          obtenerNumeroDocumento={selectPersonas}
        />

        {/*******>POPUP DE CONTRATO>****************************** */}
        <AdministracionContratoBuscar
          selectData={agregarContrato}
          showPopup={{ isVisiblePopUp: popupVisibleContrato, setisVisiblePopUp: setPopupVisibleContrato }}
          cancelar={() => setPopupVisibleContrato(false)}
        />



      </PortletBody>
    </>
  );
};
ActualizacionPersonaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
ActualizacionPersonaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'actualizacionPersonaList',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(ActualizacionPersonaListPage));
