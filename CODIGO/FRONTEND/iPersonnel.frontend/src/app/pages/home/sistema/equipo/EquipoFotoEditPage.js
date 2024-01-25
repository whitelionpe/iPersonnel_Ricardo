import React, { useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import CardFoto from "../../../../partials/content/cardFoto";
import { isNotEmpty } from "../../../../../_metronic";
import Paper from '@material-ui/core/Paper';
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import AvatarEditor from "../../../../partials/content/AvatarEditor";


const EquipoFotoEditPage = props => {

  const { intl } = props;
  const classesEncabezado = useStylesEncabezado();
  const [popupVisibleFoto1, setPopupVisibleFoto1] = useState(false);
  const [popupVisibleFoto2, setPopupVisibleFoto2] = useState(false);
  const [popupVisibleFoto3, setPopupVisibleFoto3] = useState(false);


  function grabar(data, tipo) {
    const { file } = data;
    let equipoFoto = {
      IdCliente: props.dataRowEditNew.IdCliente
      , IdEquipo: props.dataRowEditNew.IdEquipo
      , Foto1: tipo === "Foto1" ? isNotEmpty(file) ? file : "" : ""
      , Foto2: tipo === "Foto2" ? isNotEmpty(file) ? file : "" : ""
      , Foto3: tipo === "Foto3" ? isNotEmpty(file) ? file : "" : ""
      , Activo: "S"
    };
    if (props.dataRowEditNew.esNuevoRegistro) {
      props.agregarFoto(equipoFoto);
    } else {
      props.actualizarFoto(equipoFoto);
    }
  }

  function showInfo(tipo) {
    if (tipo === "foto1") setPopupVisibleFoto1(true);
    if (tipo === "foto2") setPopupVisibleFoto2(true);
    if (tipo === "foto3") setPopupVisibleFoto3(true);
  }

  function hideInfo(tipo) {
    if (tipo === "foto1") setPopupVisibleFoto1(false);
    if (tipo === "foto2") setPopupVisibleFoto2(false);
    if (tipo === "foto3") setPopupVisibleFoto3(false);
  }

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
                  hint="Cancelar"
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        } />

      <PortletBody >
        <React.Fragment>
          <Form validationGroup="FormEdicion"  >
            <GroupItem itemType="group" colCount={3} colSpan={3}>
              <Item colSpan={3}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "SYSTEM.TEAM.PHOTOS" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdEquipo" visible={false} />
              <Item dataField="IdCliente" visible={false} />
              <Item >
                <Paper >
                  <PortletHeader title={intl.formatMessage({ id: "SYSTEM.TEAM.PHOTO1" })} />
                  <PortletBody >
                   
                    <AvatarEditor
                      size={props.size}
                      agregarFotoBd={(data) => grabar(data, "Foto1")}
                      id={"Foto1"}
                      esSubirImagen={true}
                      imagenB64={props.dataRowEditNew.Foto1}
                      fechaFoto={props.dataRowEditNew.FechaFoto1}

                      setPopupVisibleFoto1={setPopupVisibleFoto1}
                      popupVisible={popupVisibleFoto1}
                      setPopupVisible={popupVisibleFoto1}             
                      hidePopup={() => hideInfo("foto1")}
                      onClick={() => showInfo("foto1")}
                    />
                  </PortletBody>
                </Paper>
              </Item>
              <Item>
                <Paper>
                  <PortletHeader title={intl.formatMessage({ id: "SYSTEM.TEAM.PHOTO2" })} />
                  <PortletBody >
                    <AvatarEditor
                      size={props.size}
                      agregarFotoBd={(data) => grabar(data, "Foto2")}
                      id={"Foto2"}
                      esSubirImagen={true}
                      imagenB64={props.dataRowEditNew.Foto2}
                      fechaFoto={props.dataRowEditNew.FechaFoto2}

                      setPopupVisibleFoto1={setPopupVisibleFoto2}
                      popupVisible={popupVisibleFoto2}
                      setPopupVisible={popupVisibleFoto2}
                      hidePopup={() => hideInfo("foto2")}
                      onClick={() => showInfo("foto2")}
                    />
                  </PortletBody>
                </Paper>
              </Item>
              <Item>
                <Paper>
                  <PortletHeader title={intl.formatMessage({ id: "SYSTEM.TEAM.PHOTO3" })} />
                  <PortletBody >
                    <AvatarEditor
                      size={props.size}
                      agregarFotoBd={(data) => grabar(data, "Foto3")}
                      id={"Foto3"}
                      esSubirImagen={true}
                      imagenB64={props.dataRowEditNew.Foto3}
                      fechaFoto={props.dataRowEditNew.FechaFoto3}

                      setPopupVisibleFoto1={setPopupVisibleFoto3}
                      popupVisible={popupVisibleFoto3}
                      setPopupVisible={popupVisibleFoto3}
                      hidePopup={() => hideInfo("foto3")}
                      onClick={() => showInfo("foto3")}
                    />
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

EquipoFotoEditPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
EquipoFotoEditPage.defaultProps = {
  showHeaderInformation: true,
};
export default injectIntl(EquipoFotoEditPage);
