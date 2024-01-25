import React, { useEffect, useState } from "react";
import {injectIntl} from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection } from "devextreme-react/data-grid";
import { storePersonasListado } from "../../../../api/administracion/persona.api";

import DoubleLineLabel from "../../../../partials/content/Grid/DoubleLineLabel";

const PersonaSeleccionMultiplePage = props => {
    const {intl} = props;
    const perfil = useSelector(state => state.perfil.perfilActual);
    const [filterValue, setFilterValue] = useState();
    const [gridBoxValue, setGridBoxValue] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    async function cargarCombos() {

      
    }

    function grabar(e) {

        console.log("Grabar",gridBoxValue);
        let result = e.validationGroup.validate();
        //Seleccionado al menos un registro.
        if (result.isValid) {
            props.agregar(props.dataRowEditNew);
        }
    }
    function dataGrid_onSelectionChanged(e) {
        setGridBoxValue(e.selectedRowKeys.length && e.selectedRowKeys || []);
    }
    const obtenerCampoActivo = rowData => {
        return rowData.Estado === "S";
    };
    useEffect(() => {
        cargarCombos();
        
    }, []);

    return (
        <>
            <PortletHeader
                title={props.titulo}
                toolbar={
                    <PortletHeaderToolbar>

                        <Button
                            icon="fa fa-save"
                            type="default"
                            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                            onClick={grabar}
                            useSubmitBehavior={true}
                            validationGroup="FormEdicion"
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
            <PortletBody >
                <React.Fragment>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            Agregar persona
                                    </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item colSpan={2}>
                                <DataGrid
                                    dataSource={storePersonasListado}
                                    showBorders={true}
                                    keyExpr="RowIndex"
                                    remoteOperations={true}
                                    filterValue={filterValue}
                                    //onRowClick={seleccionarRegistro}
                                    // onCellPrepared={onCellPrepared}
                                    allowColumnReordering={true}
                                    allowColumnResizing={true}
                                    columnAutoWidth={true}
                                    selectedRowKeys={gridBoxValue}
                                    onSelectionChanged={(e => dataGrid_onSelectionChanged(e))}
                                >

                                    <Selection mode="multiple" />
                                    <FilterRow visible={true} />
                                    <HeaderFilter visible={true} />
                                    <FilterPanel visible={false} />
                                    <Column
                                        dataField="RowIndex"
                                        caption="#"
                                        allowSorting={true}
                                        allowFiltering={false}
                                        allowHeaderFiltering={false}
                                        width={"7%"}
                                        alignment={"center"} />
                                    <Column dataField="IdPersona"
                                        caption={intl.formatMessage({ id: "COMMON.CODE" })}
                                        allowHeaderFiltering={false}
                                        allowSorting={true}
                                        width={"10%"}
                                        alignment={"center"} />
                                    <Column
                                        dataField="NombreCompleto"
                                        caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
                                        cellRender={DoubleLineLabel}
                                        allowSorting={true}
                                        allowHeaderFiltering={false}
                                        width={"25%"}
                                    />
                                    <Column
                                        dataField="TipoDocumento"
                                        caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
                                        allowSorting={true}
                                        allowFiltering={false}
                                        allowHeaderFiltering={false}
                                        alignment={"center"}
                                        width={"10%"}
                                    >
                                        {/* <HeaderFilter dataSource={tipoDocumentoFilter} /> */}
                                    </Column>
                                    <Column dataField="Documento"
                                        caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
                                        allowHeaderFiltering={false}
                                        width={"12%"}
                                        alignment={"center"}
                                    />
                                    <Column
                                        dataField="Sexo"
                                        caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.GENDER" })}
                                        allowSorting={true}
                                        allowFiltering={false}
                                        allowHeaderFiltering={false}
                                        alignment={"center"}
                                        width={"12%"}
                                    >
                                        {/* <HeaderFilter dataSource={sexoFilter} /> */}
                                    </Column>

                                    <Column
                                        dataField="Edad"
                                        caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.AGE" })}
                                        allowHeaderFiltering={false}
                                        allowSorting={true}
                                        width={"7%"}
                                        alignment={"center"}
                                    />
                                    <Column
                                        dataField="UbigeoNacimiento"
                                        caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.CONTRY.OF.BIRTH" })}
                                        allowSorting={false}
                                        allowFiltering={false}
                                        allowHeaderFiltering={false}
                                        alignment={"center"}
                                        width={"10%"}
                                    />

                                    <Column dataField="Estado"
                                        caption={intl.formatMessage({ id: "COMMON.STATE" })}
                                        calculateCellValue={obtenerCampoActivo}
                                        allowSorting={true}
                                        allowFiltering={false}
                                        allowHeaderFiltering={false}
                                        width={"7%"}
                                    />
                                    <Column dataField="IdCompania" visible={false} />
                                    <Column dataField="IdGrupo" visible={false} />
                                    <Column dataField="IdTipoTrabajador" visible={false} />
                                    <Column dataField="IdCargo" visible={false} />
                                    <Column dataField="IdUbigeoResidencia" visible={false} />
                                    <Column dataField="Activo" visible={false} />

                                    <Paging defaultPageSize={20} />
                                    <Pager showPageSizeSelector={false} />
                                </DataGrid>

                            </Item>
                        </GroupItem>
                    </Form>

                </React.Fragment>
            </PortletBody>
        </>
    );
};

export default injectIntl(PersonaSeleccionMultiplePage) ;
