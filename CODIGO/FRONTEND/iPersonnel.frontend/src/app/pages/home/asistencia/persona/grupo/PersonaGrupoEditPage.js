import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from "devextreme-react";
import { useSelector } from "react-redux";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import Form, { Item, GroupItem } from "devextreme-react/form";

import { listarEstadoSimple, isNotEmpty } from "../../../../../../_metronic";
import AsistenciaGrupoBuscar from "../../../../../partials/components/AsistenciaGrupoBuscar";
import { serviceGrupo } from "../../../../../api/asistencia/grupo.api";



const PersonaGrupoEditPage = props => {
  const { intl, modoEdicion, accessButton, varIdCompania, verGrupoZonaEquipo, grupoZonaEquipo, dataMenu } = props;
  const classesEncabezado = useStylesEncabezado();
  const [cboGrupo, setGrupos] = useState([]);
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [isVisiblePopUpGrupo, setisVisiblePopUpGrupo] = useState(false);



  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPersonaGrupo(props.dataRowEditNew);
      } else {
        props.actualizarPersonaGrupo(props.dataRowEditNew);
      }
    }
  }


  async function cargarCombos() {
    let cboGrupo = await serviceGrupo.obtenerTodos({
      IdCliente: IdCliente,
      IdCompania: varIdCompania
    });
    setGrupos(cboGrupo);

  }


  const agregar = (dataPopup) => {
    const { IdGrupo, Grupo } = dataPopup[0];
    setisVisiblePopUpGrupo(false);
    if (isNotEmpty(IdGrupo)) {
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdGrupo: IdGrupo,
        Grupo: Grupo,
      });
    }
  };


  useEffect(() => {
    cargarCombos();
  }, []);


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
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
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
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />

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

              <Item dataField="IdCompania" visible={false} />

              <Item dataField="IdGrupo" visible={false} />
              <Item dataField="Grupo"
                //with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" }) }}
                editorOptions={{
                  readOnly: true,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                  hoverStateEnabled: false,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  showClearButton: true,
                  buttons: [{
                    name: 'search',
                    location: 'after',
                    useSubmitBehavior: true,
                    options: {
                      stylingMode: 'text',
                      icon: 'search',
                      disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: () => {
                        setisVisiblePopUpGrupo(true);
                      },
                    }
                  }]

                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                editorOptions={{
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

              <Item dataField="IdCliente" visible={false} />

            </GroupItem>
          </Form>


          {isVisiblePopUpGrupo && (
            <AsistenciaGrupoBuscar
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpGrupo, setisVisiblePopUp: setisVisiblePopUpGrupo }}
              cancelarEdicion={() => setisVisiblePopUpGrupo(false)}
              selectionMode={"row"}
              verGrupoZonaEquipo={verGrupoZonaEquipo}
              grupoZonaEquipo={grupoZonaEquipo}
              varIdCompania={varIdCompania}
              dataMenu={dataMenu}
            />
          )}


        </React.Fragment>
      </PortletBody>
    </>
  );
};



export default injectIntl(PersonaGrupoEditPage);
