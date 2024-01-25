import React from "react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from "devextreme-react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Paging } from "devextreme-react/data-grid";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../store/config/Styles";

const textEditing = {
    confirmDeleteMessage: "¿Seguro de eliminar grupo?",
    editRow: "Editar grupo",
    deleteRow: "Eliminar grupo",
};

const AprobadorHHEEListPage = props => {

    const { intl } = props;

    const classesEncabezado = useStylesEncabezado();
    // const editarRegistro = evt => {
    //     props.editarRegistro(evt.data);
    // };

    // const eliminarRegistro = evt => {
    //     props.eliminarRegistro(evt.data);
    // };

    // const obtenerCampoActivo = rowData => {
    //     return rowData.Activo === "S";
    // };

    // const seleccionarRegistro = evt => {
    //     props.seleccionarRegistro(evt.data);
    // };

    return (
        <>
            <PortletHeader
            // title={ intl.formatMessage({ id: "ACTION.LIST" }) }
            // toolbar={
            //     <PortletHeaderToolbar>
            //         <PortletHeaderToolbar>
            //             <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} />
            //         </PortletHeaderToolbar>
            //     </PortletHeaderToolbar>
            // }
            />
            <PortletBody>
                <AppBar position="static" className={classesEncabezado.secundario}>
                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                            {intl.formatMessage({ id: "ASSISTANCE.PROFILE.USERS_ASSOCIATED" })}
                        </Typography>
                    </Toolbar>
                </AppBar>

                {/* <br/> */}
                <DataGrid
                    dataSource={props.perfilesUsuarios}
                    showBorders={true}
                    focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
                //onEditingStart={editarRegistro}
                //onRowRemoving={eliminarRegistro}
                // onRowClick={seleccionarRegistro}
                // focusedRowKey={props.focusedRowKey}
                >
                    {/* <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    /> */}
                    <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
                    <Column dataField="IdPersona" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "SECURITY.USER.FULLNAME" })} visible={true} width={"35%"} alignment={"left"} />
                    <Column dataField="Posicion" caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.POSITIONS.TAB" })} visible={true} width={"25%"} alignment={"left"} />
                    <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA.ABR" })} width={"25%"} />
                    {/* <Column dataField="Division" caption={intl.formatMessage({ id: "ACCREDITATION.PROFILE.DIVISION" })} width={"20%"} />
                     */}
                    {/* <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"8%"} alignment={"center"} /> */}

                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="NombreCompleto"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>
                    <Paging defaultPageSize={10} />

                    {/* 
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="RowIndex"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary> */}

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(AprobadorHHEEListPage);
