import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem, ButtonItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import PropTypes from 'prop-types'
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AdministracionCentroCostoBuscar from "../../../../../partials/components/AdministracionCentroCostoBuscar";
import Alerts from "../../../../../partials/components/Alert/Alerts";

const ContratoCentroCostoEditPage = props => {
    //initialFilter.FlRepositorio = 2;

    const { intl, setLoading } = props;
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();
    const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
    //const [filtroCentroCosto, setFiltroCentroCosto] = useState({});
    //const [refreshData, setRefreshData] = useState(false);
    const [Filtros, setFiltros] = useState({ FlRepositorio: "2", IdUnidadOrganizativa:""});

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarContratoCentroCosto(props.dataRowEditNew);
            } else {
                props.actualizarContratoCentroCosto(props.dataRowEditNew);
            }
        }
    }

    const agregarCentroCosto = (dataPopup) => {
        //console.log("filtroCentroCosto", filtroCentroCosto);
        const { IdCentroCosto, CentroCosto } = dataPopup[0];
        setisVisibleCentroCosto(false);
        if (isNotEmpty(IdCentroCosto)) {
            props.setDataRowEditNew({
                ...props.dataRowEditNew,
                IdCentroCosto: IdCentroCosto,
                CentroCosto: CentroCosto,
            });
        }
    };

    /**************************************************************************************************** */

    useEffect(() => {
        cargarCombos();

        // setFiltroCentroCosto({
        //     IdCliente: perfil.IdCliente,
        //     Activo: "S",
        //     IdCentroCosto: "",
        //     IdUnidadOrganizativa: isNotEmpty(props.dataRowEditNew.IdUnidadOrganizativa),
        //     FlRepositorio: "2"
        // });

    }, []);

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
                                            icon="fa fa-save"
                                            type="default"
                                            hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                            visible={props.modoEdicion}
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
                                </PortletHeaderToolbar>
                            }
                        />

                    } />)}

            <PortletBody >
                <React.Fragment>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
                        <GroupItem itemType="group" colCount={2} colSpan={2}>
                            <Item colSpan={2}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "COMMON.DETAIL" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>

                            <SimpleItem dataField="IdCliente" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCompaniaMandante" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCompaniaContratista" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdContrato" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCompaniaSubContratista" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCompaniaSubContratistaPadre" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdUnidadOrganizativa" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdCentroCosto" visible={false}></SimpleItem>

                            <Item
                                colSpan={1} dataField="UnidadOrganizativa" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.UNIDADORGANIZATIVA" }) }}
                                editorOptions={{ inputAttr: { style: "text-transform: uppercase" }, readOnly: true, }}
                            />


                            <Item
                                colSpan={1} dataField="CentroCosto" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { style: "text-transform: uppercase" },
                                    showClearButton: true,
                                    buttons: [
                                        {
                                            name: "search",
                                            location: "after",
                                            useSubmitBehavior: true,
                                            options: {
                                                stylingMode: "text",
                                                icon: "search",
                                                disabled: props.isVisibleAlert ? true:  !props.dataRowEditNew.esNuevoRegistro,
                                                onClick: () => {
                                                    setFiltros({ ...Filtros, IdUnidadOrganizativa: props.dataRowEditNew.IdUnidadOrganizativa })
                                                    setisVisibleCentroCosto(true);
                                                },
                                            },
                                        },
                                    ],
                                }}
                            />

                            <Item
                                dataField="Activo"
                                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                                editorType="dxSelectBox"
                                isRequired={true}
                                editorOptions={{
                                    readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion"
                                }}
                            />

                        </GroupItem>



                    </Form>
                    {/* ---------------------------------------------------- */}

                    { isVisibleCentroCosto && (
                        <AdministracionCentroCostoBuscar
                        selectData={agregarCentroCosto}
                        showButton={false}
                        showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
                        cancelarEdicion={() => setisVisibleCentroCosto(false)}
                        uniqueId={"UndOrganizativaBuscarCentroCostoListPage"}
                        selectionMode={"row"}
                        // IdUnidadOrganizativa={IdUnidadOrganizativa}
                        Filtros={Filtros} 
                    />
                    )}
                    {/* ---------------------------------------------------- */}


                    {props.isVisibleAlert && (
                      <Alerts
                      severity={"warning"}
                      msg1={ intl.formatMessage({ id: "ADMINISTRATOR.CONTRACT.COST.CENTER.MSG1" }) }
                      msg2={intl.formatMessage({ id: "ADMINISTRATOR.CONTRACT.COST.CENTER.MSG2" }) }
                      
                      /> 
                    )}

                </React.Fragment>
            </PortletBody>
        </>
    );

};

ContratoCentroCostoEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,

}
ContratoCentroCostoEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoCentroCostoEditPage));
