import React, { useEffect, useState } from "react";
import Form, {
  Item,
  GroupItem,
  SimpleItem
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";

import { useSelector } from "react-redux";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
//Multi-idioma
import { injectIntl } from "react-intl";

import { service } from "../../../../../api/acceso/personaGrupo.api";
import { obtenerTodos as obtenerTipoMarcacion } from "../../../../../api/acceso/tipoMarcacion.api";
import { obtenerTodos as obtenerTipoIdentificacion } from "../../../../../api/identificacion/tipoIdentificacion.api";

import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { listarModoMarcacion, listarTipoMarcacion, listarEstado, dateFormat } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import { isNotEmpty } from "../../../../../../_metronic";
import './PersonaMarcacionPage.css'
import { validar } from "../../../../../api/acceso/marcacion.api";

const PersonaMarcacionEditPage = (props) => {

  const { intl, modoEdicion, settingDataField, accessButton, setLoading, dataRowEditNew, varIdPersona,fechasContrato,modeView } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);

  const [lstZona, setlstZona] = useState([]);
  const [lstPuerta, setlstPuerta] = useState([]);
  const [lstEquipo, setlstEquipo] = useState([]);
  const [lstTipoMarcacion, setlstTipoMarcacion] = useState([]);
  const [lstTipoIdentificacion, setlstTipoIdentificacion] = useState([]);

  const [IdPuerta, setIdPuerta] = useState("");
  const [IdEquipo, setIdEquipo] = useState("");
  const [estados, setEstados] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [cadenaMarcacion, setCadenaMarcacion] = useState("");

  async function cargarCombos() {
    setLoading(true);
    let cboZona = await service.obtenerZona({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona
    }).finally(() => { 
      // setLoading(false)
     });

    let cboTipoMarcacion = await obtenerTipoMarcacion();
    let cboTipoIdentificacion = await obtenerTipoIdentificacion();

    setlstZona(cboZona);
    setlstTipoMarcacion(cboTipoMarcacion);
    setlstTipoIdentificacion(cboTipoIdentificacion);

    if (!dataRowEditNew.esNuevoRegistro) {
      let parametros = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdZona: dataRowEditNew.IdZona,
        IdPuerta: dataRowEditNew.IdPuerta,
        IdEquipo: dataRowEditNew.IdPuerta,
        IdPersona:varIdPersona
      };
      setLoading(true);
      let cboPuerta = await service.obtenerPuerta(parametros).finally(() => { 
        // setLoading(false) 
      });
      let cboEquipo = await service.obtenerEquipo(parametros).finally(() => { 
        // setLoading(false)
       });
      setIdPuerta(parametros.IdPuerta);
      setlstPuerta(cboPuerta);
      setIdEquipo(parametros.IdEquipo);
      setlstEquipo(cboEquipo);
    }

    let estados = listarEstado();
    setEstados(estados);
    setLoading(false);

  }

  const confuracionMarcacion = () => {
    const { Hash } = dataRowEditNew;
    if (isNotEmpty(Hash)) setCadenaMarcacion(Hash);
  }

  async function grabar(e) {

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


    let fechaMarca = add_hora_fecha(fecha, hora);
    dataRowEditNew.FechaMarca = fechaMarca;
    let { Entrada, Online } = dataRowEditNew;

    dataRowEditNew.Entrada = Entrada ? "S" : "N";

      //VALIDACIONES DE ACCESO INI :::::::::::::::::::::::::::::::::::::::::::
     let result = e.validationGroup.validate();
     if (result.isValid) {

       setLoading(true);
       await validar({
         ...dataRowEditNew, IdCliente: perfil.IdCliente,
         IdDivision: perfil.IdDivision,
         IdPersona: varIdPersona,
         FechaMarca: dateFormat(dataRowEditNew.FechaMarca, 'yyyyMMdd hh:mm')
       }).then(result => {
         const { Mensaje } = result[0];
         if (isNotEmpty(Mensaje)) {
           handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), Mensaje);
           return;
         }
         else {
           ///Metodo que permite registrar/Actualizar      
           if (dataRowEditNew.esNuevoRegistro) {
             props.agregarMarcacion(dataRowEditNew);
           } else {
             props.actualizarMarcacion(dataRowEditNew);
           }
         }

       }).finally(x => {
         setLoading(false);
       });
     }
      //VALIDACIONES DE ACCESO FIN :::::::::::::::::::::::::::::::::::::::::::

  }

  async function onValueChangedZona(value) {
    setLoading(true);
    let cboPuerta = await service.obtenerPuerta({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      IdZona: value,
    }).finally(() => { setLoading(false) });

    setIdPuerta(value);
    setlstPuerta(cboPuerta);
  }

  async function onValueChangedPuerta(value) {
    setLoading(true);
    let cboEquipo = await service.obtenerEquipo({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdPersona: varIdPersona,
      IdZona: IdPuerta,
      IdPuerta: value,
    }).finally(() => { setLoading(false) });

    setIdEquipo(value);
    setlstEquipo(cboEquipo);

  }

  useEffect(() => {
    cargarCombos();
    confuracionMarcacion();
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
          />
        }
      />

      <PortletBody>
        <React.Fragment>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion">
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

              <SimpleItem dataField="IdPersona" visible={false}></SimpleItem>
              <SimpleItem dataField="IdSecuencial" visible={false}></SimpleItem>
              <SimpleItem dataField="IdVehiculo" visible={false}></SimpleItem>

              <Item colSpan={2}
                label={{ visible: false }}
              >
                {dataRowEditNew.RegistroAlterado && (
                  <div className="detalle_barraTextHash">
                    <h6 style={{ color: "white" }}>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.MARKING.ALTERED" })}</h6>
                  </div>
                )}

              </Item>


              <Item
                dataField="IdZona"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.ZONE",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdZona', settingDataField) : false}
                editorOptions={{
                  items: lstZona,
                  valueExpr: "IdZona",
                  displayExpr: "Zona",
                  onValueChanged: (e) => onValueChangedZona(e.value),
                  readOnly: modeView ? true :false,
                }}
              />

              <Item
                dataField="IdPuerta"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.DOOR",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdPuerta', settingDataField) : false}
                editorOptions={{
                  items: lstPuerta,
                  valueExpr: "IdPuerta",
                  displayExpr: "Puerta",
                  onValueChanged: (e) => onValueChangedPuerta(e.value),
                  readOnly:  modeView  ? true :false,
                }}
              />

              <Item
                dataField="IdEquipo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.EQUIPMENT" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdEquipo', settingDataField) : false}
                editorOptions={{
                  items: lstEquipo,
                  valueExpr: "IdEquipo",
                  displayExpr: "Equipo",
                  readOnly:  modeView ? true :false,
                }}
              />

              <Item
                dataField="Entrada"
                label={{ text: intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.MODE" }) }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: listarModoMarcacion(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly:  modeView ? true :false,
                }}
              />

              <Item
                dataField="FechaCorta"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }),
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: modeView ? true :false,
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item
                dataField="Minutos"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" }),
                }}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "time",
                  displayFormat: "HH:mm",
                  readOnly: modeView ? true :false,
                }}
              />

              <Item
                dataField="AccesoNegado"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.GRANTED" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('AccesoNegado', settingDataField) : false}
                editorOptions={{
                  readOnly: true,
                  items: estados,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

              <Item
                dataField="Motivo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.REASON" }) }}
                isRequired={modoEdicion ? isRequired('Motivo', settingDataField) : false}
                colSpan={1}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: modeView ? true :false,
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.REASON" }),
                  width: "100%"
                }}
              />


              <Item
                dataField="IdTipoIdentificacion"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.IDTYPE",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('IdTipoIdentificacion', settingDataField) : false}
                editorOptions={{
                  items: lstTipoIdentificacion,
                  valueExpr: "IdTipoIdentificacion",
                  displayExpr: "TipoIdentificacion",
                  readOnly: true,
                }}
              />

              <Item
                dataField="Identificacion"
                isRequired={modoEdicion ? isRequired('Identificacion', settingDataField) : false}
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ID" }),
                }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true,
                }}
              >
              </Item>



              <Item
                dataField="Tipo"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.TYPE",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired('Tipo', settingDataField) : false}
                editorOptions={{
                  items: listarTipoMarcacion(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: true

                }}
              />

              <Item
                dataField="Placa"
                isRequired={modoEdicion ? isRequired('Placa', settingDataField) : false}
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.PLATE" }),
                }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: modeView ? true :false,
                }}
              />


              <Item dataField="Hash"
                visible={false}
                editorOptions={{
                  value: isNotEmpty(cadenaMarcacion) ? cadenaMarcacion : dataRowEditNew.Hash
                }}
              />
            </GroupItem>

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ADMINISTRATION.PERSON.MARKING.DATA" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

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
                  readOnly: true,

                }}
              />
            </GroupItem>

            <GroupItem>
          <Item
                dataField="MotivoEliminacion"
                label={{ text: intl.formatMessage({ id: "CASINO.MARKING.REASONDELETE" }), }}
                visible={ isNotEmpty(props.dataRowEditNew.MotivoEliminacion) ? true :false }
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

            {/* ========================================================================== */}

          </Form>
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

export default injectIntl(WithLoandingPanel(PersonaMarcacionEditPage));
