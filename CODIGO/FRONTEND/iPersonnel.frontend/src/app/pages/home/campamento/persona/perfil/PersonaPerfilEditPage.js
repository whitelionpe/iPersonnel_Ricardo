import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { injectIntl } from "react-intl";
import { listarEstadoSimple, listarEstado } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { obtenerTodos as obtenerPerfiles } from "../../../../../api/acceso/perfil.api";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import CampamentoPerfilPersonaBuscar from "../../../../../partials/components/CampamentoPerfilPersonaBuscar";
import { AppBar, Toolbar, Typography } from "@material-ui/core";

const PersonaPerfilEditPage = ({
  intl,
  modoEdicion,
  settingDataField, 
  fechasContrato,
  varIdPersona,
  dataRowEditNew,
  agregarPerfil,
  actualizarPerfil,
  getInfo,
  showHeaderInformation,
  cancelarEdicion,
}) => {


  const perfil = useSelector(state => state.perfil.perfilActual);
  const [perfiles, setPerfiles] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpPerfil, setisVisiblePopUpPerfil] = useState(false);
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);

  const [filtroLocal, setFiltroLocal] = useState({ IdPersona: 0 });

  async function cargarCombos() {
    let perfiles = await obtenerPerfiles({ IdDivision: perfil.IdDivision, IdCliente: perfil.IdCliente });
    setPerfiles(perfiles);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (Date.parse(new Date(dataRowEditNew.FechaInicio)).toLocaleString() >= Date.parse(new Date(dataRowEditNew.FechaFin)).toLocaleString()) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return
      }

      if (dataRowEditNew.esNuevoRegistro) {
        agregarPerfil(dataRowEditNew);
      } else {
        actualizarPerfil(dataRowEditNew);
      }
    }
  }

  const selectCompaniaPerfil = (data) => {
    const { IdPerfil, Perfil } = data[0];
    dataRowEditNew.IdPerfil = IdPerfil;
    dataRowEditNew.Perfil = Perfil;
    setisVisiblePopUpPerfil(false);
  }

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>
      <HeaderInformation data={getInfo()} visible={showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
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
                  disabled={isVisibleAlert}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={cancelarEdicion}
                />

              </PortletHeaderToolbar>
            }
          />
        }
      />

      <PortletBody >
        <React.Fragment>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="Perfil" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" }) }}
                editorOptions={{
                  readOnly: true,
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
                      disabled: !dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: () => {
                        setFiltroLocal({ IdPersona: varIdPersona })
                        setisVisiblePopUpPerfil(true);
                      },
                    }
                  }]

                }}

              />
              <Item />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item
                dataField="CheckInSinReserva"
                label={{ text: intl.formatMessage({ id: "CAMP.CAMP.WITHIUTRESERVATION" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

              <Item
                dataField="DiasPermanencia"
                label={{ text: intl.formatMessage({ id: "CAMP.CAMP.DAYSPERMANENCE" }) }}
                editorType="dxNumberBox"
                isRequired={true}
                dataType="number"
                editorOptions={{
                  readOnly: false,
                  inputAttr: { style: "text-transform: uppercase; text-align: right" },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 1,
                  max: 99
                }}
              >
                <PatternRule pattern={/[0-9]/} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: listarEstadoSimple(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

            </GroupItem>
          </Form>

          {/*******>POPUP DE PERFIL >******** */}
          {isVisiblePopUpPerfil && (
            <CampamentoPerfilPersonaBuscar
              selectData={selectCompaniaPerfil}
              showPopup={{ isVisiblePopUp: isVisiblePopUpPerfil, setisVisiblePopUp: setisVisiblePopUpPerfil }}
              cancelar={() => setisVisiblePopUpPerfil(false)}
              uniqueId={"CampamentoPerfilPersonaBuscarCompaniaPerfil"}
              filtro={filtroLocal}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PersonaPerfilEditPage);
