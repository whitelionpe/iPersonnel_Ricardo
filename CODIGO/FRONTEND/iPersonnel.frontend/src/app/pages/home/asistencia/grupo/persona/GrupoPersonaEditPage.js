import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";

import DataGrid, { Column, Pager, Paging, Selection, Button as ColumnButton } from "devextreme-react/data-grid";
import { isNotEmpty, listarEstadoSimple } from "../../../../../../_metronic";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { custom } from "devextreme/ui/dialog";

import { DoubleLinePersona as DoubleLineLabel } from "../../../../../partials/content/Grid/DoubleLineLabel";
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import Confirm from "../../../../../partials/components/Confirm";


const GrupoPersonaEditPage = (props) => {
    const { intl, modoEdicion, settingDataField } = props;

    const perfil = useSelector(state => state.perfil.perfilActual);
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();
    const [isVisiblePopUpPersona, setisVisiblePopUpPersona] = useState(false);
    const [Filtros, setFiltros] = useState({ Filtro: "1" });
    const { IdCliente } = useSelector(state => state.perfil.perfilActual);
    const [selectedRowTemporal, setSelectedRowTemporal] = useState([]);
    const [itemsSelected, setItemsSelected] = useState([]);//Tambien permmite el refresh o reload del select multiple

    const [isVisible, setIsVisible] = useState(false);
    const [instance, setInstance] = useState({});
    const [selected, setSelected] = useState({});

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();

        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {

                let newArray = [...props.grillaPersona];

                if (newArray.length == 0) {
                    handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.PERSON" }));
                    return;
                }

                newArray.map(x => {
                    x.FechaInicio = new Date(props.dataRowEditNew.FechaInicio).toLocaleString();
                    x.FechaFin = new Date(props.dataRowEditNew.FechaFin).toLocaleString();
                });

                props.agregarPersonaGrupo(newArray);
                //}
            } else {
                props.actualizarPersonaGrupo(props.dataRowEditNew);
            }
        }
    }

    function eliminarSelect(e) {
        let newArray = [...props.grillaPersona];
        // console.log("test_oo", selectedRowTemporal)
        selectedRowTemporal.forEach(rd => {
            newArray = newArray.filter(t => t.IdPersona !== rd.IdPersona);
        });

        newArray.map((x, i) => x.RowIndex = i + 1);

        props.setGrillaPersona([]);
        props.setGrillaPersona(newArray);
        setItemsSelected([]);

    }

    function onCellPrepared(e) {
        if (e.rowType === 'data') {
            if (isNotEmpty(e.data.Mensaje)) {
                e.cellElement.style.color = 'red';
            }
        }
    }

    function onSelectionChanged(e) {
        setSelectedRowTemporal(e.selectedRowsData);
        setItemsSelected(e.selectedRowKeys.length && e.selectedRowKeys || []);
    }


    async function eliminarRegistroGrilla(evt) { 
        evt.cancel = true;
        eliminarRegistro(evt.row.data );
    }

    async function eliminarRegistro(data, confirm) {  
        setSelected(data);
        setIsVisible(true);
        if (confirm) { 
            let newArray = props.grillaPersona.filter(x => x.IdPersona != data.IdPersona);

            newArray.map((x, i) => {
                x.RowIndex = i + 1;
            });

            //Se valida para que el boton guardar se habilite o deshabilite
            newArray.length > 0 ? (props.dataRowEditNew.esNuevoRegistro = true) : (props.dataRowEditNew.esNuevoRegistro = false)
 
            props.setGrillaPersona(newArray); 
        }

    } 

    const agregarDatosGrilla = (personas) => {
        props.setGrillaPersona([]);
        let str_repetidos = '';
        let newArray = [...props.grillaPersona];

        personas.map(async (data) => {
            //Apellido Nombre
            let { IdPersona, NombreCompleto, Apellido, Nombre, TipoDocumento, Documento, Activo } = data;

            let foundIndex = newArray.findIndex(x => x.IdPersona == IdPersona);

            if (foundIndex == -1) {
                newArray.push({ IdPersona, NombreCompleto: `${Apellido} ${Nombre}`, TipoDocumento, Documento, Activo, Apellido, Nombre });
                newArray.map((x, i) => x.RowIndex = i + 1);
            } else {
                str_repetidos += `${Documento} - ${NombreCompleto}.\r\n`;
            }
        });
        // console.log("***agregarDatosGrilla():::newArray::", newArray);
        props.dataRowEditNew.esNuevoRegistro = true;//permite habilitar boton guardar
        props.setGrillaPersona(newArray);
        // evaluarMensaje(newArray);
    };

    useEffect(() => {
        cargarCombos();
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
                                    icon="group"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD.PERSON" })}
                                    useSubmitBehavior={true}
                                    onClick={function (evt) {
                                        setFiltros({ ...Filtros, IdCliente })
                                        setisVisiblePopUpPersona(true);
                                    }}
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                    onClick={grabar}
                                    disabled={!props.dataRowEditNew.esNuevoRegistro ? true : false}
                                />
                                &nbsp;
                                <Button
                                    icon="fa fa-trash"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                    onClick={eliminarSelect}
                                    disabled={!props.dataRowEditNew.esNuevoRegistro ? true : false}
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
                <React.Fragment>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.ADD.PERSON" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item dataField="IdGrupo" visible={false} />

                            <Item colSpan={2}></Item>

                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                editorType="dxSelectBox"
                                colSpan={2}
                                isRequired={modoEdicion}
                                visible={false}
                                editorOptions={{
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion"
                                }}
                            />

                            <Item dataField="IdPersona" visible={false} />

                        </GroupItem>
                    </Form>

                    <DataGrid
                        dataSource={props.grillaPersona}
                        showBorders={true}
                        focusedRowEnabled={true}
                        keyExpr="RowIndex"
                        onCellPrepared={onCellPrepared}
                        // onFocusedRowChanged={seleccionarRegistro}
                        //add
                        selectedRowKeys={itemsSelected}
                        onSelectionChanged={onSelectionChanged}
                    >

                        <Selection mode={"multiple"} />
                        <Column dataField="RowIndex" caption="#" width={"8%"} alignment={"center"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                        <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment={"center"} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                        <Column dataField="NombreCompleto" cellRender={DoubleLineLabel} caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })} width={"37%"} allowSorting={true} allowSearch={true} allowFiltering={true} />
                        <Column dataField="TipoDocumento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"10%"} allowSorting={false} allowSearch={false} allowFiltering={false} />
                        <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"15%"} />
                        <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })} width={"20%"} />
                        <Column type="buttons" width={70} visible={props.showButtons}
                        >
                            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistroGrilla} />
                        </Column>

                        <Paging defaultPageSize={9999} />
                        <Pager showPageSizeSelector={false} />
                    </DataGrid>

                    <AdministracionPersonaBuscar
                        uniqueId={"AsistenciaGrupoPersonaBuscar"}
                        showPopup={{ isVisiblePopUp: isVisiblePopUpPersona, setisVisiblePopUp: setisVisiblePopUpPersona }}
                        cancelar={() => setisVisiblePopUpPersona(false)}
                        agregar={agregarDatosGrilla}
                        //Filtros={Filtros}
                        selectionMode={"multiple"}
                    />

                    <Confirm
                        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
                        isVisible={isVisible}
                        setIsVisible={setIsVisible}
                        setInstance={setInstance}
                        onConfirm={() => 
                            eliminarRegistro(selected, true)
                        }
                        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
                        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
                        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
                    />

                </React.Fragment>
            </PortletBody>

        </>
    );
};

export default injectIntl(WithLoandingPanel(GrupoPersonaEditPage));