import { injectIntl } from "react-intl";
import { DataGrid, Selection, Column } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";
import {
    listarTreeview
} from "../../../../api/seguridad/protecciondatos.api";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import Form, { Item, GroupItem } from "devextreme-react/form";

const ProteccionDatosListPage = props => {
    const { intl, setLoading } = props;
    const { IdCliente, IdModulo, IdAplicacion, IdPerfil } = props.dataRowEditNew;

    const [menus, setMenus] = useState([{
        Icon: "flaticon2-expand"
        , IdMenu: null
        , IdModulo: null
        , IdMenuPadre: null
        , Menu: intl.formatMessage({ id: "SYSTEM.MENU.OPTIONS" })
        , MenuPadre: null
        , Nivel: 0
        , Orden: 0
        , expanded: true
    }]);

    const [varIdMenu, setVarIdMenu] = useState("");
    const classes = useStyles();
    const [modoEdicionSection, setModoEdicionSection] = useState(false);
    const [datosSeleccionados, setDatosSeleccionados] = useState([]);
    const [listaDatosEvaluar, setListaDatosEvaluar] = useState([]);


    const seleccionarNodo = async (dataRow) => {
        const { IdMenu, IdMenuPadre } = dataRow;
        if (IdMenu != varIdMenu) {
            setDatosSeleccionados([]);
            setVarIdMenu(IdMenu);
            await props.cargarDatosProteccion(IdMenu).then(datosEvaluar => {
                //props.setListaDatosEvaluar(datosEvaluar);
                setListaDatosEvaluar(datosEvaluar);
                let default_items = datosEvaluar.filter(x => x.Seleccionado === 1).map(x => { return x.Campo; });
                setDatosSeleccionados(default_items);
                setModoEdicionSection(true);
            });
            // console.log("Protecciondatos", datosEvaluar);           
        }
    }

    async function listarMenu() {
        setLoading(true);
        await listarTreeview({ IdCliente, IdModulo, IdAplicacion, IdPerfil }).then(menus => {
            if (menus.length === 0) {
                setMenus([])
            } else {
                setMenus(menus);
            }
        }).finally(() => { setLoading(false); });


    }

    useEffect(() => {
        listarMenu();

    }, []);


    const grabar = () => {
        if (datosSeleccionados.length >= 1) {
            props.agregarDatosProteccion({ IdMenu: varIdMenu, Datos: datosSeleccionados });
        } else {
            //Eliminar todos para poder crear un nuevo modulo en perfil: 
            props.EliminarTodosDatosProteccion({ IdMenu: varIdMenu });
            //handleInfoMessages("Debe seleccionar un equipo!");
        }
        listarMenu()
    }

    function onSelectionChanged(e) {
        setDatosSeleccionados(e.selectedRowKeys);
    }


    return (
        <>

            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={

                    <PortletHeader
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button
                                        icon="fa fa-save"
                                        type="default"
                                        hint="Grabar"
                                        onClick={grabar}
                                        disabled={!modoEdicionSection}
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

                } />


            <PortletBody>
                <React.Fragment>

                    <Paper className={classes.paper}>
                        <Grid container spacing={1} direction="row" justify="flex-start" alignItems="stretch" >
                            <Grid item xs={6} style={{ borderRight: "1px solid #ebedf2" }} >
                                <MenuTreeViewPage
                                    menus={menus}
                                    seleccionarNodo={seleccionarNodo}

                                />
                            </Grid>

                            <Grid item xs={6} >
                                <Paper className={classes.paper}>
                                    <>

                                        <PortletHeader
                                            title={"Seleccione"}
                                            toolbar={
                                                <PortletHeaderToolbar>
                                                </PortletHeaderToolbar>
                                            }
                                        />
                                        <PortletBody >
                                            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" disabled={!modoEdicionSection} >
                                                <GroupItem itemType="group" colCount={2} colSpan={2}>
                                                    <Item colSpan={2}>

                                                        <DataGrid
                                                            dataSource={listaDatosEvaluar}
                                                            showBorders={true}
                                                            focusedRowEnabled={true}
                                                            keyExpr="Campo"
                                                            onSelectionChanged={(e => onSelectionChanged(e))}
                                                            selectedRowKeys={datosSeleccionados}
                                                        >
                                                            <Selection mode={"multiple"} />
                                                            <Column dataField="Campo" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} />
                                                            <Column dataField="Descripcion" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"45%"} />
                                                        </DataGrid>

                                                    </Item>
                                                    <Item dataField="IdCliente" visible={false} />
                                                    <Item dataField="IdModulo" visible={false} />
                                                    <Item dataField="IdAplicacion" visible={false} />
                                                    <Item dataField="IdMenu" visible={false} />

                                                </GroupItem>
                                            </Form>
                                        </PortletBody>
                                    </>
                                </Paper>
                            </Grid>

                        </Grid>

                    </Paper>
                </React.Fragment>
            </PortletBody>
        </>
    );
};

const useStyles = makeStyles((theme) => ({

    paper: {
        padding: theme.spacing(0),
        //textAlign: 'left',
        //backgroundColor: theme.palette.background.paper,
    }

}));

export default injectIntl(WithLoandingPanel(ProteccionDatosListPage));
