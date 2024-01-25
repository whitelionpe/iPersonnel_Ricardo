import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";

//Multi-idioma
import { injectIntl } from "react-intl";

import SistemasAplicacionObjetoBuscar from "../../../../partials/components/SistemasAplicacionObjetoBuscar";

import { useStylesEncabezado } from "../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";

const AplicacionObjetoEditPage = (props) => {

  const { intl, modoEdicion,accessButton } = props;
  console.log("AplicacionObjetoEditPage|props",props);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [isVisiblePopUpObjeto, setisVisiblePopUpObjeto] = useState(true);
  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  const agregar = (personas) => {
    if (props.dataRowEditNew.esNuevoRegistro) {
      props.agregarAplicacionObjeto(personas);
      props.setModoEdicion(false);
    } else {
      props.actualizarAplicacionObjeto(props.dataRowEditNew);
    }
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
<HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
 />
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

        { props.dataRowEditNew.esNuevoRegistro ? (

          <SistemasAplicacionObjetoBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUpObjeto, setisVisiblePopUp: setisVisiblePopUpObjeto }}
            cancelar={() => setisVisiblePopUpObjeto(false)}
            agregar={agregar}
            selectionMode={"multiple"}
            uniqueId={"AplicacionObjetoEditPage"}
            cancelarAplicacionObjeto = {props.cancelarAplicacionObjeto}
            setModoEdicion = { props.setModoEdicion}
            showButton = {true}
            IdAplicacion = {props.IdAplicacion}
      />

  ):(

    
    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
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

      <Item
        dataField="Objeto"
        label={{ text: intl.formatMessage({ id: "SYSTEM.APLICATION.OBJECT" }) }}
        editorOptions={{
          readOnly:true
        }}
      />

      <Item
        dataField="Activo"
        label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
        editorType="dxSelectBox"
        isRequired={modoEdicion}
        editorOptions={{
          items: estadoSimple,
          valueExpr: "Valor",
          displayExpr: "Descripcion",
          readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
        }}
      />

    </GroupItem>
  </Form>
     
  )
  }
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(AplicacionObjetoEditPage);
