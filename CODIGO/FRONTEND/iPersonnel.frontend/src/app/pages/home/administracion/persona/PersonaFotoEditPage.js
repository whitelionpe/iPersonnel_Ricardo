import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import PropTypes from 'prop-types';
import { AppBar, Toolbar, Typography } from "@material-ui/core";

import { Portlet, PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { isNotEmpty } from "../../../../../_metronic";
import CardFoto from "../../../../partials/content/cardFoto";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const PersonaFotoEditPage = props => {
    const { intl, imagenConfiguracion, medidaSugeridas, eliminarRegistro, editable = false } = props;
    const classesEncabezado = useStylesEncabezado();

    const [popupVisiblePerfil, setPopupVisiblePerfil] = useState(false);
    const [popupVisibleMovil, setPopupVisibleMovil] = useState(false);
    const [popupVisibleExtra, setPopupVisibleExtra] = useState(false);


    function grabar(data, tipo) {
        const { file } = data;

        let personaFoto = {
            IdCliente: props.dataRowEditNew.IdCliente
            , IdPersona: props.dataRowEditNew.IdPersona
            , FotoPC: tipo === "FotoPC" ? isNotEmpty(file) ? file : "" : ""
            , FotoMovil: tipo === "FotoMovil" ? isNotEmpty(file) ? file : "" : ""
            , FotoExtra: tipo === "FotoExtra" ? isNotEmpty(file) ? file : "" : ""
            , Activo: "S"
        };
        if (props.dataRowEditNew.esNuevoRegistro) {
            props.agregarFoto({ ...personaFoto });
        } else {
            props.actualizarFoto({ ...personaFoto });
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

    const deletePicture = (tipoFoto) => {
        eliminarRegistro({ ...props.dataRowEditNew, TipoFoto: tipoFoto }, false);
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
                                            {intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item dataField="IdPersona" visible={false} />
                            <Item dataField="IdCliente" visible={false} />
                            <Item >
                                <Portlet >
                                    <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO.PROFILE" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center"  >
                                            <CardFoto
                                                id={"FotoPC"}
                                                size={props.size}
                                                esSubirImagen={props.uploadImagen}
                                                agregarFotoBd={(data) => grabar(data, "FotoPC")}
                                                hidePopup={() => hideInfo("perfil")}
                                                onClick={() => showInfo("perfil")}
                                                imagenB64={props.dataRowEditNew.FotoPC}
                                                fechaFoto={props.dataRowEditNew.FechaFotoPC}
                                                popupVisible={popupVisiblePerfil}
                                                imagenConfiguracion={imagenConfiguracion}
                                                medidaSugeridas={medidaSugeridas}

                                                deletePicture={() => deletePicture("FotoPC")}
                                                editable={editable}
                                                numberPosition={"1"}
                                            />
                                        </div>
                                    </PortletBody>
                                </Portlet >
                            </Item>
                            <Item>
                                <Portlet >
                                    <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO.MOVIL" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center">
                                            <CardFoto
                                                size={props.size}
                                                agregarFotoBd={(data) => grabar(data, "FotoMovil")}
                                                id={"FotoMovil"}
                                                //esSubirImagen={props.uploadImagen}
                                                imagenB64={props.dataRowEditNew.FotoMovil}
                                                fechaFoto={props.dataRowEditNew.FechaFotoMovil}

                                                popupVisible={popupVisibleMovil}
                                                hidePopup={() => hideInfo("movil")}
                                                onClick={() => showInfo("movil")}
                                                imagenConfiguracion={imagenConfiguracion}
                                                medidaSugeridas={medidaSugeridas}

                                                //deletePicture={() => deletePicture("FotoMovil")}
                                                //editable={editable}
                                                numberPosition={"2"}
                                            />
                                        </div>
                                    </PortletBody>
                                </Portlet>
                            </Item>

                            <Item>
                                <Portlet >
                                    <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO.EXTRA" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center">
                                            <CardFoto
                                                size={props.size}
                                                agregarFotoBd={(data) => grabar(data, "FotoExtra")}
                                                id={"FotoExtra"}
                                                esSubirImagen={props.uploadImagen}
                                                imagenB64={props.dataRowEditNew.FotoExtra}
                                                fechaFoto={props.dataRowEditNew.FechaFotoExtra}

                                                popupVisible={popupVisibleExtra}
                                                hidePopup={() => hideInfo("extra")}
                                                onClick={() => showInfo("extra")}
                                                imagenConfiguracion={imagenConfiguracion}
                                                medidaSugeridas={medidaSugeridas}

                                                deletePicture={() => deletePicture("FotoExtra")}
                                                editable={editable}
                                                numberPosition={"3"}
                                            />
                                        </div>
                                    </PortletBody>
                                </Portlet>
                            </Item>
                        </GroupItem>

                    </Form>
                </React.Fragment>

            </PortletBody>
        </>
    );
};
PersonaFotoEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,
    uploadImagen: PropTypes.bool,
    showHeaderInformation: PropTypes.bool,

}
PersonaFotoEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
    uploadImagen: false,
    showHeaderInformation: true,
}

export default injectIntl(PersonaFotoEditPage);
