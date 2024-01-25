import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";

//Multi-idioma
import { injectIntl } from "react-intl";

import SeguridadUsuarioBuscar from "../../../../../partials/components/SeguridadUsuarioBuscar";

import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";

import { listarEstadoSimple, PatterRuler } from "../../../../../../_metronic";

const UsuarioEditPage = (props) => {

  const { intl, modoEdicion,accessButton } = props;
  console.log("UsuarioEditPage|props",props);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [isVisiblePopUpObjeto, setisVisiblePopUpObjeto] = useState(true);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }
 
  const agregar = (usuarios) => {

    // if (props.dataRowEditNew.esNuevoRegistro) {
      props.actualizarUsuarios(usuarios);
      props.setModoEdicion(false);
    // }

  }

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
              onClick={agregar}
              useSubmitBehavior={true}
              validationGroup="FormEdicion"
              visible={modoEdicion}
              disabled={!accessButton.grabar}
            />
              &nbsp;
             <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarAplicacionObjeto}
            />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <React.Fragment>

       

          <SeguridadUsuarioBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpObjeto, setisVisiblePopUp: setisVisiblePopUpObjeto }}
            cancelar={() => setisVisiblePopUpObjeto(false)}
            agregar={agregar}
            selectionMode={"multiple"}
            uniqueId={"UsuarioEditPage"}
            cancelarAplicacionObjeto = {props.cancelarAplicacionObjeto}
            setModoEdicion = { props.setModoEdicion}
            showButton = {true}
            IdAplicacion = {props.IdAplicacion}
      />

     
  
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(UsuarioEditPage);
