import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import Form, { Item, GroupItem, RequiredRule, PatternRule, StringLengthRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import { listarEstadoSimple, isNotEmpty,dateFormat, convertyyyyMMddToDate } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { ObtenerPlanillaPorCompania } from "../../../../../api/asistencia/planilla.api";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import Alert from '@material-ui/lab/Alert';
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { servicePersona } from "../../../../../api/administracion/persona.api";

const PersonaPlanillaEditPage = props => {

  const { intl, modoEdicion, settingDataField, accessButton, varIdPersona,fechasContrato } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [dataPlanilla, setDataPlanilla] = useState([]);
  const [isVisiblePopUpCompaniaMandante, setisVisiblePopUpCompaniaMandante] = useState(false);
  const [companiaContratista, setCompaniaContratista] = useState("N");
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [isVisibleAlertPosicion, setIsVisibleAlertPosicion] = useState(false);

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let dataPlanilla = await ObtenerPlanillaPorCompania({
      IdCliente: IdCliente,
      IdCompania: '%',
      IdPersona: varIdPersona,
    });

    setEstadoSimple(estadoSimple);
    setDataPlanilla(dataPlanilla);

    if (dataPlanilla.length === 0) {
      setIsVisibleAlert(true);
    } else {
      setIsVisibleAlert(false);
    }

  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarPersonaPlanilla(props.dataRowEditNew);
      } else {
        props.actualizarPersonaPlanilla(props.dataRowEditNew);
      }
    }
  }

  const selectCompaniaMandante = (mandante) => {
    const { IdCompania, Compania } = mandante[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.CompaniaMandante = Compania;
    props.dataRowEditNew.CompaniaMandante = Compania;
  }

  const onValueChangedPlanilla = (e) => {
    const resultado = dataPlanilla.find(x => x.IdPlanilla === e.value);
    if (resultado) {
      props.dataRowEditNew.IdCompania = resultado.IdCompania;
    }
  }

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
                  disabled={isVisibleAlertPosicion}
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

      {isVisibleAlert && (
        <Alert severity="warning" variant="outlined">
          <div style={{ color: 'red' }} >
            {intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.MSG1" })} {" "} {intl.formatMessage({ id: "ASSISTANCE.PAYROLL.MSG2" })}
          </div>
        </Alert>
      )}

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

              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item
                  dataField="IdPlanilla"
                  label={{ text: intl.formatMessage({ id: "ASSISTANCE.PAYROLL" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    maxLength: 20,
                    items: dataPlanilla,
                    valueExpr: "IdPlanilla",
                    displayExpr: "Planilla",
                    onValueChanged: (e) => onValueChangedPlanilla(e),
                     readOnly: !modoEdicion ? (!props.dataRowEditNew.esNuevoRegistro ? true : false) : false
                    //readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                  }}
                />

              </GroupItem>


              <Item
                colSpan={1}
                visible={false}
                dataField="CompaniaMandante"
                isRequired={modoEdicion ? isRequired('IdCompania', settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ASSISTANCE.SPECIAL.CONDITIONS.COMAPNY" }), }}
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
                        disabled: !props.dataRowEditNew.esNuevoRegistro,
                        onClick: (evt) => {
                          setCompaniaContratista("N");
                          setisVisiblePopUpCompaniaMandante(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" }) }}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" }) }}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
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

              <Item dataField="IdCliente" visible={false} />

            </GroupItem>
          </Form>
          <AdministracionCompaniaBuscar
            selectData={selectCompaniaMandante}
            showPopup={{ isVisiblePopUp: isVisiblePopUpCompaniaMandante, setisVisiblePopUp: setisVisiblePopUpCompaniaMandante }}
            cancelarEdicion={() => setisVisiblePopUpCompaniaMandante(false)}
            uniqueId={"administracionCompaniaMandanteBuscar"}
            contratista={companiaContratista}
          />

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PersonaPlanillaEditPage);
