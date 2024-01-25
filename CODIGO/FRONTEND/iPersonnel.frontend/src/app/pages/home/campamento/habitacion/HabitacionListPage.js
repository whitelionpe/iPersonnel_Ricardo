import React, { useEffect, useState, useRef } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Button as ColumnButton, MasterDetail, Column, Editing, Summary, TotalItem, Paging, Pager, FilterRow } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { listar as listarServicios } from '../../../../api/campamento/habitacionServicio.api';
import { isNotEmpty, exportExcelDataGrid } from "../../../../../_metronic";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";


const HabitacionListPage = props => {

    const { intl, focusedRowKey, listarHabitacionTreeView, exportHabitacionExcel } = props;
    const dataGridRef = useRef(null);

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

    const seleccionarRegistro = evt => {
        if (evt.rowIndex === -1) return;
        if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

    };


    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    const insertarHabitacionServicio = evt => {
        props.insertarHabitacionServicio(evt.row.data);
    }


    function onRowExpanding(e) {
        props.expandRow.setExpandRow(e.key);
        props.collapsedRow.setCollapsed(false);
        e.component.collapseAll(-1);
        return;


    }
    function onRowCollapsed(e) {
        props.collapsedRow.setCollapsed(true);
        e.component.collapseRow(e.key);
        return;
    }

    function contentReady(e) {
        if (!props.collapsedRow.collapsed) {
            e.component.expandRow(props.expandRow.expandRow);
        }
        return;
    }

    //***Habitacion-servicio
    const seleccionarHabitacionServicio = evt => {
        props.seleccionarHabitacionServicio(evt);
    };

    const editarHabitacionServicio = evt => {
        props.editarHabitacionServicio(evt);
    };

    const eliminarHabitacionServicio = evt => {
        props.eliminarHabitacionServicio(evt);
    };

    const treeView = evt => {
        listarHabitacionTreeView();
    };


    useEffect(() => {

    }, []);


    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button
                                        icon="plus"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                        onClick={props.nuevoRegistro}
                                    />
                                          &nbsp;
                            <Button
                                        icon="fa fa-file-excel"
                                        type="default"
                                        hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
                                        onClick={exportHabitacionExcel}
                                        disabled={!props.focusedRowKey}
                                    />
                                &nbsp;
                                <Button
                                        icon="fa fa-times-circle"
                                        type="normal"
                                        hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                        onClick={props.cancelarEdicion}
                                    />
                                </PortletHeaderToolbar>
                            </PortletHeaderToolbar>
                        }
                    />
                } />


            <PortletBody>
                <DataGrid
                    id="datagrid-habitacion"
                    dataSource={props.campamentosHabitacion}
                    showBorders={true}
                    focusedRowEnabled={true}
                    focusedRowKey={focusedRowKey}
                    keyExpr="IdHabitacion"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    onFocusedRowChanged={seleccionarRegistro}
                    onRowExpanding={onRowExpanding}
                    onRowCollapsed={onRowCollapsed}
                    repaintChangesOnly={true}
                    ref={dataGridRef}
                >
                    <Editing
                        mode="row"
                        useIcons={props.showButtons}
                        allowUpdating={props.showButtons}
                        allowDeleting={props.showButtons}
                        texts={textEditing}
                    />
                    <FilterRow visible={true} showOperationChooser={false} />
                    <Column dataField="IdHabitacion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"center"} />
                    <Column dataField="Habitacion" caption={intl.formatMessage({ id: "CAMP.ROOM" })} width={"35%"} />
                    <Column dataField="TipoHabitacion" caption={intl.formatMessage({ id: "CAMP.ROOM.ROOMTYPE" })} width={"20%"} alignment={"center"} />
                    <Column dataField="NumeroHabitacionCama" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDS" })} width={"10%"} alignment={"center"} format="#,###"
                        allowFiltering={false}
                        allowHeaderFiltering={false}
                    />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />

                    <Column type="buttons" width={"10%"} visible={props.showButtons} >
                        <ColumnButton hint={intl.formatMessage({ id: "COMMON.DETAIL" })} icon="info" visible={true} onClick={treeView}/>
                        <ColumnButton icon="share" hint={intl.formatMessage({ id: "CAMP.CAMP.ROOMSERVICE.ADD" })} onClick={insertarHabitacionServicio} />
                        <ColumnButton name="edit" />
                        <ColumnButton name="delete" />
                    </Column>
                    <Paging defaultPageSize={20} />
                    <Pager showPageSizeSelector={false} />
                    <Summary>
                        <TotalItem cssClass="classColorPaginador_" column="IdHabitacion" displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })}`} />
                        <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacionCama" summaryType="sum" displayFormat={`{0}`} alignment={"center"} valueFormat={"#,###"} />
                    </Summary>

                    <MasterDetail enabled={true} component={(dta) => (HabitacionServicioListPage({ data: dta.data, intl, seleccionarHabitacionServicio, editarHabitacionServicio, eliminarHabitacionServicio, showButtons: props.showButtons }))} />

                </DataGrid>
            </PortletBody>
        </>
    );
};


HabitacionListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
    showButtons: PropTypes.bool,
    modoEdicion: PropTypes.bool,
    // showColumnLicense: PropTypes.bool,
    // showColumnOrder: PropTypes.bool,
};
HabitacionListPage.defaultProps = {
    showHeaderInformation: true,
    showButtons: true,
    modoEdicion: true,
    //showColumnLicense: false,
    //showColumnOrder: true,
};

//SERVICIOS
const HabitacionServicioListPage = props => {

    const { intl } = props;

    const [dataSource, setDataSource] = useState([]);
    const [focusedRowKeyHabitacionServicio, setFocusedRowKeyHabitacionServicio] = useState();
    const splashScreen = document.getElementById("splash-screen");

    const editarHabitacionServicio = evt => {
        props.editarHabitacionServicio(evt.data);
    };

    const eliminarHabitacionServicio = evt => {
        props.eliminarHabitacionServicio(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };

    const seleccionarHabitacionServicio = evt => {
        if (evt.rowIndex === -1) return;

        if (isNotEmpty(evt.row.data)) {
            const { RowIndex } = evt.row.data;
            setFocusedRowKeyHabitacionServicio(RowIndex);
            props.seleccionarHabitacionServicio(evt.row.data);
        }
    };


    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    const textEditing = {
        confirmDeleteMessage: '',
        editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
        deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
    };

    async function listarHabitacionServicio(dataRow) {
      console.log("listarHabitacionServicio|dataRow:", dataRow);
        splashScreen.classList.remove("hidden");
        const { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion } = dataRow;
        if (isNotEmpty(IdHabitacion)) {
            let params = { IdCliente, IdDivision, IdCampamento, IdModulo, IdHabitacion, IdServicio: "%" };
            await listarServicios(params).then((data) => {
                setDataSource(data);
                getRowFocus();
            }).finally(() => { splashScreen.classList.add("hidden"); });
        }
    }

    const getRowFocus = () => {
        let dataRow = JSON.parse(localStorage.getItem('dataRowHabServicio'));
        if (isNotEmpty(dataRow)) {
            const { RowIndex } = dataRow;
            setFocusedRowKeyHabitacionServicio(RowIndex);
        }
    }

    useEffect(() => {
      listarHabitacionServicio(props.data.data);
    }, []);

    return (

        <>
            <div className="grid_detail_title">
                {intl.formatMessage({ id: `${"CAMP.CAMP.ROOMSERVICE.SERVICE"}` })}
            </div>
            <DataGrid
                id="datagrid-habitacionservicio"
                dataSource={dataSource}
                showBorders={true}
                focusedRowEnabled={true}
                columnAutoWidth={true}
                focusedRowKey={focusedRowKeyHabitacionServicio}
                keyExpr="RowIndex"
                onCellPrepared={onCellPrepared}
                onEditingStart={editarHabitacionServicio}
                onRowRemoving={eliminarHabitacionServicio}
                onFocusedRowChanged={seleccionarHabitacionServicio}
                repaintChangesOnly={true}
            >
                <Editing
                    mode="row"
                    useIcons={props.showButtons}
                    allowUpdating={props.showButtons}
                    allowDeleting={props.showButtons}
                    texts={textEditing}
                />
                <Column dataField="IdServicio" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"center"} />
                <Column dataField="Servicio" caption={intl.formatMessage({ id: "CAMP.CAMP.ROOMSERVICE.SERVICE" })} width={"50%"} />
                <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} />
               
                <Column type="buttons" visible={props.showButtons} width={"10%"} >
                    <ColumnButton name="edit" />
                    <ColumnButton name="delete" />
                </Column>
            </DataGrid>

        </>
    );
};


export default injectIntl(WithLoandingPanel(HabitacionListPage));
