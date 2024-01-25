import React, { useState,useEffect } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Paging, Pager, FilterRow, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import PropTypes from "prop-types";
import { DoubleLinePersona as DoubleLineLabel } from "../../../../partials/content/Grid/DoubleLineLabel";
 



const CamaExclusivaListPage = props => {

    const { intl,accessButton } = props;
    const [activarFiltros, setactivarFiltros] = useState(false);
    const [dataFilter, setDataFilter] = useState({
        FechaInicio: "",
        FechaFin: "",
    });

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

    useEffect(() => {
        props.validarCampamentos();
    }, []);

    return (
        <>

            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="plus"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                    onClick={props.nuevoRegistro}
                                    disabled={!accessButton.nuevo}
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={props.cancelarEdicion}
                                />

                            </PortletHeaderToolbar>
                        }
                    />
                } />

            <PortletBody>

                <DataGrid
                    dataSource={props.camaExclusiva}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onEditingStart={editarRegistro}
                    onRowRemoving={eliminarRegistro}
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={props.allowUpdating}
                        allowDeleting={props.allowDeleting}
                        texts={textEditing}
                    />
                    <FilterRow visible={false} />

                    <Column dataField="Campamento" caption={intl.formatMessage({ id: "CAMP.CAMP" })} alignment={"left"} />
                    <Column dataField="Modulo" caption={intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })} />
                    <Column dataField="Habitacion" caption={intl.formatMessage({ id: "CAMP.EXCLUSIVE.BED" })} alignment={"left"} />
                    <Column dataField="Cama" caption={intl.formatMessage({ id: "CAMP.ROOM.BED" })} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />
                    <Paging defaultPageSize={10} />
                    <Pager showPageSizeSelector={false} />

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="IdPersona"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

CamaExclusivaListPage.propTypes = {
    allowUpdating: PropTypes.bool,
    allowDeleting: PropTypes.bool
};
CamaExclusivaListPage.defaultProps = {
    allowUpdating: true,
    allowDeleting: true
};

export default injectIntl(CamaExclusivaListPage);
