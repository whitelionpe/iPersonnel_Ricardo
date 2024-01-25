import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "devextreme-react";
import Form, { Item, GroupItem, ButtonItem } from "devextreme-react/form";
//import { DataGrid, Column, Paging, Pager, Button as ColumnButton, } from "devextreme-react/data-grid";


import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstadoSimple } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";

import HeaderInformation from "../../../../partials/components/HeaderInformation";

//Combos 
// import { obtenerTodos as listarCampamentos } from "../../../../api/campamento/administrador.api";
import { obtenerTodos as listarCampamentos } from "../../../../api/campamento/campamento.api";
import CampamentoCamaExclusivaBuscar from "../../../../partials/components/CampamentoCamaExclusivaBuscar";


const CamaExclusivaEditPage = props => {
  const { intl, modoEdicion, settingDataField, setLoading } = props;
  const usuario = useSelector(state => state.auth.user);
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [campamentos, setCampamentos] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [camas, setCamas] = useState([]);

  const [isVisiblePopUpCamas, setisVisiblePopUpCamas] = useState(false);
  const [isDisabledOption, setisDisabledOption] = useState(true);

  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  async function cargarCombos() {
    setLoading(true);

    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;

    let estadoSimple = listarEstadoSimple();

    let [
      tmp_campamentos
    ] = await Promise.all([
      tmp_campamentos = await listarCampamentos({ IdCliente, IdDivision, IdCampamento: '%', IdPersona: usuario.idPersona })
    ]).finally(() => { setLoading(false); });

    setEstadoSimple(estadoSimple);
    setCampamentos(tmp_campamentos);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCamaExclusiva(props.dataRowEditNew);
      } else {
        props.actualizarCamaExclusiva(props.dataRowEditNew);
      }
    }
  }


  useEffect(() => {
    cargarCombos();
  }, []);


  function onValueChanged(e) {
    if (e.value != '') {
      setisDisabledOption(false);
    } else {
      setisDisabledOption(true);
    }
  }


  /**************************************************************************************************** */
  async function agregarCama(camas) {
    console.log("agregarCama|camas:", camas);
    camas.map(async (data) => {
      let { IdCampamento, IdModulo, IdHabitacion, IdCama, Cama } = data;
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdCampamento,
        IdModulo,
        IdHabitacion,
        IdCama,
        Cama
      });
    });
  }
  /**************************************************************************************************** */


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="fa fa-save"
                  type="default"
                  //text="Grabar"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={grabar}
                />
                &nbsp;
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
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "CAMP.EXCLUSIVE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item
                dataField="IdCampamento"
                label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdCampamento', settingDataField) : false}
                editorOptions={{
                  readOnly: !(modoEdicion ? isModified('IdCampamento', settingDataField) : false),
                  items: campamentos,
                  valueExpr: "IdCampamento",
                  displayExpr: "Campamento",
                  placeholder: "Seleccione..",
                  onValueChanged: ((e) => onValueChanged(e.value))
                }}
              />

              <Item
                dataField="Cama"
                isRequired={true} label={{ text: intl.formatMessage({ id: "CAMP.ROOM.BED" }), }}
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
                        disabled: isDisabledOption,
                        onClick: () => {
                          setisVisiblePopUpCamas(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: props.fechasContrato.FechaInicioContrato,
                  max: props.fechasContrato.FechaFinContrato
                }}
              />
              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                editorType="dxDateBox"
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
                  min: props.fechasContrato.FechaInicioContrato,
                  max: props.fechasContrato.FechaFinContrato
                }}
              />

              <Item />

              <Item
                alignment={"right"}
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

          {/* POPUP-> buscar cama exclusiva */}
          {isVisiblePopUpCamas && (
            <CampamentoCamaExclusivaBuscar
              showPopup={{ isVisiblePopUp: isVisiblePopUpCamas, setisVisiblePopUp: setisVisiblePopUpCamas }}
              cancelar={() => setisVisiblePopUpCamas(false)}
              agregar={agregarCama}
              uniqueId={"personasBuscarGrupoIndexPage"}
              IdCampamento={props.dataRowEditNew.IdCampamento}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CamaExclusivaEditPage);
