import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
//import AvatarFoto from "../../../../partials/content/avatarFoto";
import CardFoto from "../../../../partials/content/cardFoto";
import { isNotEmpty } from "../../../../../_metronic";
import Paper from "@material-ui/core/Paper";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const UsuarioFotoPage = (props) => {
  const { intl, imagenConfiguracion, medidaSugeridas } = props;
  const classesEncabezado = useStylesEncabezado();

  const [popupVisiblePerfil, setPopupVisiblePerfil] = useState(false);
  const [popupVisibleMovil, setPopupVisibleMovil] = useState(false);
  const [popupVisibleExtra, setPopupVisibleExtra] = useState(false);

  function grabar(data, tipo) {
    const { file } = data;

    let usuarioFoto = {
      IdCliente: props.dataRowEditNew.IdCliente,
      IdUsuario: props.dataRowEditNew.IdUsuario,
      Foto: tipo === "Foto" ? (isNotEmpty(file) ? file : "") : ""

      , FotoMovil: tipo === "FotoMovil" ? isNotEmpty(file) ? file : "" : ""
      , FotoExtra: tipo === "FotoExtra" ? isNotEmpty(file) ? file : "" : ""
      , Activo: "S"

    };
    if (props.dataRowEditNew.esNuevoRegistro) {
      props.agregarFoto({ ...usuarioFoto });
    } else {
      props.actualizarFoto({ ...usuarioFoto });
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

  // console.log("test", props.dataRowEditNew)


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
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


      <PortletBody>
        <React.Fragment>
          <Form validationGroup="FormEdicion" formData={props.dataRowEditNew}>
            <GroupItem itemType="group" colCount={3} colSpan={3}>
              <Item colSpan={3}>
                <AppBar
                  position="static"
                  className={classesEncabezado.secundario}
                >
                  <Toolbar
                    variant="dense"
                    className={classesEncabezado.toolbar}
                  >
                    <Typography
                      variant="h6"
                      color="inherit"
                      className={classesEncabezado.title}
                    >
                      {intl.formatMessage({
                        id: "ADMINISTRATION.PERSON.PHOTO",
                      })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdUsuario" visible={false} />
              <Item dataField="IdCliente" visible={false} />

              <Item>
                <Paper>
                  <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO.PROFILE", })} />
                  <PortletBody>
                    <div className="d-flex justify-content-center">

                      <CardFoto
                        id={"Foto"}
                        size={props.size}
                        esSubirImagen={props.uploadImagen}
                        agregarFotoBd={(data) => grabar(data, "Foto")}
                        hidePopup={() => hideInfo("perfil")}
                        onClick={() => showInfo("perfil")}
                        imagenB64={props.dataRowEditNew.Foto}
                        fechaFoto={props.dataRowEditNew.FechaFoto}
                        popupVisible={popupVisiblePerfil}
                        imagenConfiguracion={imagenConfiguracion}
                        medidaSugeridas={medidaSugeridas}
                        // deletePicture={() => deletePicture("FotoPC")}
                        // editable={editable}
                        numberPosition={"1"}
                      />
                    </div>

                  </PortletBody>
                </Paper>
              </Item>

              {/* <Item>
                <Paper >
                  <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO.MOVIL" })} />
                  <PortletBody >
                    <div className="d-flex justify-content-center">
                      <CardFoto
                        id={"FotoMovil"}
                        size={props.size}
                        esSubirImagen={props.uploadImagen}
                        agregarFotoBd={(data) => grabar(data, "FotoMovil")}
                        hidePopup={() => hideInfo("movil")}
                        onClick={() => showInfo("movil")}
                        imagenB64={props.dataRowEditNew.FotoMovil}
                        fechaFoto={props.dataRowEditNew.FechaFotoMovil}
                        popupVisible={popupVisibleMovil}
                        imagenConfiguracion={imagenConfiguracion}
                        medidaSugeridas={medidaSugeridas}
                        // deletePicture={() => deletePicture("FotoMovil")}
                        // editable={editable}
                        numberPosition={"2"}
                      />
                    </div>
                  </PortletBody>
                </Paper>
              </Item>

              <Item>
                <Paper >
                  <PortletHeader title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.PHOTO.EXTRA" })} />
                  <PortletBody >
                    <div className="d-flex justify-content-center">

                      <CardFoto
                        id={"FotoExtra"}
                        size={props.size}
                        esSubirImagen={props.uploadImagen}
                        agregarFotoBd={(data) => grabar(data, "FotoExtra")}
                        hidePopup={() => hideInfo("extra")}
                        onClick={() => showInfo("extra")}
                        imagenB64={props.dataRowEditNew.FotoExtra}
                        fechaFoto={props.dataRowEditNew.FechaFotoExtra}
                        popupVisible={popupVisibleExtra}
                        imagenConfiguracion={imagenConfiguracion}
                        medidaSugeridas={medidaSugeridas}

                        // deletePicture={() => deletePicture("FotoExtra")}
                        // editable={editable}
                        numberPosition={"3"}
                      />

                    </div>
                  </PortletBody>
                </Paper>
              </Item> */}



            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
    </>
  );
};
UsuarioFotoPage.propTypes = {
  titulo: PropTypes.string,
  modoEdicion: PropTypes.bool,
  showButtons: PropTypes.bool,
  showAppBar: PropTypes.bool,
  uploadImagen: PropTypes.bool,
  showHeaderInformation: PropTypes.bool
};
UsuarioFotoPage.defaultProps = {
  titulo: "",
  modoEdicion: false,
  showButtons: true,
  showAppBar: true,
  uploadImagen: false,
  showHeaderInformation: true
};

export default injectIntl(UsuarioFotoPage);
