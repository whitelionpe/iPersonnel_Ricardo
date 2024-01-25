import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../../../_metronic/utils/utils";
import { injectIntl } from "react-intl";
import PropTypes from 'prop-types'
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const ContratoDivisionOperadorEditPage = props => {

    const { intl } = props;
    const [estadoSimple, setEstadoSimple] = useState([]);
    const classesEncabezado = useStylesEncabezado();

    const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
    const perfil = useSelector(state => state.perfil.perfilActual);

    const [filtroLocal, setFiltroLocal] = useState({
      Condicion:'TRABAJADOR'
   });
  

    async function cargarCombos() {
        let estadoSimple = listarEstadoSimple();
        setEstadoSimple(estadoSimple);
    }

    function grabar(e) {
        let result = e.validationGroup.validate();
        if (result.isValid) {
            if (props.dataRowEditNew.esNuevoRegistro) {
                props.agregarContratoDivisionOperador(props.dataRowEditNew);
            } else {
                props.actualizarContratoDivisionOperador(props.dataRowEditNew);
            }
        }
    }

    /**************************************************************************************************** */


/*     async function agregarPersona(personas) {
        personas.map(async (data) => {
            let { IdPersona, NombreCompleto, TipoDocumento, Documento } = data;
            props.setDataRowEditNew({
                ...props.dataRowEditNew,
                IdPersona,
                NombreCompleto,
                TipoDocumento,
                Documento
            });
        });
    } */

    const agregarPersona = (data) => {
      if (data.length > 0) {
        let persona = data[0];

      //const { IdPersona, NombreCompleto, TipoDocumento, Documento } = data[0];
      props.dataRowEditNew.IdPersona = persona.IdPersona;
      props.dataRowEditNew.NombreCompleto = persona.NombreCompleto;
      props.dataRowEditNew.TipoDocumento = persona.TipoDocumento;
      props.dataRowEditNew.Documento = persona.Documento;
      }
  
    }
  

    /**************************************************************************************************** */

    useEffect(() => {
        cargarCombos();
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
                            <SimpleItem dataField="IdDivision" visible={false}></SimpleItem>
                            <SimpleItem dataField="IdPersona" visible={false}></SimpleItem>

                            <Item
                                colSpan={1} dataField="Division" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.DIVISION.NAME" }) }}
                                editorOptions={{ inputAttr: { style: "text-transform: uppercase" }, readOnly: true, }}
                            />

                            <Item
                                colSpan={1} dataField="NombreCompleto" isRequired={true} label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.OPERATOR" }), }}
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
                                                disabled: !props.dataRowEditNew.esNuevoRegistro,
                                                onClick: () => {
                                                    setisVisiblePopUpPersonas(true);
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
                                    items: estadoSimple,
                                    valueExpr: "Valor",
                                    displayExpr: "Descripcion",
                                    readOnly: props.dataRowEditNew.esNuevoRegistro ? true : !props.modoEdicion,
                                }}
                            />
                        </GroupItem>

                    </Form>

                    {/* ---------------------------------------------------- */}
                    <AdministracionPersonaBuscar
                        showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
                        cancelar={() => setisVisiblePopUpPersonas(false)}
                        agregar={agregarPersona}
                        //showButton={false}
                        selectionMode={"single"}
                        uniqueId = {"personasBuscarContratoDivisionOperadorEditPage"}
                        condicion = {"TRABAJADOR" }

                    />
                    {/* ---------------------------------------------------- */}
                </React.Fragment>
            </PortletBody>
        </>
    );

};

ContratoDivisionOperadorEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,

}
ContratoDivisionOperadorEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
}

export default injectIntl(WithLoandingPanel(ContratoDivisionOperadorEditPage));
