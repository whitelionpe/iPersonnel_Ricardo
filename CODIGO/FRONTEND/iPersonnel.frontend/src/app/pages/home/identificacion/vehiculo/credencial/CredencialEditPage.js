
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { useSelector } from "react-redux";
import { serviceTipoCredencial } from "../../../../../api/identificacion/tipoCredencial.api";
import { obtenerTodos as obtenerTodosMotivos } from "../../../../../api/identificacion/motivo.api";
import { obtenerTodos as obtenerMotivos } from "../../../../../api/identificacion/motivo.api";
import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { listarEstadoSimple, listarEstado, PatterRuler, isNotEmpty, TYPE_SISTEMA_ENTIDAD } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { serviceVehiculoCredencial } from "../../../../../api/identificacion/vehiculoCredencial.api";
import { serviceLocal } from "../../../../../api/serviceLocal.api";

const CredencialEditPage = props => {
  const { intl, accessButton, modoEdicion, settingDataField, setLoading, foto, varIdVehiculo, fechasContrato, dataRowEditNew } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listadoSimple, setListadoSimple] = useState([]);
  const [listaTipoCredencial, setListaTipoCredencial] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [motivos, setMotivos] = useState([]);

  async function cargarCombos() {
    let lstTipoCredencial = await serviceTipoCredencial.obtenerTodos({ IdCliente: perfil.IdCliente });
    let lstMotivos = await obtenerTodosMotivos({ IdCliente: perfil.IdCliente });
    let dataMotivos = await obtenerMotivos({ IdCliente: perfil.IdCliente });
    setListaTipoCredencial(lstTipoCredencial.filter(x => x.IdEntidad === TYPE_SISTEMA_ENTIDAD.VEHICULOS));
    setEstadoSimple(listarEstadoSimple());
    setListadoSimple(listarEstado());
    setMotivos(dataMotivos);
  }

  const isRequiredRule = (id) => {
    return isRequired(id, settingDataField);
  }

  useEffect(() => {
    cargarCombos();

  }, []);


  const grabar = (e) => {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) >= Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return
      }

      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarCredencial(dataRowEditNew);
      } else {
        props.actualizarCredencial(dataRowEditNew);
      }
    }
  }

  const fnPrintFotoCheck = async () => {
    //Función para imprimir PrintBadge IdEntidad: V de Vehiculo
    //1-Obtener estructura de datos de base de datos
    //2-LocalHost: Generar Archivos: XX.Data, imagen, .BAT
    //3-Abrir archivo programar PrintBadge.Exe 
    //4-Actualizar registro como impreso.
    setLoading(true);
    await serviceVehiculoCredencial.obtenerPrintBadge(dataRowEditNew).then(async (data) => {
      await serviceLocal.PrintBadge({ data, Codigo: varIdVehiculo, Foto: foto }).then(response => {
        dataRowEditNew.Impreso = 'IMPRIMIR'//controlar una sola impresión. 
        dataRowEditNew.FechaImpreso = dataRowEditNew.FechaFin;
        //Update
        props.actualizarCredencial(dataRowEditNew, 'S');
      });
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    }).finally(() => { setLoading(false); });

  }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>

                <Button
                  icon="fa fa-print"
                  type="default"
                  hint={intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.PRINT" })}
                  onClick={fnPrintFotoCheck}
                  disabled={!dataRowEditNew.esNuevoRegistro && dataRowEditNew.Impreso === "N" ? false : true}
                />
                &nbsp;
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
        } />

      <PortletBody >
        <React.Fragment>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
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

              <Item dataField="Credencial"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.CREDENTIAL" }) }}
                editorOptions={{
                  readOnly: true,
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                }}
              />

              <Item />

              <Item
                dataField="IdMotivo"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.REASON" }), }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: motivos,
                  valueExpr: "IdMotivo",
                  displayExpr: "Motivo",
                  showClearButton: true
                }}
              />

              <Item
                dataField="IdTipoCredencial"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.TYPECREDENTIAL" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdTipoCredencial', settingDataField) : false}
                editorOptions={{
                  items: listaTipoCredencial,
                  valueExpr: "IdTipoCredencial",
                  displayExpr: "TipoCredencial",
                  // disabled: dataRowEditNew.Impreso == "S",
                  readOnly: !(modoEdicion ? isModified('IdTipoCredencial', settingDataField) : false),
                  showClearButton: true

                }}
              />

              <Item dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.STARTDATE" }) }}
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
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.ENDDATE" }) }}
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
                dataField="Impreso"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.PRINTED" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('Impreso', settingDataField) : false}
                editorOptions={{
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  showClearButton: true,
                  readOnly: true,
                }}
              >
              </Item>

              <Item dataField="FechaImpreso"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.PRINTEDDATE" }) }}
                isRequired={false}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy HH:mm",
                  readOnly: true,
                }}
              />

              <Item dataField="CodigoReferencia"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.VEHICLE.REFERENCECODE" }) }}
                isRequired={modoEdicion ? isRequired('CodigoReferencia', settingDataField) : false}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: !(modoEdicion ? isModified('CodigoReferencia', settingDataField) : false)
                }}
              >
                {(isRequiredRule("CodigoReferencia")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />

              <Item dataField="Observacion"
                colSpan={2}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.EXONERACION.OBSERVATION" }) }}
                isRequired={modoEdicion ? isRequired('Observacion', settingDataField) : false}
                editorOptions={{
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  maxLength: 500,
                  height: 50,
                  readOnly: !(modoEdicion ? isModified('Observacion', settingDataField) : false)
                }}
              >
                {(isRequiredRule("Observacion")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={500} />}
                <PatternRule pattern={PatterRuler.LETRAS_DESCRIPCION} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS" })} />
              </Item>

            </GroupItem>
          </Form>


        </React.Fragment>
      </PortletBody>


    </>
  );
};


export default injectIntl(WithLoandingPanel(CredencialEditPage));
