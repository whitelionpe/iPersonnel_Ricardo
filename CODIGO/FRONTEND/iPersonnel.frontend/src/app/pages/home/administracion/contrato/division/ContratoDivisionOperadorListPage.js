import React, { useEffect, useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { isNotEmpty } from "../../../../../../_metronic";

import { confirm, custom } from "devextreme/ui/dialog";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { obtener as obtenerOperador, listar as listarOperador } from "../../../../../api/administracion/contratoDivisionOperador.api";
// import ControlSwitch from "../../../../store/ducks/componente/componenteSwitch";

const ContratoDivisionOperadorListPage = props => {

    const { intl, setLoading } = props;
    const [grillaPersona, setGrillaPersona] = useState([]);

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
        obtenerOperador();
    }, []);

    const obtenerOperador = async () => {
        let { IdCliente, IdContrato, IdCompaniaMandante, IdCompaniaContratista, IdDivision, Division } = props.ContratoDivision;

        const param = {
            IdCliente,
            IdContrato,
            IdCompaniaMandante,
            IdCompaniaContratista,
            IdDivision,
            Division,
        }

        setLoading(true);
        let operadores = await listarOperador(param).finally(() => { setLoading(false); });
        setGrillaPersona(operadores.map(x => ({ ...x, esNuevoRegistro: false, Division })));
    }


    const editarRegistroOperador = evt => {
        props.editarRegistro(evt.row.data);
    };

    const eliminarRegistroOperador = evt => {
        let data = evt.row.data;
        props.eliminarRegistro(data,false,1);
    };

    return (
        <>

            <PortletBody>
                <div className="grid_detail_title">
                    Operadores del contrato
                </div>
                <DataGrid
                    dataSource={grillaPersona}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    onCellPrepared={onCellPrepared}
                >
                    <Column dataField="RowIndex" caption="#" width={25} alignment={"center"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                    <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment={"center"} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                    <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"30%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
                    <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT.TYPE" })} width={"15%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                    <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"15%"} />
                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} />

                    <Column type="buttons" width={70} visible={props.showButtons} >
                        <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistroOperador} />
                        <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistroOperador} />
                    </Column>
                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(WithLoandingPanel(ContratoDivisionOperadorListPage));
