import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty, listarEstadoSimple } from "../../../../../_metronic";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import { initialFilter } from "./HorarioIndexPage";


const HorarioListPage = props => {
  const { intl, accessButton, companiaData, changeValueCompany, varIdCompania, setVarIdCompania, setFocusedRowKey, searchschedule,varActivo,setVarActivo} = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [activo, setActivo] = useState(varActivo); 
  let filterData = { ...initialFilter, Activo: 'S' };

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  const obtenerFlexible = rowData => {
    return rowData.Flexible === "S";
  }

  const obtenerSemanal = rowData => {
    return rowData.Semanal === "S";
  }

  const obtenerAutomatico = rowData => {
    return rowData.Automatico === "S";
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  async function cargarCombos() {
    let estadoSimples = listarEstadoSimple();
    setEstadoSimple(estadoSimples); 
  }

  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) { 
      changeValueCompany(company[0]);
    } else {
      changeValueCompany(null);
    }
  }

  useEffect(() => {
    if (!isNotEmpty(varIdCompania)) {
      if (companiaData.length > 0) {
        const { IdCompania } = companiaData[0];
        var company = companiaData.filter(x => x.IdCompania === IdCompania);
        getCompanySeleccionada(IdCompania, company);
        setVarIdCompania(IdCompania);
        setVarActivo('S'); 
        filterData = { ...filterData, IdCompania: IdCompania, Activo: 'S' };  
      } 
    }
 
  }, [companiaData]);
 
  useEffect(() => {
    cargarCombos();
  }, []);
 
  return (
    <>

      <PortletHeader
        title={
          <Form >
            <GroupItem itemType="group"   colCount={4}  >
              <Item
                dataField="IdCompania"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                editorType="dxSelectBox"
                colSpan={2}
                editorOptions={{
                  items: companiaData,
                  valueExpr: "IdCompania",
                  displayExpr: "Compania",
                  //showClearButton: true,
                  value: varIdCompania,
                  onValueChanged: (e) => {
                    if (isNotEmpty(e.value)) { 
                      var company = companiaData.filter(x => x.IdCompania === e.value); 
                      filterData = { ...filterData, IdCompania: e.value, Activo: activo };
                      searchschedule(filterData);
                      setVarIdCompania(e.value);
                      getCompanySeleccionada(e.value, company);
                      setFocusedRowKey(); 
                    } else { 
                      filterData = { ...filterData, IdCompania: "%", Activo: activo };
                      searchschedule(filterData);
                      setVarIdCompania("");
                      getCompanySeleccionada(null, "");
                      setFocusedRowKey(); 
                    }

                  },
                }}
              />


              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.ACTIVE" }) }}
                editorType="dxSelectBox"
                colSpan={2}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  showClearButton: true,
                  value: activo, 
                  onValueChanged: (e) => { 
                    if (isNotEmpty(e.value)) {
                      filterData = { ...filterData, Activo: e.value, IdCompania: varIdCompania };
                      searchschedule(filterData); 
                      setActivo(e.value);
                      setVarActivo(e.value); 
                    }
                    else {
                      filterData = { ...filterData, Activo: '%', IdCompania: varIdCompania };
                      searchschedule(filterData);
                      setActivo('%');
                      setVarActivo('%'); 
                    }
 
                  },
                }}
              />


            </GroupItem>

          </Form>
        }
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.NEW" })}
              onClick={props.nuevoRegistro}
              disabled={isNotEmpty(varIdCompania) ? false : true}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <DataGrid
          dataSource={props.asistenciaHorario}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />

          <Column dataField="IdHorario" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
          <Column dataField="Horario" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE" })} />
          <Column dataField="Ciclo" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.CYCLE" })} width={"10%"} alignment={"center"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.FLEXIBLE" })} calculateCellValue={obtenerFlexible} width={"10%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.WEEKLY" })} calculateCellValue={obtenerSemanal} width={"10%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.AUTOMATIC" })} calculateCellValue={obtenerAutomatico} visible={false} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdHorario"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>


        </DataGrid>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(HorarioListPage));
