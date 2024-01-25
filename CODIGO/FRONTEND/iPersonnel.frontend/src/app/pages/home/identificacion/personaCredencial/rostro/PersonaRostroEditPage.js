import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { isNotEmpty } from "../../../../../../_metronic";
import PropTypes from 'prop-types';
import CardFoto from "../../../../../partials/content/cardFoto";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

const PersonaRostroEditPage = props => {

    const { intl } = props;
    const classesEncabezado = useStylesEncabezado();
    const [popupVisiblePerfil, setPopupVisiblePerfil] = useState(false);
    const [popupVisibleMovil, setPopupVisibleMovil] = useState(false);
    const [popupVisibleExtra, setPopupVisibleExtra] = useState(false);

    function grabar(data, tipo) {
        const { file } = data;

        let personaHuella = {
              IdCliente: props.dataRowEditNew.IdCliente
            , IdPersona: props.dataRowEditNew.IdPersona
            , Rostro: tipo === "Rostro" ? isNotEmpty(file) ? file : "" : ""
            , Activo: "S"
        };
        if (props.dataRowEditNew.esNuevoRegistro) {
            props.agregarRostro({ ...personaHuella });
        } else {
            props.actualizarRostro({ ...personaHuella });
        }
    }

    function showInfo(tipo) {
        if (tipo === "perfil") setPopupVisiblePerfil(true);
        if (tipo === "movil") setPopupVisibleMovil(true);
        if (tipo === "extra") setPopupVisibleExtra(true);
    }

    function hideInfo(tipo) {
        if (tipo === "perfil") setPopupVisiblePerfil(false);
        if (tipo === "movil") setPopupVisibleMovil(false);
        if (tipo === "extra") setPopupVisibleExtra(false);
    }

    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
                toolbar={
                    <PortletHeader
                        title={""}
                        toolbar={
                            <PortletHeaderToolbar>
                                <Button
                                    icon="fa fa-times-circle"
                                    type="normal"
                                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                                    onClick={props.cancelarEdicion}
                                />
                            </PortletHeaderToolbar>
                        }
                    />
                }
            />
            <PortletBody >
                <React.Fragment>
                    <Form validationGroup="FormEdicion" formData={props.dataRowEditNew} >
                        <GroupItem itemType="group" colCount={3} colSpan={3}>
                            <Item colSpan={3}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "IDENTIFICATION.PERSON.FACIAL" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item dataField="IdPersona" visible={false} />
                            <Item dataField="IdCliente" visible={false} />
                            <Item >
                                <Portlet >
                                    <PortletHeader title={intl.formatMessage({ id: "IDENTIFICATION.PERSON.FACIAL01" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center"  >
                                            <CardFoto
                                                size={props.size}
                                                agregarFotoBd={(data) => grabar(data, "Rostro")}
                                                id={"Rostro"}
                                                esSubirImagen={props.uploadImagen}
                                                imagenB64={props.dataRowEditNew.Rostro}
                                                fechaFoto={props.dataRowEditNew.FechaRegistro}

                                                popupVisible={popupVisiblePerfil}
                                                hidePopup={() => hideInfo("perfil")}
                                                onClick={() => showInfo("perfil")}
                                            />
                                        </div>
                                    </PortletBody>
                                </Portlet >
                            </Item>

                        </GroupItem>

                    </Form>
                </React.Fragment>

            </PortletBody>
        </>
    );
};
PersonaRostroEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,
    uploadImagen: PropTypes.bool,
    showHeaderInformation: PropTypes.bool,

}
PersonaRostroEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
    uploadImagen: false,
    showHeaderInformation: true,
}

export default injectIntl(PersonaRostroEditPage);
