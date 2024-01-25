import React, { useEffect, useState, useRef } from "react";
import { DataGrid, Column, Editing, Summary, TotalItem, MasterDetail } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../_metronic";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import PropTypes from "prop-types";

import { listarReporte } from '../../../../api/campamento/tipoHabitacion.api';


const TipoHabitacionListPage = props => {

    const { intl, focusedRowKey, accessButton, FormattedNumber } = props;
    // const dataGridRef = useRef(null);

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
    }


    const seleccionarRegistroDblClick = evt => {
        if (evt.data === undefined) return;
        if (isNotEmpty(evt.data)) {
            props.verRegistroDblClick(evt.data);
        };
    }

    const textEditing = {
      confirmDeleteMessage:'',
      editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
      deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };


    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            e.cellElement.style.color = e.data.Activo === 'N' ? 'red' : '';
        }
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

    //***Reporte
    const seleccionarReporte = evt => {
        props.seleccionarReporte(evt);
    };

    useEffect(() => {

    }, []);

    return (
        <>
            <PortletHeader
                title={intl.formatMessage({ id: "ACTION.LIST" })}
                toolbar={
                    <PortletHeaderToolbar>
                        <PortletHeaderToolbar>
                            <Button
                                disabled={!accessButton.nuevo}
                                icon="plus"
                                type="default"
                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                onClick={props.nuevoRegistro} />

                        </PortletHeaderToolbar>
                    </PortletHeaderToolbar>
                }
            />
            <PortletBody>
                <DataGrid
                    dataSource={props.tipoHabitacionData}
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
                    <Column dataField="IdTipoHabitacion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
                    <Column dataField="TipoHabitacion" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"50%"} />
                    <Column dataField="NumeroHabitacion" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDROOMS" })} width={"10%"} alignment={"center"} format="#,###" />
                    <Column dataField="NumeroHabitacionCama" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDS" })} width={"10%"} alignment={"center"} format="#,###" />
                    <Column dataType="boolean" dataField="Activo" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} alignment={"center"} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdTipoHabitacion"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                    <MasterDetail enabled={true} component={(dta) => (ReporteListPage({ data: dta.data, intl }))} />

                </DataGrid>

            </PortletBody>
        </>
    );
};


TipoHabitacionListPage.propTypes = {
    showHeaderInformation: PropTypes.bool,
    showButtons: PropTypes.bool,
    modoEdicion: PropTypes.bool
};
TipoHabitacionListPage.defaultProps = {
    showHeaderInformation: true,
    showButtons: true,
    modoEdicion: true
};

//REPORTE
const ReporteListPage = props => {

    const { intl } = props;

    const [dataSource, setDataSource] = useState([]);
    const splashScreen = document.getElementById("splash-screen");

    async function listarReporteHabitacion(dataRow) {
        splashScreen.classList.remove("hidden");
        const { IdCliente, IdDivision, IdTipoHabitacion } = dataRow;
        if (isNotEmpty(IdTipoHabitacion)) {
            let params = { IdCliente, IdDivision, IdTipoHabitacion };
            await listarReporte(params).then((data) => {
                console.log("listarReporteHabitacion", data);
                setDataSource(data);
            }).finally(() => { splashScreen.classList.add("hidden"); });
        }
    }



    useEffect(() => {
        listarReporteHabitacion(props.data.data);

    }, []);

    return (

        <>
            <div className="grid_detail_title">
                Detalle
                </div>
            <DataGrid
                id="dg-reporte"
                dataSource={dataSource}
                showBorders={true}
                columnAutoWidth={true}

            >
                <Editing
                    mode="row"
                />


                <Column dataField="Campamento" caption={intl.formatMessage({ id: "CAMP.CAMP" })} width={"70%"} />
                <Column dataField="NumeroHabitacion" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDROOMS" })} width={"10%"} alignment={"center"} format="#,###" />
                <Column dataField="NumeroHabitacionCama" caption={intl.formatMessage({ id: "CAMP.CAMP.BEDS" })} width={"10%"} alignment={"center"} format="#,###" />
                <Summary>
                    <TotalItem cssClass="classColorPaginador_" column="Campamento" displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL" })}`} />
                    <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacion" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"} />
                    <TotalItem cssClass="classColorPaginador_" column="NumeroHabitacionCama" summaryType="sum" displayFormat={`{0}`} valueFormat={"#,###"} alignment={"center"} />
                </Summary>
            </DataGrid>

        </>
    );
};

export default injectIntl(WithLoandingPanel(TipoHabitacionListPage));
