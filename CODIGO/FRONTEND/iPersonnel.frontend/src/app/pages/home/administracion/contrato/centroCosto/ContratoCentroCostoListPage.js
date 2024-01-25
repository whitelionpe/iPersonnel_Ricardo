import React, { useEffect, useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, } from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";

import { confirm, custom } from "devextreme/ui/dialog";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { listar as listarCentroCosto } from "../../../../../api/administracion/contratoCentroCosto.api";

const ContratoCentroCostoListPage = props => {

    const { intl, setLoading } = props;
    const [grillaCentroCosto, setgrillaCentroCosto] = useState([]);


    const editarRegistro = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistro = evt => {
        props.eliminarRegistro(evt.row.data,false,1);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    };


    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (e.data.Activo === 'N') {
                e.cellElement.style.color = 'red';
            }
        }
    }

    useEffect(() => {
        obtenerCentroCosto();
    }, []);

    const obtenerCentroCosto = async () => {

        let { IdCliente, IdContrato, IdCompaniaMandante, IdCompaniaContratista, IdUnidadOrganizativa, UnidadOrganizativa } = props.ContratoUnidadOrganizativa;


        const param = {
            IdCliente,
            IdContrato,
            IdCompaniaMandante,
            IdCompaniaContratista,
            IdUnidadOrganizativa,
        }
        setLoading(true);
        let centroCostos = await listarCentroCosto(param).finally(() => { setLoading(false); });
        setgrillaCentroCosto(centroCostos.map(x => ({ ...x, esNuevoRegistro: false, UnidadOrganizativa })));
    }


    return (
        <>

            {props.showButton && (
                <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
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
                                            icon="fa fa-times-circle"
                                            type="normal"
                                            hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                            onClick={props.cancelarEdicion}
                                        />
                                    </PortletHeaderToolbar>
                                </PortletHeaderToolbar>
                            }
                        />

                    } />)}


            <PortletBody>

                <div className="grid_detail_title">
                    {intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" })}
                </div>
                <DataGrid
                    dataSource={grillaCentroCosto}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onCellPrepared={onCellPrepared}
                >
                    <Column dataField="RowIndex" caption="#" width={25} alignment={"center"} />
                    <Column dataField="IdCentroCosto" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} alignment={"left"} />
                    <Column dataField="CentroCosto" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" })} width={"60%"} alignment={"left"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"20%"} />
                    <Column type="buttons" width={70} visible={props.showButtons} >
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
                    </Column>
                </DataGrid>
            </PortletBody>


        </>
    );
};


export default injectIntl(WithLoandingPanel(ContratoCentroCostoListPage));
