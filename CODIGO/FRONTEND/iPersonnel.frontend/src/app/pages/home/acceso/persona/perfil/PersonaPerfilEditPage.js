import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import Alert from '@material-ui/lab/Alert';

//Multi-idioma
import { injectIntl } from "react-intl";
import { isNotEmpty, listarEstadoSimple, dateFormat, convertyyyyMMddToDate } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { obtenerTodos as obtenerPerfiles } from "../../../../../api/acceso/perfil.api";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AccesoPerfilBuscar from "../../../../../partials/components/AccesoPerfilBuscar";
import { servicePersona } from "../../../../../api/administracion/persona.api";


const PersonaPerfilEditPage = props => {

  //multi-idioma
  const { intl, modoEdicion, settingDataField, setLoading, fechasContrato} = props;

  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpPerfil, setisVisiblePopUpPerfil] = useState(false);
  const [varFechaMinimo, setvarFechaMinimo] = useState();
  const [varFechaMaximo, setvarFechaMaximo] = useState();
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let perfiles = await obtenerPerfiles({ IdDivision: perfil.IdDivision, IdCliente: perfil.IdCliente });

    setEstadoSimple(estadoSimple);
    setPerfiles(perfiles);
  }

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)).toLocaleString() >= Date.parse(new Date(props.dataRowEditNew.FechaFin)).toLocaleString()) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPerfil(props.dataRowEditNew);
      } else {
        props.actualizarPerfil(props.dataRowEditNew);
      }
    }
  }

  const agregar = (dataPopup) => {
    const { IdPerfil, Perfil } = dataPopup[0];
    setisVisiblePopUpPerfil(false);
    if (isNotEmpty(IdPerfil)) {
      props.setDataRowEditNew({
        ...props.dataRowEditNew,
        IdPerfil: IdPerfil,
        Perfil: Perfil,
      });
    }
  };

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
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
                      {intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdPerfil" visible={false} />
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
                      disabled: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                      onClick: () => {
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
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

            </GroupItem>
          </Form>


          {/*** PopUp -> Buscar Perfil ****/}
          {isVisiblePopUpPerfil && (
            <AccesoPerfilBuscar
              dataSource={perfiles}
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpPerfil, setisVisiblePopUp: setisVisiblePopUpPerfil }}
              cancelarEdicion={() => setisVisiblePopUpPerfil(false)}
              selectionMode={"row"}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PersonaPerfilEditPage);
