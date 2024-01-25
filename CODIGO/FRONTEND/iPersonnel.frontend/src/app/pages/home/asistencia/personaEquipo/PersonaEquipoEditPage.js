import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";

import { useSelector } from "react-redux";

//Multi-idioma
import { injectIntl } from "react-intl";


import AdministracionPersonaBuscarFilter from "../../../../partials/components/AdministracionPersonaBuscarFilter";

 import { obtenerTodos as obtenerPlanillas } from "../../../../api/asistencia/personaPlanilla.api";

import { listarTipoMarcacion } from "../../../../../_metronic/utils/utils";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import { listarEstadoSimple, PatterRuler } from "../../../../../_metronic";


const PersonaEquipoEditPage = (props) => {

  const { intl, modoEdicion,accessButton } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(true);
  const [cboPlanillas, setCboPlanillas] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
   

  }

  const agregarPersona = (personas) => {
    // for (let i = 0; i < personas.length; i++) {
    //   props.dataRowEditNew.IdPersona = personas[i].IdPersona;
    //   if (props.dataRowEditNew.esNuevoRegistro) {
    //     props.agregarPersonaEquipo(props.dataRowEditNew);
    //    }
    // }
    props.agregarPersonaEquipo(personas);
    props.setModoEdicion(false);
  }

 async function listarPlanillas(IdCompania) {
    let data = await obtenerPlanillas({
      IdCliente : perfil.IdCliente,
      IdPersona : 0,
      IdPlanilla : '%',
      IdCompania : IdCompania
    });
    setCboPlanillas(data); 
    //  console.log('listarPlanillas|data:',data);
  }


  useEffect(() => {
    props.dataRowEditNew.IdPersona = props.varIdPersona;
    cargarCombos();
  }, []);

  return (
    <>

<HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={2}
 />

      <PortletBody>
        <React.Fragment>
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
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                visible={false}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false),
                }}
              /> 

            </GroupItem>
          </Form>

     {/* POPUP-> buscar persona */}
     <AdministracionPersonaBuscarFilter
            showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
            cancelar={() => setisVisiblePopUpPersonas(false)}
            agregar={agregarPersona}
            listarPlanillas = {listarPlanillas}
            selectionMode={"multiple"}
            uniqueId={"PersonaEquipoEditPage"}
            cancelarEdicion = {props.cancelarEdicion}
            setModoEdicion = { props.setModoEdicion}
            cboPlanillas = { cboPlanillas }
            setCboPlanillas = { setCboPlanillas }
          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PersonaEquipoEditPage);
