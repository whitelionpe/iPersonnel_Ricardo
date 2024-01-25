import React, { Fragment, useEffect, useState, useRef } from 'react';
import { injectIntl } from "react-intl";
import { DataGrid, Column, Summary, TotalItem } from "devextreme-react/data-grid";

import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import PropTypes from 'prop-types';
import { forceLoadTypes } from "../../../../../partials/components/CustomDataGrid/CustomDataGridHelper";
import { isNotEmpty } from "../../../../../../_metronic";
import { rpt_001_EquipoAsignado as loadUrl, serviceEquipoAsignado } from '../../../../../api/sistema/equipoAsignado.api';
import './ConsumoComedoresPage.css';
import { initialFilter } from "./EquipoAsignadoIndexPage";
import CustomDataGrid from "../../../../../partials/components/CustomDataGrid";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import AdministracionZonaBuscar from "../../../../../partials/components/AdministracionZonaBuscar";
import AdministracionDivisionBuscar from "../../../../../partials/components/AdministracionDivisionBuscar";


const EquipoAsignadoListPage = (props) => {

  const { intl, setDataGridRef, setLoading } = props;
  const classesEncabezado = useStylesEncabezado();
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const [customDataGridIsBusy, setCustomDataGridIsBusy] = useState(false);

  const [popupVisibleZona, setPopupVisibleZona] = useState(false);
  const [isVisiblePopUpDivision, setisVisiblePopUpDivision] = useState(false);

  const [filterData, setFilterData] = useState({
    ...initialFilter,
    IdCliente
  });
  // PAGINATION
  const [ifThereAreNoChangesLoadFromStorage, setIfThereAreNoChangesLoadFromStorages] = useState(true);
  const resetLoadOptions = props.resetLoadOptions;
  let dataGridRef = React.useRef();



  /* const selectZona = (dataPopup) => {
    //const { IdZona } = data;
    var zonas = dataPopup.map(x => (x.IdZona)).join(',');
    props.dataRowEditNew.IdZona = zonas;

    let cadenaMostrar = dataPopup.map(x => (x.Zona)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    //props.dataRowEditNew.Zona = cadenaMostrar
    props.dataSource.loadDataWithFilter({ data: { Zona: cadenaMostrar } })
    setPopupVisibleZona(false);
  } */


  const selectZona = (data) => {
    const { IdZona, Zona } = data;
    props.dataRowEditNew.IdZona = IdZona
    props.dataRowEditNew.Zona = Zona

    props.dataSource.loadDataWithFilter({ data: { IdZona, Zona } })
    setPopupVisibleZona(false);
  }

  /*** POPUP DIVISIONES ***/
  const selectDataDivisiones = (data) => {

    const { IdCliente, Division, IdDivision } = data;
    props.dataRowEditNew.IdCliente = IdCliente;
    props.dataRowEditNew.IdDivision = IdDivision;
    props.dataRowEditNew.Division = `${IdDivision} - ${Division}`;

    props.dataSource.loadDataWithFilter({ data: { IdDivision, Division } });
    setisVisiblePopUpDivision(false);
  }


  const [filterExport, setfilterExport] = useState({
    ...initialFilter,
    IdCliente
    // IdDivision: isNotEmpty(IdDivision) ? IdDivision : ""
  });



  const exportReport = async () => {
    let result = JSON.parse(localStorage.getItem('vcg:' + props.uniqueId + ':loadOptions'));
    if (!isNotEmpty(result)) return;
    let filterExport = {
      IdCliente
    }
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
    const { IdCliente, IdDivision, IdModulo, IdZona } = filterExport

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
      //var Order = NombreCompleto();

      let params = {
        IdCliente: IdCliente,
        //IdDivision: IdDivision,
        IdDivision: isNotEmpty(IdDivision) ? IdDivision : "",
        IdModulo: isNotEmpty(IdModulo) ? IdModulo : "",
        IdZona: isNotEmpty(IdZona) ? IdZona : "",
        TituloHoja: intl.formatMessage({ id: "COMMON.REPORT" }) + ' ' + intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.EQUIPOS_DISPONIBLE" }),
        NombreHoja: intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.EQUIPOS_DISPONIBLE" }),
        ArrayColumnHeader,
        ArrayColumnId,
        OrderField: selector
      };
      setLoading(true);
      await serviceEquipoAsignado.exportarExcel(params).then(response => {
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

  const obtenerCampoActivo = rowData => { return rowData.Estado === "S"; };

  useEffect(() => {
    if (ifThereAreNoChangesLoadFromStorage) setIfThereAreNoChangesLoadFromStorages(false);
  }, [ifThereAreNoChangesLoadFromStorage])
  useEffect(() => {
    if (props.refreshData) {
      props.refresh();
      props.setRefreshData(false);
    }
  }, [props.refreshData]);



  //>..Definir Filtro para customerDataGrid
  const keysToGenerateFilter =
    [
      'IdCliente',
      'IdDivision',
      'IdModulo',
      'IdZona'
    ];


  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem>
        <GroupItem itemType="group" colCount={3} colSpan={1}>

          <Item dataField="IdZona" visible={false} />

          <Item
            colSpan={1} dataField="Division" label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
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
                    disabled: !props.dataRowEditNew.esNuevoRegistro,
                    onClick: (evt) => {
                      setisVisiblePopUpDivision(true);
                    },
                  },
                },
              ],
            }}
          />

          <Item
            dataField="Zona"
            label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION.ZONE" }) }}
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
                    setPopupVisibleZona(true);
                  },
                }
              }]
            }}
          />


          <Item
            dataField="IdModulo"
            label={{ text: intl.formatMessage({ id: "SECURITY.PROFILE.MENU.MODULE" }) }}
            editorType="dxSelectBox"
            editorOptions={{
              items: props.moduloData,
              valueExpr: "IdModulo",
              displayExpr: "Modulo",
              readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
              onValueChanged: () => getInstance().filter(),
              showClearButton: true,
              searchEnabled: true,
            }}
          />

        </GroupItem>


      </GroupItem>
    );
  }




  const renderDataGrid = ({ gridRef, dataSource }) => {
    dataGridRef = gridRef;
    dataGridRef = gridRef;
    return (
      <>
        <DataGrid
          dataSource={dataSource}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          ref={gridRef}
        >
          <Column dataField="Asignado"
            caption={intl.formatMessage({ id: "SYSTEM.TEAM.ASSIGNED" })}
            allowHeaderFiltering={false}
            width={"5%"}
            alignment={"center"}
          />


          <Column
            dataField="Division"
            caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            alignment={"left"}
            width={"15%"}

          />
          <Column dataField="Zona"
            caption={intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION.ZONE" })}
            allowHeaderFiltering={false}
            width={"10%"}
          />

          <Column dataField="Modulo"
            caption={intl.formatMessage({ id: "SYSTEM.MODULE" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"10%"}
          />
          <Column dataField="TipoEquipo"
            caption={intl.formatMessage({ id: "SYSTEM.TEAM.TEAMTYPE" })}
            allowHeaderFiltering={false}
            allowSorting={true}
            width={"10%"}
          //alignment={"center"}
          />
          <Column
            dataField="Modelo"
            caption={intl.formatMessage({ id: "SYSTEM.TEAM.MODEL" })}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={true}
            width={"20%"}
          />

          <Column dataField="Equipo"
            caption={intl.formatMessage({ id: "ACCESS.GROUP.DEVICE" })}
            allowHeaderFiltering={false}
            width={"15%"}
          />

          <Column
            dataField="Serie"
            caption={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.SERIE" })}
            allowSorting={true}
            allowHeaderFiltering={false}
            width={"8%"}

          />
          <Column dataField="IP"
            caption={intl.formatMessage({ id: "SYSTEM.TEAM.IP" })}
            allowHeaderFiltering={false}
            width={"8%"}
            alignment={"center"}
          />

          <Column dataField="Estado"
            caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
            calculateCellValue={obtenerCampoActivo}
            allowSorting={true}
            allowFiltering={false}
            allowHeaderFiltering={false}
            width={"7%"}
          />



        </DataGrid>
      </>
    );
  }

  return (
    <>

      <a id="iddescarga" className="" ></a>

      <HeaderInformation
        visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  {/* <Button
                    icon="fa fa-search"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                    //onClick={() => setIsActiveFilters(!isActiveFilters)}
                    disabled={customDataGridIsBusy}
                  /> */}
                  &nbsp;
                  <Button
                    icon="refresh"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                    disabled={customDataGridIsBusy}
                    onClick={resetLoadOptions} />
                  &nbsp;
                  <Button
                    icon="fa fa-file-excel"
                    type="default"
                    disabled={customDataGridIsBusy}
                    onClick={exportReport}
                  />

                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />
        } />



      <PortletBody>
        <CustomDataGrid
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
          initialLoadOptions={{ currentPage: 1, pageSize: 20, sort: { column: 'Equipo', order: 'asc' } }}
          filterRowSize='sm'
          summaryCountFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0} de {1} `}
          visibleCustomFilter={true}
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

        {popupVisibleZona && (
          <AdministracionZonaBuscar
            selectData={selectZona}
            showPopup={{ isVisiblePopUp: popupVisibleZona, setisVisiblePopUp: setPopupVisibleZona }}
            cancelarEdicion={() => setPopupVisibleZona(false)}
            //selectionMode={"multiple"}
            //showCheckBoxesModes={"normal"}
          />
        )}
        {/*******>POPUP DIVISIONES>******** */}
        {isVisiblePopUpDivision && (
          <AdministracionDivisionBuscar
            selectData={selectDataDivisiones}
            showPopup={{ isVisiblePopUp: isVisiblePopUpDivision, setisVisiblePopUp: setisVisiblePopUpDivision }}
            cancelarEdicion={() => setisVisiblePopUpDivision(false)}
            verZona={'N'}
          />
        )}

      </PortletBody>
    </>
  );
};


EquipoAsignadoListPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  showHeaderInformation: PropTypes.bool,
  uniqueId: PropTypes.string

}
EquipoAsignadoListPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  showHeaderInformation: false,
  uniqueId: 'equiposAsignadoList'
}

export default injectIntl(WithLoandingPanel(EquipoAsignadoListPage));
