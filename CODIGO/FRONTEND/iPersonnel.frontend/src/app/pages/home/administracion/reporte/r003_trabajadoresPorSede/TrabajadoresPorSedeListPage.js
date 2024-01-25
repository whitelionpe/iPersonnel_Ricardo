import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import Form, { Item, GroupItem, EmptyItem } from "devextreme-react/form";
import { DataGrid, Column, FilterRow, HeaderFilter, FilterPanel } from "devextreme-react/data-grid";
import { DoubleLinePersona as DoubleLineLabel, PersonaCondicionLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";

import { isNotEmpty, listarEstadoSimple, listarCondicion } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

import { storeListarR003 as loadUrl, serviceReporte } from "../../../../../api/administracion/reporte.api";
import { initialFilter } from "./TrabajadoresPorSedeIndexPage";
import { obtenerTodos as obtenerTodosTipoPosicion } from "../../../../../api/administracion/tipoPosicion.api";

import AdministracionUnidadOrganizativaBuscar from "../../../../../partials/components/AdministracionUnidadOrganizativaBuscar";
import AdministracionPosicionBuscar from "../../../../../partials/components/AdministracionPosicionBuscar";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import PersonaTextAreaPopup from '../../../../../partials/components/PersonaTextAreaPopup/PersonaTextAreaPopup';
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";
import CustomDataGridDynamic from "../../../../../partials/components/CustomDataGridDynamic";
import DataGridDynamic from "../../../../../partials/components/DataGridDynamic/DataGridDynamic";
import { obtenerTodos as obtenerTodosCaracteristica } from "../../../../../api/administracion/caracteristica.api";
import { obtenerTodos as obtenerTodosCaracteristicaDetalle } from "../../../../../api/administracion/caracteristicaDetalle.api";



const PersonaListPage = props => {
  const { intl, focusedRowKey, setLoading } = props;
  const { IdCliente, IdPerfil, IdDivision, Division } = useSelector(state => state.perfil.perfilActual);
  //const IdDivisionPerfil = useSelector(state => state.perfil.perfilActual.IdDivision);

  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [popupVisiblePosicion, setPopupVisiblePosicion] = useState(false);
  const [popupVisibleUnidad, setPopupVisibleUnidad] = useState(false);
  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

  const [tipoPosiciones, setTipoPosiciones] = useState([]);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [condicion, setCondicion] = useState([]);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);

  const IdDivisionPerfil = IdDivision;
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [caracteristicaDetalles, setCaracteristicaDetalle] = useState([]);

  //Variables de CustomerDataGrid
  const [isActiveFilters, setIsActiveFilters] = useState(true);
  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);
  const [filterData, setFilterData] = useState({
    ...initialFilter, IdCliente, IdDivision, Division,
    IdPerfil,
    IdDivisionPerfil

  });

  // const [dataGridProperties, setDataGridProperties] = useState({});
  // PAGINATION
  // ------------------------------
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();

  //:::::::::::::::::::::::::::::::::::::::::::::-funciones-:::::::::::::::::::::::::::::::::

  async function cargarCombos() {

    let estadoSimples = listarEstadoSimple();
    let condicion = listarCondicion();
    let caracteristica = await obtenerTodosCaracteristica({ IdCliente, IdEntidad: 'P' });
    setCaracteristicas(caracteristica);

    await obtenerTodosTipoPosicion({ IdCliente }).then(tipoPosiciones => {
      setTipoPosiciones(tipoPosiciones);
    });
    setEstadoSimple(estadoSimples);
    setCondicion(condicion);
  }

  const obtenerCampoActivo = rowData => { return rowData.Estado === "S"; };
  const obtenerCampoDiscapacidad = rowData => rowData.Discapaciadad === "S" ? 'SI' : 'NO';

  const selectCompania = dataPopup => {

    const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdCompania, Compania } })
    setPopupVisibleCompania(false);
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
    if (isNotEmpty(data)) {
      let strPersonas = data.split('|').join(',');
      props.dataSource.loadDataWithFilter({ data: { Personas: strPersonas } });
    }

  }

  /*** POPUP DIVISIONES ***/
  const selectDataDivisiones = (data) => {
    const { Division, IdDivision } = data;
    //const { IdCompania, Compania } = dataPopup[0];
    props.dataSource.loadDataWithFilter({ data: { IdDivision, Division } })
    setisVisiblePopUpDivision(false);
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  };


  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('i2p:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    let filterExport = {
      IdCliente,
      IdPerfil,
      IdDivisionPerfil,
      IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
    };
    // Recorremos los filtros usados:
    for (let i = 0; i < result.filter.length; i++) {
      let currentValue = result.filter[i];

      // Filtramos solo los Array
      if (currentValue instanceof Array) {

        // Recorremos cada uno de los filtros en el array
        for (let j = 0; j < currentValue.length; j++) {

          //Llenamos filterData para decompilarlo en el siguente punto.
          filterExport[currentValue[0]] = currentValue[2];
        }
      }
    }
    //obtener orden para exportar
    const { selector } = result.sort[0];

    // Decompilando filterData
    const { IdDivision, IdCompania, Condicion, Personas, IdUnidadOrganizativa, IdEstadoCivil, IdPosicion, Posicion,
      IdTipoPosicion, IdUbigeoResidencia, IdPersona, NombreCompleto, IdTipoDocumento, Documento, Sexo, Edad, UbigeoNacimiento, Activo,
      IdPerfil, IdDivisionPerfil, UnidadesOrganizativas, IdCaracteristica, IdCaracteristicaDetalle } = filterExport;

    if (dataGridRef.current.props.dataSource._items.length > 0) {

      let ListColumnName = [];
      let ListDataField = [];

      dataGridRef.current._optionsManager._currentConfig.configCollections.columns.map(item => {
        if ((item.options.visible === undefined || item.options.visible === true) && item.options.type != 'buttons') {
          ListColumnName.push(item.options.caption.toUpperCase());
          ListDataField.push(item.options.dataField);
        }
      })
      //Obtener dataGrid titulo columnas + idColumnas para exportar de forma dinamica.
      var ArrayColumnHeader = ListColumnName.join('|');
      var ArrayColumnId = ListDataField.join('|');

      let params = {
        IdCliente: IdCliente,
        IdDivision: IdDivision,
        IdCompania: isNotEmpty(IdCompania) ? IdCompania : "",
        Condicion: isNotEmpty(Condicion) ? Condicion : "",
        IdUnidadOrganizativa: isNotEmpty(IdUnidadOrganizativa) ? IdUnidadOrganizativa : "",
        Personas: isNotEmpty(Personas) ? Personas : "",
        IdEstadoCivil: isNotEmpty(IdEstadoCivil) ? IdEstadoCivil : "",
        IdPosicion: isNotEmpty(IdPosicion) ? IdPosicion : "",
        Posicion: isNotEmpty(Posicion) ? Posicion : "",
        IdTipoPosicion: isNotEmpty(IdTipoPosicion) ? IdTipoPosicion : "",
        IdUbigeoResidencia: isNotEmpty(IdUbigeoResidencia) ? IdUbigeoResidencia : "",
        IdPersona: isNotEmpty(IdPersona) ? IdPersona : "",
        NombreCompleto: isNotEmpty(NombreCompleto) ? NombreCompleto : "",
        IdTipoDocumento: isNotEmpty(IdTipoDocumento) ? IdTipoDocumento : "",
        Documento: isNotEmpty(Documento) ? Documento : "",
        Sexo: isNotEmpty(Sexo) ? Sexo : "",
        Edad: isNotEmpty(Edad) ? Edad : "",
        UbigeoNacimiento: isNotEmpty(UbigeoNacimiento) ? UbigeoNacimiento : "",
        Activo: isNotEmpty(Activo) ? Activo : "",
        IdPerfil: isNotEmpty(IdPerfil) ? IdPerfil : "",
        IdDivisionPerfil: isNotEmpty(IdDivisionPerfil) ? IdDivisionPerfil : "",
        UnidadesOrganizativas: isNotEmpty(UnidadesOrganizativas) ? UnidadesOrganizativas : "",
        IdCaracteristica: isNotEmpty(IdCaracteristica) ? IdCaracteristica : "",
        IdCaracteristicaDetalle: isNotEmpty(IdCaracteristicaDetalle) ? IdCaracteristicaDetalle : "",
        TituloHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.TRABAJADORES_POR_SEDE" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.ADMINISTRACION.TRABAJADORES_POR_SEDE" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceReporte.exportarExcelR003(params).then(response => {
        //result = response;      
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

  useEffect(() => {
    if (IdDivision) {
      setTimeout(() => {
        props.dataSource.loadDataWithFilter({ data: { IdDivision } });
      }, 500)
    }
  }, [IdDivision]);

  const getCaracteristicaDetalle = async (value) => {
    if (value) {
      setLoading(true);
      let caracteristicaDetalle = await obtenerTodosCaracteristicaDetalle({ IdCliente, IdCaracteristica: value })
      setCaracteristicaDetalle(caracteristicaDetalle);
      setLoading(false);
    }
  }
  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter = ['IdCliente', 'IdDivision', 'IdCompania', 'Condicion', 'Personas', 'IdUnidadOrganizativa', 'UnidadOrganizativa', 'IdPosicion', 'Posicion', 'IdTipoPosicion',
    'IdPersona', 'NombreCompleto', 'TipoDocumento', 'Documento', 'Sexo', 'Edad', 'UbigeoNacimiento', 'Activo'
    , 'IdPerfil', 'IdDivisionPerfil', 'UnidadesOrganizativas', 'IdCaracteristica', 'IdCaracteristicaDetalle'];

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      isActiveFilters && (
        <GroupItem colSpan={2} colCount={2}>
          {/* cssClass="tituloGrupo" caption={intl.formatMessage({id: "ACCREDITATION.PEOPLE.GENERALDATA"})} */}
          <GroupItem itemType="group" >
            <Item
              dataField="Compania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" }) }}
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
              dataField="Division"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
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
                      onClick: (evt) => {
                        setisVisiblePopUpDivision(true);
                      },
                    },
                  },
                ],
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
          </GroupItem>

          {/* cssClass="tituloGrupo" caption={intl.formatMessage({id: "ADMINISTRATION.PERSON.LABORDATA"})} */}
          <GroupItem itemType="group" colSpan={2} colCount={2} >
            <Item
              colSpan={2}
              dataField="IdTipoPosicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITIONTYPE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: tipoPosiciones,
                valueExpr: "IdTipoPosicion",
                displayExpr: "TipoPosicion",
                searchEnabled: true,
                onValueChanged: async () => await getInstance().filter(),
              }}
            />
            <Item
              colSpan={2}
              dataField="Posicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.POSITION" }) }}
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
                      setPopupVisiblePosicion(true);
                    },
                  }
                }]
              }}
            />
            <Item dataField="Condicion"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: condicion,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                onValueChanged: async () => await getInstance().filter(),
              }} />
            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
              editorType="dxSelectBox"
              editorOptions={{
                items: estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                showClearButton: true,
                onValueChanged: async () => await getInstance().filter(),
              }}
            />
          </GroupItem>
          <Item
            dataField="IdCaracteristica"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CHARACTERISTIC" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: caracteristicas,
              valueExpr: "IdCaracteristica",
              displayExpr: "Caracteristica",
              searchEnabled: true,
              readOnly: false,
              onValueChanged: (e => getCaracteristicaDetalle(e.value))
            }}
          >
          </Item>
          <Item
            dataField="IdCaracteristicaDetalle"
            label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.CHARACTERISTICDETAIL" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: caracteristicaDetalles,
              valueExpr: "IdCaracteristicaDetalle",
              displayExpr: "CaracteristicaDetalle",
              searchEnabled: true,
              readOnly: false,
              onValueChanged: async () => await getInstance().filter(),
            }}
          >
          </Item>

          <Item
            dataField="Personas"
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
            }} />
          <EmptyItem />
        </GroupItem>
      )
    )
  };


  const renderDataGrid = ({ gridRef, dataSource, dynamicColumns }) => {
    // console.log("renderDataGrid", { dataSource, dynamicColumns });
    if (dataSource._storeLoadOptions.filter !== undefined) {
      if (props.totalRowIndex === 0) {
        props.setTotalRowIndex(dataSource._totalCount);
      }
      if (dataSource._totalCount != props.totalRowIndex) {
        if (dataSource._totalCount != -1) {
          props.setFocusedRowKey();
          props.setTotalRowIndex(dataSource._totalCount);
        }
      }
    }
    dataGridRef = gridRef;
    return (
      <DataGridDynamic
        id="dg_r003trabajadoresxsede"
        intl={intl}
        dataSource={dataSource}
        dynamicColumns={dynamicColumns}
        keyExpr="RowIndex"
        dataGridRef={gridRef}
        events={{
          focusedRowKey,
          onFocusedRowChanged: seleccionarRegistro,
          onCellPrepared: onCellPrepared
        }}
      // keyExpr="RowIndex"
      // showBorders={true}
      // remoteOperations={true}
      // onCellPrepared={onCellPrepared}
      // onFocusedRowChanged={seleccionarRegistro}
      // focusedRowEnabled={true}
      // focusedRowKey={focusedRowKey}
      // repaintChangesOnly={true}
      // allowColumnReordering={true}
      // allowColumnResizing={true}
      // columnAutoWidth={true}
      // scrolling={{ showScrollbar: 'always' }}
      // className="tablaScrollHorizontal"
      >
        <FilterRow visible={true} showOperationChooser={false} />
        <HeaderFilter visible={false} />
        <FilterPanel visible={false} />
        <Column
          dataField="RowIndex"
          caption="#"
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"35px"}
          alignment={"center"} />
        <Column
          dataField="Condicion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONDITION" })}
          allowSorting={true}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"100px"}
          cellRender={PersonaCondicionLabel}
        />
        <Column dataField="IdPersona"
          caption={intl.formatMessage({ id: "COMMON.CODE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"70px"}
          alignment={"center"} />
        <Column
          dataField="NombreCompleto"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
          cellRender={DoubleLineLabel}
          allowSorting={true}
          allowHeaderFiltering={false}
          width={"250px"}
        />
        <Column
          dataField="Compania"
          caption={intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"250px"}
        />
        <Column
          dataField="Direccion"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ADDRESS" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"300px"}
        />
        <Column
          dataField="UnidadOrganizativa"
          caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"250px"}
        />
        <Column
          dataField="Posicion"
          caption={intl.formatMessage({ id: "ACCREDITATION.COMPANY.DATA.POSITION" })}
          allowSorting={false}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"250px"}
        />
        <Column
          dataField="FechaIngreso"
          caption={intl.formatMessage({ id: "COMMON.STARTDATE.SHORT" })}
          dataType="date"
          format="dd/MM/yyyy"
          alignment={"center"}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />
        <Column
          dataField="FechaFinContrato"
          caption={intl.formatMessage({ id: "COMMON.ENDDATE.SHORT" })}
          dataType="date"
          format="dd/MM/yyyy"
          alignment={"center"}
          allowHeaderFiltering={false}
          allowFiltering={false}
          width={"100px"}
        />

        <Column
          dataField="TipoDocumento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE.DOCU" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          alignment={"center"}
          width={"50px"}
        >
        </Column>
        <Column dataField="Documento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
          allowHeaderFiltering={false}
          width={"100px"}
          alignment={"center"}
        />
        <Column
          dataField="Sexo"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" })}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={true}
          alignment={"center"}
          width={"100px"}
        >
        </Column>

        <Column
          dataField="FechaNacimiento"
          dataType="date"
          format="dd/MM/yyyy"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.BIRTHDAY" })}
          allowHeaderFiltering={false}
          allowSorting={false}
          allowFiltering={false}
          width={"120px"}
          alignment={"center"}
        />

        <Column
          dataField="Edad"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" })}
          allowHeaderFiltering={false}
          allowSorting={true}
          width={"70px"}
          alignment={"center"}
        />
        <Column
          dataField="UbigeoNacimiento"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRY.OF.BIRTH" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"80px"}
        />
        <Column
          dataField="TipoSangre"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.BLOOD.TYPE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"100px"}
        />
        <Column
          dataField="Alergia"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ALLERGY" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"150px"}
        />
        <Column
          dataField="IdLicenciaConducir"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DRIVING.CATEGORY" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"150px"}
        />
        <Column
          dataField="NumeroLicenciaConducir"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.LICENSE.NUMBER" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"120px"}
        />
        <Column
          dataField="Discapacidad"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DISABILITY_TABLE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          calculateCellValue={obtenerCampoDiscapacidad}
          width={"150px"}
        />
        <Column
          dataField="EstadoCivil"
          caption={intl.formatMessage({ id: "SYSTEM.CIVILSTATUS" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"120px"}
        />
        <Column
          dataField="NumeroHijos"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.NUMBERCHILDREN" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"60px"}
        />
        <Column
          dataField="TelefonoMovil"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MOBILE.PHONE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"170px"}
        />
        <Column
          dataField="TelefonoFijo"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MOBILE.LANDLINE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"170px"}
        />
        <Column
          dataField="Email"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MAIL" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"170px"}
        />
        <Column
          dataField="EmergenciaNombre"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.EMERGENCYNAME" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"170px"}
        />
        <Column
          dataField="EmergenciaTelefono"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.EMERGENCYPHONE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"170px"}
        />
        <Column
          dataField="UbigeoNac"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.UBIGEO.BIRTH" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"250px"}
        />
        <Column
          dataField="UbigeoResidencia"
          caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.UBIGEO.RESIDENCE" })}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
          alignment={"center"}
          width={"250px"}
        />

        <Column dataField="Estado"
          caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
          calculateCellValue={obtenerCampoActivo}
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          width={"70px"}
        />


      </DataGridDynamic>
    );
  }

  return (
    <>
      <a id="iddescarga" className="" ></a>

      <PortletHeader
        title=""
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon={isActiveFilters ? "chevronup" : "chevrondown"}
              type="default"
              hint={isActiveFilters ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={() => setIsActiveFilters(!isActiveFilters)}
              disabled={false}
            />
            {/*   &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              onClick={filtrarOptions}
              disabled={isActiveFilters ? false : true }
            /> */}
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
            />
          </PortletHeaderToolbar>
        }
      />



      <PortletBody>
        <CustomDataGridDynamic
          showLog={false}
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
          keysToGenerateFilter={keysToGenerateFilter}
          filterData={filterData}
          // PAGINATION
          paginationSize='md'
          // EVENTS
          onLoading={() => setCustomDataGridIsBusy(true)}
          onError={() => setCustomDataGridIsBusy(false)}
          onLoaded={() => setCustomDataGridIsBusy(false)}
        />

        {/*******>POPUP DE COMPANIAS>******** */}
        {popupVisibleCompania && (
          <AdministracionCompaniaBuscar
            selectData={selectCompania}
            showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
            cancelarEdicion={() => setPopupVisibleCompania(false)}
            uniqueId={"administracionCompaniaBuscarR003"}
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

        {/*******>POPUP DE UNIDAD ORGA. CON POSICIONES>******** */}
        {popupVisiblePosicion && (
          < AdministracionPosicionBuscar
            selectData={selectPosicion}
            showPopup={{ isVisiblePopUp: popupVisiblePosicion, setisVisiblePopUp: setPopupVisiblePosicion }}
            cancelarEdicion={() => setPopupVisiblePosicion(false)}
            uniqueId={"posionesBuscarPersonaListR003"}
          />
        )}


        {popupVisiblePersonas && (
          <PersonaTextAreaPopup
            isVisiblePopupDetalle={popupVisiblePersonas}
            setIsVisiblePopupDetalle={setPopupVisiblePersonas}
            obtenerNumeroDocumento={selectPersonas}
          // datosReservaDetalle={datosReservaDetalle}
          />
        )}

        {/*******>POPUP DIVISIONES>******** */}
        <AdministracionDivisionBuscar
          selectData={selectDataDivisiones}
          showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
          cancelarEdicion={() => setisVisiblePopUpDivision(false)}
        />

      </PortletBody>
    </>
  );
};
PersonaListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string,
  selected: PropTypes.object,

}
PersonaListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'r003TrabajadoresPorSedesList',
  selected: { IdDivision: "" }
}

export default injectIntl(WithLoandingPanel(PersonaListPage));
