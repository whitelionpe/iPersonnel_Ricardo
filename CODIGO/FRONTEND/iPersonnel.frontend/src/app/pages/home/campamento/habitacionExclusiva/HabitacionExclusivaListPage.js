import React, { Fragment, useState, useEffect } from 'react';
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Paging, Pager, FilterRow, Summary, TotalItem, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { Tooltip } from "devextreme-react/tooltip";
import Badge from '@material-ui/core/Badge';

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const HabitacionExclusivaListPage = (props) => {
    const { intl, accessButton } = props;

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.eliminarRegistro(evt.row.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }

    function cellRenderImage(param) {
        if (param && param.data) {
            const { Status, RowIndex } = param.data;

            if (Status === 'V') {
                return <>
                    <i className="fas fa-circle  text-gray-color icon-10x" id={`id_${RowIndex}`} ></i>
                    <Tooltip
                        target={`#id_${RowIndex}`}
                        showEvent="mouseenter"
                        hideEvent="mouseleave"
                        hideOnOutsideClick={false}
                    >
                        <div><p>{intl.formatMessage({ id: "CAMP.EXCLUSIVE.CURRENT" })}</p></div>
                    </Tooltip>
                </>

            }
            else if (Status === 'NV') {
                return <>
                    <i className="fas fa-circle  text-red-color icon-10x" id={`id_${RowIndex}`} ></i>
                    <Tooltip
                        target={`#id_${RowIndex}`}
                        showEvent="mouseenter"
                        hideEvent="mouseleave"
                        hideOnOutsideClick={false}
                    >
                        <div><p>{intl.formatMessage({ id: "CAMP.EXCLUSIVE.NOTCURRENT" })}</p></div>
                    </Tooltip>
                </>
            }
            else {
                return <>
                    <i className="fas fa-circle  text-info icon-10x" id={`id_${RowIndex}`} ></i>
                    <Tooltip
                        target={`#id_${RowIndex}`}
                        showEvent="mouseenter"
                        hideEvent="mouseleave"
                        hideOnOutsideClick={false}
                    >
                        <div><p>{intl.formatMessage({ id: "CAMP.EXCLUSIVE.FUTURE" })}</p></div>
                    </Tooltip>
                </>
            }

        }
    }

    useEffect(() => {

    }, []);

    return (
        <Fragment>
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={4}
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
                    focusedRowKey={props.focusedRowKey}
                    onCellPrepared={onCellPrepared}
                >

                    <FilterRow visible={false} />

                    <Column
                        dataField=""
                        caption={intl.formatMessage({ id: "CAMP.EXCLUSIVE.STATUS" })}
                        width={50}
                        alignment="center"
                        cellRender={cellRenderImage}
                        allowSorting={false}
                        allowFiltering={false}
                        allowHeaderFiltering={false} />
                    <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} alignment={"left"} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />

                    <Column type="buttons" width={95}   >
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
                    </Column>
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
        </Fragment>
    );
};

export default injectIntl(HabitacionExclusivaListPage);
