import React, { useEffect, useState } from "react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import CustomDataGrid from "../../../../partials/components/CustomDataGrid/CustomDataGrid";
import {
  CellHorasRender,
  EstadoSolicitudAsistenciaHHEE,
  getStartAndEndOfMonthByDay,
  isNotEmpty,
  reverseTransformData,
  transformData
} from "../../../../../_metronic";
import {
  DataGrid,
  Column,
  Grouping as GroupingGrid,
  Paging as PagingGrid,
  Sorting,
  Button as ColumnButton
} from "devextreme-react/data-grid";
import { forceLoadTypes } from "../../../../partials/components/CustomDataGrid";
import { storeListarConsulta as loadUrl } from "../../../../api/asistencia/solicitudhhee.api";
import { GroupItem, Item } from "devextreme-react/form";

import { servicePlanilla } from "../../../../api/asistencia/planilla.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import AsistenciaPersonaBuscarReporte from "../../../../partials/components/AsistenciaPersonaBuscarReporte";

const SolicitudListPage = ({
  intl,
  IdDivision,
  dataSource,
  isFirstDataLoad,
  refreshData,
  keysToGenerateFilter,
  filterData,
  setCustomDataGridIsBusy,
  customDataGridIsBusy,
  refresh,
  setRefreshData,
  resetLoadOptions,
  setFilterData,
  setLoading,
  visualizarRegistro,
  dataMenu,
  IdCliente,
  companiaData,
  planillas,
  listarPlanilla
}) => {
  const [isActiveFilters, setIsActiveFilters] = useState(false);
  const [
    ifThereAreNoChangesLoadFromStorage,
    setIfThereAreNoChangesLoadFromStorages
  ] = useState(true);

  const { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay();

  const [varIdCompania, setVarIdCompania] = useState(filterData.IdCompania);

  const [popupVisiblePersonas, setPopupVisiblePersonas] = useState(false);

  const eventRefreshGrid = () => {
    // resetLoadOptions();
    let param = {
      FechaInicio,
      FechaFin,
      IdDivision,
      IdContrato: "",
      Asunto: "",
      EstadoSolicitud: "",
      EsSubContratista: ""
    };
    dataSource.loadDataWithFilter({
      data: param
    });
  };

  const getStateRequestStyle = estado => {
    let css = "";
    let text = "";

    switch (estado) {
      case "I":
        css = "estado_item_incompleto";
        text = intl.formatMessage({ id: "COMMON.INCOMPLETE" }).toUpperCase();
        break;
      case "P":
        css = "estado_item_pendiente";
        text = intl.formatMessage({ id: "COMMON.EARRING" }).toUpperCase();
        break;
      case "E":
        css = "estado_item_observado";
        text = intl.formatMessage({ id: "COMMON.INPROGRESS" }).toUpperCase();
        break;
      case "R":
        css = "estado_item_rechazado";
        text = intl.formatMessage({ id: "COMMON.REJECTED" }).toUpperCase();
        break;
      case "A":
        css = "estado_item_aprobado";
        text = intl.formatMessage({ id: "COMMON.APPROVED" }).toUpperCase();
        break;
      default:
        css = "";
        text = "";
        break;
    }

    return { css, text };
  };

  const cellEstadoRender = e => {
    let estado = e.data.Estado;
    if (e.data.Estado.trim() === "") {
      estado = "I";
    }

    let { css, text: estado_txt } = getStateRequestStyle(estado);

    return css === "" ? (
      <div className={"estado_item_general"}>{estado_txt}</div>
    ) : estado === "P" ? (
      <div className={`estado_item_general estado_item_small ${css}`}>
        {estado_txt}
      </div>
    ) : (
      <>
        <div className="align_estado_grid">
          <div className={`estado_item_general estado_item_small ${css}`}>
            {estado_txt}
          </div>
        </div>
      </>
    );
  };

  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) {
      setVarIdCompania(idCompania);
    }
  }

  const renderFormContentCustomFilter = ({ getInstance }) => {
    return (
      <GroupItem itemType="group" colCount={2} colSpan={2}>
        <Item
          dataField="IdCompania"
          label={{
            text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" })
          }}
          editorType="dxSelectBox"
          isRequired={true}
          editorOptions={{
            items: companiaData,
            valueExpr: "IdCompania",
            displayExpr: "Compania",
            //showClearButton: true,
            searchEnabled: true,
            // value: varIdCompania,
            onValueChanged: e => {
              if (isNotEmpty(e.value)) {
                var company = companiaData.filter(
                  x => x.IdCompania === e.value
                );
                getCompanySeleccionada(e.value, company);
                // props.setFocusedRowKey();
                listarPlanilla(e.value);
              }
            }
          }}
        />

        <Item
          dataField="IdPlanilla"
          label={{
            text: intl.formatMessage({
              id: "ASISTENCIA.REPORT.TRABAJADORSINHORARIO.TIPOPLANTILLA"
            })
          }}
          editorType="dxSelectBox"
          editorOptions={{
            items: planillas,
            valueExpr: "IdPlanilla",
            displayExpr: "Planilla",
            searchEnabled: true,
            showClearButton: true
            // onValueChanged: getInstance().filter()
          }}
        />

        <Item
          dataField="FechaInicio"
          label={{
            text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" })
          }}
          editorType="dxDateBox"
          dataType="datetime"
          editorOptions={{
            inputAttr: { style: "text-transform: uppercase" },
            displayFormat: "dd/MM/yyyy",
            onValueChanged: e => {
              getInstance().filter();
              setFilterData(prev => ({
                ...prev,
                FechaInicio: isNotEmpty(e.value) ? e.value : ""
              }));
            }
          }}
        />
        <Item
          dataField="FechaFin"
          label={{
            text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" })
          }}
          isRequired={true}
          editorType="dxDateBox"
          dataType="datetime"
          editorOptions={{
            inputAttr: { style: "text-transform: uppercase" },
            displayFormat: "dd/MM/yyyy",
            onValueChanged: e => {
              getInstance().filter();
              setFilterData(prev => ({
                ...prev,
                FechaFin: isNotEmpty(e.value) ? e.value : ""
              }));
            }
          }}
        />

        <Item
          dataField="ListaPersonaView"
          label={{
            text: intl.formatMessage({
              id: "ADMINISTRATION.PERSON.REGIME.PERSON"
            })
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
                  disabled: false,
                  onClick: () => {
                    setPopupVisiblePersonas(true);
                  }
                }
              }
            ]
          }}
        />

        <Item
          label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
          dataField="Estado"
          editorType="dxSelectBox"
          editorOptions={{
            items: EstadoSolicitudAsistenciaHHEE,
            valueExpr: "Valor",
            displayExpr: "Descripcion",
            searchEnabled: true,
            placeholder: intl.formatMessage({ id: "COMMON.SELECT" }),
            showClearButton: true,
            inputAttr: { style: "text-transform: uppercase" },
            onValueChanged: () => {
              // //console.log("5.- ---");
              getInstance().filter();
            }
          }}
          isRequired={true}
        />
      </GroupItem>
    );
  };

  const eventClickVer = async evt => {
    console.log("visualizarRegistro", { evt });
    evt.cancel = true;
    visualizarRegistro(evt.row.data);
  };

  const seleccionarRegistroDblClick = evt => {
    if (isNotEmpty(evt.data)) {
      visualizarRegistro(evt.data);
    }
  };

  async function agregarPersonaAsistencia(tmppersonas) {
    console.log("agregarPersonaAsistencia", { tmppersonas });
    // filterData.ListaPersona = personas.map(x => ({
    //   Documento: x.Documento,
    //   NombreCompleto: x.NombreCompleto
    // }));
    let cadenaMostrar = tmppersonas.map(x => x.NombreCompleto).join(", ");
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + "...";
    }
    let personas = tmppersonas.map(x => x.Documento).join("|");
    filterData.ListaPersonaView = cadenaMostrar;
    filterData.Personas = personas;
    // setFilterData(prev => ({
    //   ...prev,
    //   ListaPersonaView: cadenaMostrar,
    //   Personas: personas.map(x => x.Documento).join("|")
    // }));
    setPopupVisiblePersonas(false);
    dataSource.loadDataWithFilter({
      data: { Personas: personas, ListaPersonaView: cadenaMostrar }
    });
  }

  const renderDataGrid = ({ gridRef, dataSource }) => {
    console.log("renderDataGrid", { gridRef, dataSource });
    return (
      <DataGrid
        dataSource={dataSource}
        ref={gridRef}
        columnAutoWidth={true}
        focusedRowEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        onRowDblClick={seleccionarRegistroDblClick}
      >
        <Sorting mode="multiple" />
        {/* <GroupPanel visible={true} /> */}
        {/* <SearchPanel visible={true} /> */}
        <GroupingGrid autoExpandAll={false} />
        <PagingGrid defaultPageSize={15} />

        <Column
          caption={intl.formatMessage({
            id: "SYSTEM.CUSTOMER.DOCUMENT"
          })}
          dataField="Documento"
          width={"10%"}
        />

        <Column
          caption={intl.formatMessage({
            id: "ADMINISTRATION.PERSON.FULLNAME"
          })}
          dataField="Nombres"
          width={"20%"}
        />

        <Column
          caption={intl.formatMessage({
            id: "CONFIG.MENU.ACCESO.COMPAÑIA"
          })}
          dataField="Compania"
          width={"20%"}
        />

        <Column
          caption={intl.formatMessage({
            id: "ACCREDITATION.APPLICANT.LIST.FEC.REQUEST"
          })}
          dataField="FechaSolicitud"
          width={"8%"}
          alignment={"left"}
          dataType="date"
          format="dd/MM/yyyy"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          caption={intl.formatMessage({
            id: "ASSISTANCE.SCHEDULE.DAY.START"
          })}
          dataField="FechaInicio"
          width={"8%"}
          alignment={"left"}
          dataType="date"
          format="dd/MM/yyyy"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />

        <Column
          caption={intl.formatMessage({
            id: "ASSISTANCE.SCHEDULE.DAY.END"
          })}
          dataField="FechaFin"
          width={"8%"}
          alignment={"left"}
          dataType="date"
          format="dd/MM/yyyy"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />
        <Column
          caption={intl.formatMessage({
            id: "ASSISTANCE.REQUEST.TOTALHOURS"
          })}
          dataField="Minutos"
          dataType="datetime"
          format="HH:mm"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          cellRender={e => <CellHorasRender field={e.data.Minutos} />}
          width={"8%"}
        />
        <Column
          caption={intl.formatMessage({
            id: "ASSISTANCE.REQUEST.TOTALPAIDHOURS"
          })}
          dataField="MinutosPagados"
          dataType="datetime"
          format="HH:mm"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          cellRender={e => <CellHorasRender field={e.data.MinutosPagados} />}
          width={"8%"}
        />
        <Column
          caption={intl.formatMessage({
            id: "ASSISTANCE.REQUEST.TOTALCOMPENSATEDHOURS"
          })}
          dataField="MinutosCompensados"
          dataType="datetime"
          format="HH:mm"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          cellRender={e => (
            <CellHorasRender field={e.data.MinutosCompensados} />
          )}
          width={"8%"}
        />
        <Column
          caption={intl.formatMessage({
            id: "ASSISTANCE.REQUEST.TOTALHOURSEXCLUDED"
          })}
          dataField="MinutosExcluidos"
          dataType="datetime"
          format="HH:mm"
          allowSorting={true}
          allowFiltering={false}
          allowHeaderFiltering={false}
          cellRender={e => <CellHorasRender field={e.data.MinutosExcluidos} />}
          width={"8%"}
        />
        <Column
          caption={intl.formatMessage({
            id: "COMMON.STATE"
          })}
          dataField="Estado"
          width={"14%"}
          alignment={"center"}
          cellRender={cellEstadoRender}
          allowSorting={false}
          allowFiltering={false}
          allowHeaderFiltering={false}
        />

        <Column type="buttons" width={70} visible={true}>
          <ColumnButton
            icon="fa fa-eye"
            hint={intl.formatMessage({ id: "ACTION.VIEW" })}
            onClick={eventClickVer}
          />
        </Column>
      </DataGrid>
    );
  };

  return (
    <>
      <PortletHeader
        classNameHead={"title-estado-general-row"}
        title={""}
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button
                icon="search"
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
                onClick={eventRefreshGrid}
              />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <>
          <div>
            <CustomDataGrid
              // showLog={false}
              uniqueId={"ACDG_ASPL_Listar"}
              dataSource={dataSource}
              rowNumberName="RowIndex"
              loadWhenStartingComponent={isFirstDataLoad && !refreshData}
              renderDataGrid={renderDataGrid}
              loadUrl={loadUrl}
              forceLoad={forceLoadTypes.Unforced}
              sendToServerOnlyIfThereAreChanges={true}
              ifThereAreNoChangesLoadFromStorage={
                ifThereAreNoChangesLoadFromStorage
              }
              caseSensitiveWhenCheckingForChanges={true}
              uppercaseFilterRow={true}
              initialLoadOptions={{
                currentPage: 1,
                pageSize: 20,
                sort: { column: "RowIndex", order: "desc" }
              }}
              filterRowSize="sm"
              summaryCountFormat={`${intl.formatMessage({
                id: "COMMON.TOTAL.ROW"
              })} {0} de {1} `}
              visibleCustomFilter={isActiveFilters}
              renderFormContentCustomFilter={renderFormContentCustomFilter}
              transformData={transformData}
              reverseTransformData={reverseTransformData}
              keysToGenerateFilter={keysToGenerateFilter}
              filterData={filterData}
              // PAGINATION
              paginationSize="md"
              // EVENTS
              onLoading={() => setCustomDataGridIsBusy(true)}
              onError={() => setCustomDataGridIsBusy(false)}
              onLoaded={() => setCustomDataGridIsBusy(false)}
              // clearChecks={clearCheck}
              // setClearChecks={setClearCheck}
            />
          </div>
        </>
      </PortletBody>

      {popupVisiblePersonas && (
        <AsistenciaPersonaBuscarReporte
          showPopup={{
            isVisiblePopUp: popupVisiblePersonas,
            setisVisiblePopUp: setPopupVisiblePersonas
          }}
          cancelar={() => setPopupVisiblePersonas(false)}
          agregar={agregarPersonaAsistencia}
          selectionMode={"multiple"}
          uniqueId={"AsistenciaSolicitudListar_AsistenciaPersonaBuscar"}
          varIdCompania={varIdCompania}
        />
      )}
    </>
  );
};

export default SolicitudListPage;
