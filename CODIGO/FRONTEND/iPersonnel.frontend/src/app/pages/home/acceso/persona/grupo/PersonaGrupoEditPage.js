import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import Alert from '@material-ui/lab/Alert';

import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import AccesoGrupoBuscar from "../../../../../partials/components/AccesoGrupoBuscar";

//Multi-idioma
import { injectIntl } from "react-intl";
import { isNotEmpty, convertyyyyMMddToDate, dateFormat } from "../../../../../../_metronic";

import { service } from "../../../../../api/administracion/personaContrato.api";
import { obtener } from "../../../../../api/sistema/configuracion.api";
import { servicePersona } from "../../../../../api/administracion/persona.api";


const PersonaGrupoEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, verGrupoPuerta, grupoPuertaData, IdCliente, IdDivision, varIdPersona, setLoading,fechasContrato } = props;
  const classesEncabezado = useStylesEncabezado();
  const [isVisiblePopUpGrupo, setisVisiblePopUpGrupo] = useState(false);

  const [varFechaMinimo, setvarFechaMinimo] = useState();
  const [varFechaMaximo, setvarFechaMaximo] = useState();
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);

 
  const [disabledSave, setDisabledSave] = useState(false);

  function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) > Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return false;
      }
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarGrupo(props.dataRowEditNew);
      } else {
        props.actualizarGrupo(props.dataRowEditNew);
      }
    }
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

  useEffect(() => { });

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
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={grabar}
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
                      {intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item dataField="IdGrupo" visible={false} />
              <Item dataField="Grupo" with="50"
                isRequired={modoEdicion}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" }) }}
                editorOptions={{
                  //readOnly: true,
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
              <Item />

            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2}>
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

            </GroupItem>
          </Form>


          {/*** PopUp -> Buscar Grupo ****/}
          {isVisiblePopUpGrupo && (
            <AccesoGrupoBuscar
              selectData={agregar}
              showPopup={{ isVisiblePopUp: isVisiblePopUpGrupo, setisVisiblePopUp: setisVisiblePopUpGrupo }}
              cancelarEdicion={() => setisVisiblePopUpGrupo(false)}
              selectionMode={"row"}
              grupoPuertaData={grupoPuertaData}
              verGrupoPuerta={verGrupoPuerta}
              IdCliente={IdCliente}
              IdDivision={IdDivision}
            />
          )}

        </React.Fragment>
      </PortletBody>
    </>
  );

};

export default injectIntl(PersonaGrupoEditPage);
