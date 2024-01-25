import React, { useState, useEffect } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, Summary, TotalItem, MasterDetail, Paging, Pager, FilterRow, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";

import Form, { Item, GroupItem } from "devextreme-react/form";
import { listar as listarCentroCosto } from "../../../../../api/administracion/personaCentroCosto.api";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { injectIntl } from "react-intl";


const textEditing = {
    confirmDeleteMessage: "¿Seguro de eliminar centro de costo?",
    editRow: "Editar centro de costo",
    deleteRow: "Eliminar centro de costo",
};

const PersonaCentroCostoListPage = props => {

    const { intl, setLoading } = props;


    const [grillaCentroCosto, setGrillaCentroCosto] = useState([]);
    const [posicion, setPosicion] = useState({});


    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data, posicion);
    };

    const eliminarRegistro = evt => {
        //posicion
        props.eliminarRegistro(evt.row.data, posicion);
    };
    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }


    const obtenerCentroCostor = async () => {
        let { IdCliente, IdPersona, IdCompania, IdPosicion, IdSecuencial } = props.posicion;

        setPosicion(props.posicion);
        setLoading(true);
        let centroCostos = await listarCentroCosto({ IdCliente, IdPersona, IdCompania, IdPosicion, IdSecuencial, NumPagina: 0, TamPagina: 0 }).finally(() => { setLoading(false); });
        setGrillaCentroCosto(centroCostos.map(x => ({ ...x, esNuevoRegistro: false, })));//Perfil, Division, Requisito
    }

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }


    useEffect(() => {
        obtenerCentroCostor();
    }, []);


    return (
        <React.Fragment>
            <PortletBody>
                <div className="grid_detail_title">
                  {intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" })}
                </div>
                < DataGrid
                    dataSource={grillaCentroCosto}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onCellPrepared={onCellPrepared}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />
                    <Column dataField="RowIndex" caption="#" width={40} />
                    <Column dataField="CentroCosto" caption={intl.formatMessage({ id: "ADMINISTRATION.COSTCENTER.COSTCENTER" })} width={"40%"} />
                    <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"15%"} />
                    <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} width={"15%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"15%"} />

                    <Column type="buttons" width={105} visible={props.showButtons} >
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
                    </Column>

                </DataGrid >
            </PortletBody>
        </React.Fragment >

    );
};

export default injectIntl(WithLoandingPanel(PersonaCentroCostoListPage));
