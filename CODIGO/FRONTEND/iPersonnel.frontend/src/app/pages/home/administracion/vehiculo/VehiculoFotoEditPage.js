import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import AvatarFoto from "../../../../partials/content/avatarFoto";
import CardFoto from "../../../../partials/content/cardFoto";
import { isNotEmpty } from "../../../../../_metronic";
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import { useSelector } from "react-redux";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const VehiculoFotoEditPage = props => {

    const { intl, imagenConfiguracion, medidaSugeridas } = props;
    const classesEncabezado = useStylesEncabezado();
    const [popupVisiblePerfil, setPopupVisiblePerfil] = useState(false);
    const [popupVisibleMovil, setPopupVisibleMovil] = useState(false);
    const [popupVisibleExtra, setPopupVisibleExtra] = useState(false);
    const perfil = useSelector((state) => state.perfil.perfilActual);

    function grabar(data, tipo) {
        const { file } = data;

        let vehiculoFoto = {
            IdCliente: perfil.IdCliente
            , IdVehiculo: props.idVehiculo
            , FotoPC: tipo === "FotoPC" ? isNotEmpty(file) ? file : "" : ""
            , FotoMovil: tipo === "FotoMovil" ? isNotEmpty(file) ? file : "" : ""
            , FotoExtra: tipo === "FotoExtra" ? isNotEmpty(file) ? file : "" : ""
            , Activo: "S"
        };
        if (props.dataRowEditNew.esNuevoRegistro) {
            props.agregarFoto({ ...vehiculoFoto });
        } else {
            props.actualizarFoto({ ...vehiculoFoto });
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
        props.eliminarRegistro({ ...props.dataRowEditNew, TipoFoto: tipoFoto }, false);
    }

    return (
        <>
            <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
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
                } />

            <PortletBody >
                <React.Fragment>
                    <Form validationGroup="FormEdicion" formData={props.dataRowEditNew} >
                        <GroupItem itemType="group" colCount={3} colSpan={3}>
                            <Item colSpan={3}>
                                <AppBar position="static" className={classesEncabezado.secundario}>
                                    <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                        <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                            {intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PHOTO" })}
                                        </Typography>
                                    </Toolbar>
                                </AppBar>
                            </Item>
                            <Item dataField="IdPersona" visible={false} />
                            <Item dataField="IdCliente" visible={false} />
                            <Item >

                                <Paper >
                                    <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PHOTO.PROFILE" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center"  >
                                            <CardFoto
                                                size={props.size}
                                                agregarFotoBd={(data) => grabar(data, "FotoPC")}
                                                id={"FotoPC"}
                                                esSubirImagen={props.uploadImagen}
                                                imagenB64={props.dataRowEditNew.FotoPC}
                                                fechaFoto={props.dataRowEditNew.FechaFotoPC}
                                                popupVisible={popupVisiblePerfil}
                                                hidePopup={() => hideInfo("perfil")}
                                                onClick={() => showInfo("perfil")}
                                                imagenConfiguracion={imagenConfiguracion}
                                                deletePicture={() => deletePicture("FotoPC")}

                                                medidaSugeridas={medidaSugeridas}
                                                numberPosition={"1"}
                                            />
                                        </div>
                                    </PortletBody>
                                </Paper>
                            </Item>
                            <Item>
                                <Paper>
                                    <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PHOTO.MOVIL" })} />
                                    <PortletBody >
                                        <div className="d-flex justify-content-center">
                                            <CardFoto
                                                size={props.size}
                                                agregarFotoBd={(data) => grabar(data, "FotoMovil")}
                                                id={"FotoMovil"}
                                                esSubirImagen={props.uploadImagen}
                                                imagenB64={props.dataRowEditNew.FotoMovil}
                                                fechaFoto={props.dataRowEditNew.FechaFotoMovil}
                                                popupVisible={popupVisibleMovil}
                                                hidePopup={() => hideInfo("movil")}
                                                onClick={() => showInfo("movil")}
                                                imagenConfiguracion={imagenConfiguracion}
                                                deletePicture={() => deletePicture("FotoMovil")}
                                                medidaSugeridas={medidaSugeridas}
                                                // editable={editable}
                                                numberPosition={"2"}
                                            />
                                        </div>
                                    </PortletBody>
                                </Paper>
                            </Item>

                            <Item>
                                <Paper>
                                    <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.VEHICLE.PHOTO.EXTRA" })} />
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
                                                deletePicture={() => deletePicture("FotoExtra")}
                                                medidaSugeridas={medidaSugeridas}
                                                // editable={editable}
                                                numberPosition={"3"}
                                            />
                                        </div>
                                    </PortletBody>
                                </Paper>
                            </Item>
                        </GroupItem>

                    </Form>
                </React.Fragment>

            </PortletBody>
        </>
    );
};
VehiculoFotoEditPage.propTypes = {
    titulo: PropTypes.string,
    modoEdicion: PropTypes.bool,
    showButtons: PropTypes.bool,
    showAppBar: PropTypes.bool,
    uploadImagen: PropTypes.bool,

}
VehiculoFotoEditPage.defaultProps = {
    titulo: "",
    modoEdicion: false,
    showButtons: true,
    showAppBar: true,
    uploadImagen: false
}

export default injectIntl(VehiculoFotoEditPage);
