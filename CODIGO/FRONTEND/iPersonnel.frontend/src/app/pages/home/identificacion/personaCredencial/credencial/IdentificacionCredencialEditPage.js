
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  //SimpleItem,
  //ButtonItem,
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
//import Alert from '@material-ui/lab/Alert';

import { serviceTipoCredencial } from "../../../../../api/identificacion/tipoCredencial.api";
import { obtenerTodos as obtenerTodosMotivos } from "../../../../../api/identificacion/motivo.api";
import { obtenerTodos as obtenerMotivos } from "../../../../../api/identificacion/motivo.api";

import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";

import { listarEstadoSimple, listarEstado, PatterRuler, TYPE_SISTEMA_ENTIDAD } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import { serviceLocal } from "../../../../../api/serviceLocal.api";
import { ServicePersonaCredencial } from "../../../../../api/identificacion/personaCredencial.api"
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const IdentificacionCredencialEditPage = props => {
  const { intl, modoEdicion, settingDataField, setLoading, dataRowEditNew, varIdPersona, foto, fechasContrato, credencialAutogenerado } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);
  const [listaMotivosEmision, setListaMotivosEmision] = useState([]);
  const [listaTipoCredencial, setListaTipoCredencial] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [motivos, setMotivos] = useState([]);

  // const [varFechaMinimo, setvarFechaMinimo] = useState();
  // const [varFechaMaximo, setvarFechaMaximo] = useState();
  // const [isVisibleAlert, setIsVisibleAlert] = useState(false);

  async function cargarCombos() {

    let lstTipoCredencial = await serviceTipoCredencial.obtenerTodos({ IdCliente: perfil.IdCliente });
    let lstMotivos = await obtenerTodosMotivos({ IdCliente: perfil.IdCliente });
    let dataMotivos = await obtenerMotivos({ IdCliente: perfil.IdCliente });

    setListaTipoCredencial(lstTipoCredencial.filter(x => x.IdEntidad === TYPE_SISTEMA_ENTIDAD.PERSONAS));
    setListaMotivosEmision(lstMotivos.filter(x => x.Emision == 'S'));
    setEstadoSimple(listarEstadoSimple());
    setMotivos(dataMotivos);

  }


  const isRequiredRule = (id) => {
    return isRequired(id, settingDataField);
  }


  useEffect(() => {
    cargarCombos();
  }, []);

  // const obtenerPersonaPeriodo = async () => {
  //   setLoading(true);
  //   await servicePersona.obtenerPeriodo({
  //     IdCliente: perfil.IdCliente,
  //     IdPersona: varIdPersona,
  //     FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
  //     FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
  //   }).then(response => {
  //     if (response) {
  //       if (!isNotEmpty(response.MensajeValidacion)) {
  //         setIsVisibleAlert(false);
  //         setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
  //       } else {
  //         setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
  //         setIsVisibleAlert(true);
  //         handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
  //       }
  //     }
  //   }).finally(x => {
  //     setLoading(false);
  //   });
  // }

  async function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (Date.parse(new Date(props.dataRowEditNew.FechaInicio)) >= Date.parse(new Date(props.dataRowEditNew.FechaFin))) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" }));
        return
      }

      //console.log("ataRowEditNew.esNuevoRegistro",dataRowEditNew.esNuevoRegistro);

      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarPersonaCredencial(dataRowEditNew);
      } else {
        props.actualizarPersonaCredencial(dataRowEditNew);
      }

    }
  }

  const fnPrintFotoCheck = async () => {
    //Función para imprimir PrintBadge IdEntidad: P de Personas 
    //1-Obtener estructura de datos de base de datos
    //2-LocalHost: Generar Archivos: XX.Data, imagen, .BAT
    //3-Abrir archivo programar PrintBadge.Exe 
    //4-Actualizar registro como impreso.
    setLoading(true);
    //Get Data
    await ServicePersonaCredencial.obtenerPrintBadge(dataRowEditNew).then(async (data) => {
      //Print
      //Obtener Foto
      await serviceLocal.PrintBadge({ data, Codigo: varIdPersona, Foto: foto }).then(response => {
        //console.log("response-localhost-printBadge-->", response);
        //if (response) handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.PRINT.SUCESS" }));
        //dataRowEditNew.Impreso = 'IMPRIMIR'//controlar una sola impresión. 
        dataRowEditNew.FechaImpreso = dataRowEditNew.FechaFin;
        //Update
        props.actualizarPersonaCredencial(dataRowEditNew, 'S');
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
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
            
            <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item dataField="IdCliente" visible={false} />
                <Item dataField="IdPersona" visible={false} />
                <Item dataField="IdSecuencial" visible={false} />
                {/*++++++++CONFIGURACION CREDENCIAL AUTOGENERADO+++++++++++*/}

                <Item dataField="Credencial"
                  label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.CREDENTIAL" }) }}
                  visible={credencialAutogenerado ? true : false}
                  editorOptions={{
                    readOnly: true,
                    maxLength: 50,
                    inputAttr: { style: "text-transform: uppercase" },
                    placeholder: intl.formatMessage({ id: "COMMON.CODE.AUTO" })
                  }}
                >
                  <StringLengthRule min={props.valorMinimoTexto} message={intl.formatMessage({ id: "IDENTIFICATE.CREDENTIAL.LENGTH" }) + ` ${props.valorMinimoTexto}`} />
                  {/* <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> */}
                  {/* <PatternRule pattern={PatterRuler.LETRAS_NUMEROS_GUIONES} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} /> */}
                </Item>

                {/*++++++++ USUARIO INGRESA CREDENCIAL  OBLIGATORIO+++++++++++*/}
                <Item dataField="Credencial"
                  label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.CREDENTIAL" }) }}
                  isRequired={true}
                  visible={!credencialAutogenerado ? true : false}                  
                  editorOptions={{
                    readOnly: false,
                    maxLength: 50,
                    inputAttr: { style: "text-transform: uppercase" },
                    placeholder: '',
                    focusStateEnabled:true
                  }}
                >
                  <StringLengthRule min={props.valorMinimoTexto} message={intl.formatMessage({ id: "IDENTIFICATE.CREDENTIAL.LENGTH" }) + ` ${props.valorMinimoTexto}`} />
                  <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
                  <PatternRule pattern={PatterRuler.SOLO_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.NUMERIC.DATA" })} />
                </Item>

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


                <Item dataField="CodigoReferencia1"
                  label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.REFERENCECODE" }) }}
                  isRequired={modoEdicion ? isRequired('CodigoReferencia1', settingDataField) : false}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { style: "text-transform: uppercase" },
                    readOnly: !(modoEdicion ? isModified('CodigoReferencia1', settingDataField) : false)
                  }}
                >
                  {(isRequiredRule("CodigoReferencia1")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                  <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

                <Item dataField="CodigoReferencia2"
                  label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.REFERENCECODE2" }) }}
                  isRequired={modoEdicion ? isRequired('CodigoReferencia2', settingDataField) : false}
                  editorOptions={{
                    maxLength: 50,
                    inputAttr: { style: "text-transform: uppercase" },
                    readOnly: !(modoEdicion ? isModified('CodigoReferencia2', settingDataField) : false)
                  }}
                >
                  {(isRequiredRule("CodigoReferencia2")) ? <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} /> : <StringLengthRule max={50} />}
                  <PatternRule pattern={PatterRuler.LETRAS_NUMEROS} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
                </Item>

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
                <Item />
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

              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" }) && intl.formatMessage({ id: "IDENTIFICATION.PRINT" })}>
            <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item
                  dataField="Impreso"
                  label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.PRINTED" }) }}
                  editorType="dxSelectBox"
                  //isRequired={modoEdicion ? isRequired('Impreso', settingDataField) : false}
                  editorOptions={{
                    items: listarEstado(),//listadoSimple,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    showClearButton: true,
                    readOnly: true,
                    //onValueChanged: (e) => onValueChangedImpreso(e.value),
                  }}
                >
                </Item>

                <Item dataField="FechaImpreso"
                  label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.PRINTEDDATE" }) }}
                  isRequired={false}
                  editorType="dxDateBox"
                  dataType="date"
                  editorOptions={{
                    //value: dataRowEditNew.esNuevoRegistro ? valueFechaImpresion : isNotEmpty(dataRowEditNew.FechaImpreso) ? dataRowEditNew.FechaImpreso : valueFechaImpresion,
                    displayFormat: "dd/MM/yyyy HH:mm",
                    readOnly: true,
                  }}
                />


              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
        </React.Fragment>
      </PortletBody>


    </>
  );
};


export default injectIntl(WithLoandingPanel(IdentificacionCredencialEditPage));
