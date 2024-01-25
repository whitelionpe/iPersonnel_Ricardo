import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { injectIntl } from "react-intl";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import Alert from '@material-ui/lab/Alert';
import PropTypes from 'prop-types';
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { obtenerTodos as obtenerTipoIdentificacion } from "../../../../../api/identificacion/tipoIdentificacion.api";
import { obtenerTodosPorZona as obtenerPorZona, obtenerTodos as obtenerPorEquipo } from "../../../../../api/asistencia/personaEquipo.api";
// import {  serviceZonaEquipo } from "../../../../../api/asistencia/grupoZonaEquipo.api";
import { servicePersonaGrupo } from "../../../../../api/asistencia/personaGrupo.api";
import { listarEstado, isNotEmpty } from "../../../../../../_metronic";
import '../../../../../pages/home/acceso/persona/marcacion/PersonaMarcacionPage.css';
import FieldsetAcreditacion from '../../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const PersonaMarcacionEditPage = (props) => {

  const { intl, modoEdicion, settingDataField, accessButton, dataRowEditNew, setLoading, modeView } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [lstZona, setlstZona] = useState([]);
  const [lstEquipo, setlstEquipo] = useState([]);
  const [lstTipoIdentificacion, setlstTipoIdentificacion] = useState([]);
  const [dataIdentificacion, setDataIdentificacion] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [estados, setEstados] = useState([]);

  const [cadenaMarcacion, setCadenaMarcacion] = useState("");
  const [showAvisoZona, setShowAvisoZona] = useState(false);


  async function cargarCombos() {
    setLoading(true);
    let cboZona = await servicePersonaGrupo.obtenerZona({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: props.varIdPersona,
      IdModulo: props.IdModulo
    });

    let cboTipoIdentificacion = await obtenerTipoIdentificacion().finally(() => { setLoading(false); });

    let estados = listarEstado();

    setlstZona(cboZona);
    setShowAvisoZona(cboZona.length == 0 ? true : false);

    setlstTipoIdentificacion(cboTipoIdentificacion);
    setDataIdentificacion(dataIdentificacion);
    setEstados(estados);

    if (!dataRowEditNew.esNuevoRegistro) {
      let IdEquipoTmp = dataRowEditNew.IdEquipo;
      onValueChangedZona(dataRowEditNew.IdZona);
      dataRowEditNew.IdEquipo = IdEquipoTmp;
    }

    if (isNotEmpty(dataRowEditNew.IdZona) && dataRowEditNew.esNuevoRegistro) {
      let IdEquipoTmp = dataRowEditNew.IdEquipo;
      onValueChangedZona(dataRowEditNew.IdZona);
      dataRowEditNew.IdEquipo = IdEquipoTmp;
    }

  }

  const confuracionMarcacion = () => {
    const { Hash } = dataRowEditNew;
    if (isNotEmpty(Hash)) setCadenaMarcacion(Hash);
  }


  function grabar(e) {
    let fecha = dataRowEditNew.FechaCorta;
    let hora = dataRowEditNew.Minutos;

    if (dataRowEditNew.FechaCorta === undefined) {
      handleInfoMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE.VALID" })
      );
      return;
    }
    if (dataRowEditNew.Minutos === undefined) {
      handleInfoMessages(
        intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR.VALID" })
      );
      return;
    }


    //Validar Fecha y Hora - NO debe permitir registrar fecha ni hora mayor a la actual
    // const varHoraActual =0;
    // const varFechaActual = new Date();

    let fechaMarca = add_hora_fecha(fecha, hora);
    dataRowEditNew.FechaMarca = fechaMarca;
    let { Entrada, Online } = dataRowEditNew;
    dataRowEditNew.Entrada = Entrada ? "S" : "N";

    // console.log("***fechaMarca:> " ,fechaMarca);
    // console.log("***varFechaActual:> " ,varFechaActual);
    // return ;

    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarMarcacion(dataRowEditNew);
      } else {
        props.actualizarMarcacion(dataRowEditNew);
      }
    }

  }

  async function onValueChangedZona(value) {
    if (isNotEmpty(value)) {

      dataRowEditNew.IdEquipo = '';

      let cboEquipo = await servicePersonaGrupo.obtenerZonaEquipo({
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdPersona: props.varIdPersona,
        IdZona: value,
      });
      setlstEquipo(cboEquipo);
    } else {
      dataRowEditNew.IdEquipo = '';
      setlstEquipo([]);
    }

  }

  const showAlertCondicionMarcar = () => {
    return <>
      &nbsp;
      {/* !(lstZona.length > 0) */}
      {showAvisoZona ? (
        <Alert severity="warning" variant="outlined">
          <div style={{ color: 'red' }} >
            {intl.formatMessage({ id: "ASSINTANCE.MARKING.NO.ZONE" })}
          </div>
        </Alert>
      ) : (<></>)
      }
    </>
  }

  useEffect(() => {
    dataRowEditNew.IdPersona = props.varIdPersona;
    cargarCombos();
    confuracionMarcacion();
  }, []);


  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          props.showButtons ?
            (<PortletHeader
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
                    disabled={modeView}
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
            />) : (<></>)

        }
      />

      {showAlertCondicionMarcar()}

      <PortletBody>
        <React.Fragment>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
            <Form formData={dataRowEditNew} validationGroup="FormEdicion">
              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <SimpleItem dataField="IdPersona" visible={false}></SimpleItem>
                <SimpleItem dataField="IdSecuencial" visible={false}></SimpleItem>

                <Item dataField="Hash"
                  visible={false}
                  editorOptions={{
                    value: isNotEmpty(cadenaMarcacion) ? cadenaMarcacion : dataRowEditNew.Hash
                  }}
                />

                <Item
                  label={{ visible: false }}
                >
                  {dataRowEditNew.RegistroAlterado && (
                    <div className="detalle_barraTextHash">
                      <h6 style={{ color: "white" }}>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.MARKING.ALTERED" })}</h6>
                    </div>
                  )}

                </Item>

                <Item />

                <Item
                  dataField="IdZona"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ZONE", }), }}
                  editorType="dxSelectBox"
                  isRequired={true}
                  editorOptions={{
                    items: lstZona,
                    valueExpr: "IdZona",
                    displayExpr: "Zona",
                    onValueChanged: (e) => onValueChangedZona(e.value),
                    searchEnabled: true,
                    showClearButton: true,
                    readOnly: modeView ? true : false
                  }}
                />


                <Item
                  dataField="IdEquipo"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.EQUIPMENT", }), }}
                  editorType="dxSelectBox"
                  editorOptions={{
                    items: lstEquipo,
                    valueExpr: "IdEquipo",
                    displayExpr: "Equipo",
                    showClearButton: true,
                    searchEnabled: true,
                    readOnly: modeView ? true : false
                  }}
                />

                <Item
                  dataField="IdTipoIdentificacion"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.IDTYPE", }), }}
                  isRequired={true}
                  editorType="dxSelectBox"
                  editorOptions={{
                    readOnly: true,
                    items: lstTipoIdentificacion,
                    valueExpr: "IdTipoIdentificacion",
                    displayExpr: "TipoIdentificacion",
                  }}
                />

                <Item
                  dataField="Identificacion"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ID" }), }}
                  editorOptions={{
                    maxLength: 20,
                    inputAttr: { style: "text-transform: uppercase" },
                    readOnly: true, //Se obtiene el documento de la persona
                  }}
                />


                <Item
                  dataField="FechaCorta"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }) }}
                  isRequired={true}
                  editorType="dxDateBox"
                  dataType="datetime"
                  editorOptions={{
                    displayFormat: "dd/MM/yyyy",
                    readOnly: modeView ? true : false
                  }}
                />

                <Item
                  dataField="Minutos"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" }) }}
                  isRequired={true}
                  editorType="dxDateBox"
                  editorOptions={{
                    type: "time",
                    showClearButton: true,
                    maxLength: 5,
                    displayFormat: "HH:mm",
                    useMaskBehavior: true,
                    readOnly: modeView ? true : false
                  }}
                />

                <Item
                  dataField="Observacion"
                  label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }), }}
                  isRequired={true}
                  colSpan={2}
                  editorType="dxTextArea"
                  editorOptions={{
                    maxLength: 500,
                    inputAttr: { style: "text-transform: uppercase" },
                    width: "100%",
                    height: 30,
                    readOnly: modeView ? true : false
                  }}
                />

              </GroupItem>
            </Form>
          </FieldsetAcreditacion>

          <FieldsetAcreditacion title={intl.formatMessage({ id: "ADMINISTRATION.PERSON.MARKING.DATA" })}>
            <Form formData={dataRowEditNew} validationGroup="FormEdicion">
              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <Item
                  dataField="Automatico"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.AUTOMATIC" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired('Automatico', settingDataField) : false}
                  editorOptions={{
                    readOnly: true,
                    items: estados,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />

                <Item
                  dataField="Online"
                  label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ONLINE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion ? isRequired('Online', settingDataField) : false}
                  editorOptions={{
                    readOnly: true,
                    items: estados,
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                  }}
                />

                <Item
                  dataField="FechaRegistro"
                  label={{
                    text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGISTRATIONDATE" }),
                  }}
                  editorType="dxDateBox"
                  dataType="datetime"
                  editorOptions={{
                    displayFormat: "dd/MM/yyyy hh:mm",
                    readOnly: true
                  }}
                />

              </GroupItem>
              <GroupItem>
                <Item
                  dataField="MotivoEliminacion"
                  label={{ text: intl.formatMessage({ id: "CASINO.MARKING.REASONDELETE" }), }}
                  visible={isNotEmpty(props.dataRowEditNew.MotivoEliminacion) ? true : false}
                  editorType="dxTextArea"
                  editorOptions={{
                    maxLength: 500,
                    inputAttr: { style: "text-transform: uppercase" },
                    width: "100%",
                    height: 70,
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


function add_hora_fecha(fec1, fec2) {
  fec1.setHours(fec2.getHours());
  fec1.setMinutes(fec2.getMinutes());
  fec1.setSeconds(fec2.getSeconds());
  return fec1;
}

PersonaMarcacionEditPage.propTypes = {
  showButtons: PropTypes.bool
}
PersonaMarcacionEditPage.defaultProps = {
  showButtons: true
}


export default injectIntl(WithLoandingPanel(PersonaMarcacionEditPage));
