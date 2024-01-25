import React, { Fragment, useState, useEffect } from 'react';
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Paging, Pager, FilterRow, Summary, TotalItem, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import Tooltip from '@material-ui/core/Tooltip';
import Badge from '@material-ui/core/Badge';

const CamaExclusivaByCamaListPage = (props) => {
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
        const { Status } = param.data;
        
        if(Status === 'V'){
          return <Tooltip title={<span style={{ fontSize: "15px"}}> {intl.formatMessage({ id: "CAMP.EXCLUSIVE.CURRENT" })} </span>} >
          <Badge badgeContent={""} overlap="circle"  color="secondary"/>
          </Tooltip> 
        }
        else if (Status === 'NV') {
          return  <Tooltip title={<span style={{ fontSize: "15px"}}> {intl.formatMessage({ id: "CAMP.EXCLUSIVE.NOTCURRENT" })} </span>} > 
          <Badge  badgeContent={""} overlap="circle" color="error" />
          </Tooltip>
        }
        else
        {
          return <Tooltip title={<span style={{ fontSize: "15px"}}> {intl.formatMessage({ id: "CAMP.EXCLUSIVE.FUTURE" })} </span>} >  
          <Badge  badgeContent={""} overlap="circle" color="primary" />
          </Tooltip>
        }

  }
 }

    useEffect(() => {
        props.validarCampamentos();
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
                    remoteOperations={true}

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
                    <Column dataField="Nombres" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} alignment={"left"} />
                    {/* <Column dataField="Modulo" caption={intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })} />
                    <Column dataField="Habitacion" caption={intl.formatMessage({ id: "CAMP.EXCLUSIVE.BED" })} alignment={"left"} />
                    <Column dataField="Cama" caption={intl.formatMessage({ id: "CAMP.ROOM.BED" })} /> */}
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

export default injectIntl(CamaExclusivaByCamaListPage);
