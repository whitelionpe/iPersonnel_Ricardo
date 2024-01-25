import React, { useEffect, useState } from "react";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../../partials/content/Portlet";
import { useSelector } from "react-redux";
import {
  handleInfoMessages, handleSuccessMessages, handleErrorMessages
} from "../../../../../store/ducks/notify-messages";
//Multi-idioma
import { injectIntl } from "react-intl";
import { obtenerTodos as obtenerZona } from "../../../../../api/administracion/zona.api";
import { obtenerTodos as obtenerPuerta } from "../../../../../api/acceso/puerta.api";
import { obtenerTodos as obtenerEquipo } from "../../../../../api/acceso/puertaEquipo.api";
import { obtenerTodos as obtenerTipoMarcacion } from "../../../../../api/acceso/tipoMarcacion.api";
import { obtenerTodos as obtenerTipoIdentificacion } from "../../../../../api/identificacion/tipoIdentificacion.api";
import {
  eliminar as eliminarMarca
} from "../../../../../api/acceso/marcacion.api";
import { useStylesEncabezado } from "../../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import {
  listarTipoMarcacion,
  listarModoMarcacion,
  isNotEmpty,
  listarEstado,
  dateFormat
} from "../../../../../../_metronic";
import {
  isRequired,
  isModified
} from "../../../../../../_metronic/utils/securityUtils";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";
import AdministracionPersonaLicenciaBuscar from "../../../../../partials/components/AdministracionPersonaLicenciaBuscar";
import VehiculoMarcacionPasajeroListPage from "./VehiculoMarcacionPasajeroListPage";
import Confirm from "../../../../../partials/components/Confirm";
import AdministracionPersonaBuscar from "../../../../../partials/components/AdministracionPersonaBuscar";
import '../../persona/marcacion/PersonaMarcacionPage.css'
import { validarVehiculo } from "../../../../../api/acceso/marcacion.api";

const VehiculoMarcacionEditPage = props => {
  const { intl, modoEdicion, settingDataField, dataRowEditNew, setLoading, varIdTipoVehiculo,fechasContrato,varIdVehiculo,modeView } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [isVisiblePopUpPersonas, setisVisiblePopUpPersonas] = useState(false);
  const [isVisiblePopUpPasajero, setisVisiblePopUpPasajero] = useState(false);
  const [lstZona, setlstZona] = useState([]);
  const [lstPuerta, setlstPuerta] = useState([]);
  const [lstEquipo, setlstEquipo] = useState([]);
  const [lstTipoMarcacion, setlstTipoMarcacion] = useState([]);
  const [lstTipoIdentificacion, setlstTipoIdentificacion] = useState([]);
  const [IdPuerta, setIdPuerta] = useState("");
  const classesEncabezado = useStylesEncabezado();
  const [focusedRowKey, setFocusedRowKey] = useState();
  const [selected, setSelected] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [dataPasajero, setDataPasajero] = useState([]);
  const [cadenaMarcacion, setCadenaMarcacion] = useState("");
  const [estados, setEstados] = useState([]);
 


  async function cargarCombos() {
    setLoading(true);
    let cboZona = await obtenerZona({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision
    }); //string idCliente, string idDivision
    let cboTipoMarcacion = await obtenerTipoMarcacion();
    let cboTipoIdentificacion = await obtenerTipoIdentificacion().finally(() => { setLoading(false) });
    let estados = listarEstado();

    setlstZona(cboZona);
    setlstTipoMarcacion(cboTipoMarcacion);
    setlstTipoIdentificacion(cboTipoIdentificacion);
    setEstados(estados);

    //Editar - obtener datos segun los parametros registrados
    if (!dataRowEditNew.esNuevoRegistro) {
      setLoading(true);
      let parametros = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdZona: dataRowEditNew.IdZona,
        IdPuerta: dataRowEditNew.IdPuerta,
        IdEquipo: dataRowEditNew.IdPuerta
      };

      let cboPuerta = await obtenerPuerta(parametros);
      let cboEquipo = await obtenerEquipo(parametros).finally(() => {
        setLoading(false);
      });
      setIdPuerta(parametros.IdPuerta);
      setlstPuerta(cboPuerta);
      setlstEquipo(cboEquipo);
    }

  }


  const confuracionMarcacion = () => {
    const { Hash } = dataRowEditNew;
    if (isNotEmpty(Hash)) setCadenaMarcacion(Hash);
  }

  async function grabar(e) {

    let result = e.validationGroup.validate();
    if (result.isValid) {
      let fecha = dataRowEditNew.FechaCorta;
      let hora = dataRowEditNew.Minutos;

      if (dataRowEditNew.FechaCorta === undefined) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE.VALID" }));
        return;
      }
      if (dataRowEditNew.Minutos === undefined) {
        handleInfoMessages(intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR.VALID" }));
        return;
      }

      let fechaMarca = add_hora_fecha(fecha, hora);

      dataRowEditNew.FechaMarca = fechaMarca;
      dataRowEditNew.Pasajeros = dataPasajero;

        //VALIDACIONES DE ACCESO INI :::::::::::::::::::::::::::::::::::::::::::
         setLoading(true);
         await validarVehiculo({
           ...dataRowEditNew, IdCliente: perfil.IdCliente,
           IdDivision: perfil.IdDivision,
           IdVehiculo: varIdVehiculo,
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
     //VALIDACIONES DE ACCESO FIN:::::::::::::::::::::::::::::::::::::::::::

    }
  }

  async function onValueChangedZona(value) {
    setLoading(true);
    let cboPuerta = await obtenerPuerta({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdZona: value
    }).finally(() => { setLoading(false) });
    setIdPuerta(value);
    setlstPuerta(cboPuerta);
  }

  async function onValueChangedPuerta(value) {
    setLoading(true);
    let cboEquipo = await obtenerEquipo({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdZona: IdPuerta,
      IdPuerta: value
    }).finally(() => { setLoading(false) });
    setlstEquipo(cboEquipo);
  }

  const isRequiredRule = id => {
    return modoEdicion ? false : isRequired(id, settingDataField);
  };

  useEffect(() => {
    cargarCombos();
    confuracionMarcacion();
  }, []);

  useEffect(() => {
    if (isNotEmpty(props.dataPasajero)) setDataPasajero(props.dataPasajero);
  }, [props.dataPasajero]);


  const agregarPersonaChofer = (data) => {
    if (data.length > 0) {
      let persona = data[0];
      dataRowEditNew.IdPersona = persona.IdPersona;
      dataRowEditNew.Identificacion = persona.Documento;
      dataRowEditNew.NombreCompleto = persona.NombreCompleto;
    }
  }

  const agregarPersonaPasajero = (data) => {
    if (data.length > 0) {
      setDataPasajero(data.map(o => ({ ...o, FechaMarca: new Date() })));
    }
  }

  const seleccionarRegistro = dataRow => {
    const { RowIndex } = dataRow;
    //Datos Principales
    setSelected(dataRow);
    setFocusedRowKey(RowIndex);
  }

  async function eliminarRegistro(persona, confirm) {
    //Pendiente- Eliminar tabla y temporal
    const { IdSecuencial, IdPersona } = persona;

    if (IdSecuencial) {
      setIsVisible(true);
      setSelected(persona);
    } else {
      //Eliminar local
      setDataPasajero(dataPasajero.filter((item) => { return item.IdPersona !== IdPersona }))
    }
    if (confirm) {
      setLoading(true);
      const { IdCliente, IdPersona, IdSecuencial } = persona;
      await eliminarMarca({ IdCliente, IdPersona, IdSecuencial, IdProceso: "" }).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REMOVE.SUCESS" }));
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
      }).finally(() => { setLoading(false); });
    }

  }

  const nuevoRegistro = () => {
    setisVisiblePopUpPasajero(true);
  }

  return (
    <>
      <PortletHeader
        title={props.titulo}
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

      <PortletBody>
        <React.Fragment>
          <Form formData={dataRowEditNew} validationGroup="FormEdicion">
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar
                  position="static"
                  className={classesEncabezado.secundario}>
                  <Toolbar
                    variant="dense"
                    className={classesEncabezado.toolbar}>
                    <Typography
                      variant="h6"
                      color="inherit"
                      className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "COMMON.DETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              {/* ========================================================================== */}

              <SimpleItem dataField="IdPersona" visible={false}></SimpleItem>
              <SimpleItem dataField="IdSecuencial" visible={false}></SimpleItem>
              <SimpleItem dataField="IdVehiculo" visible={false}></SimpleItem>
              <SimpleItem dataField="IdProceso" visible={false}></SimpleItem>

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
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.ZONE"
                  })
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired("TipoModulo", settingDataField) : false}
                editorOptions={{
                  items: lstZona,
                  valueExpr: "IdZona",
                  displayExpr: "Zona",
                  onValueChanged: e => onValueChangedZona(e.value),
                  readOnly: modeView ? true: false
                }}
              />

              <Item
                dataField="IdPuerta"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.DOOR"
                  })
                }}
                editorType="dxSelectBox"
                isRequired={
                  modoEdicion ? isRequired("IdPuerta", settingDataField) : false
                }
                editorOptions={{
                  items: lstPuerta,
                  valueExpr: "IdPuerta",
                  displayExpr: "Puerta",
                  onValueChanged: e => onValueChangedPuerta(e.value),
                  readOnly: modeView ? true: false
                }}
              />

              <Item
                dataField="IdEquipo"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.EQUIPMENT"
                  })
                }}
                editorType="dxSelectBox"
                isRequired={
                  modoEdicion ? isRequired("IdEquipo", settingDataField) : false
                }
                editorOptions={{
                  items: lstEquipo,
                  valueExpr: "IdEquipo",
                  displayExpr: "Equipo",
                  readOnly: modeView ? true: false
                }}
              />

              <Item
                dataField="IdTipoMarcacion"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.MARKTYPE"
                  })
                }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired("IdTipoMarcacion", settingDataField) : false}
                editorOptions={{
                  items: lstTipoMarcacion,
                  valueExpr: "IdTipoMarcacion",
                  displayExpr: "TipoMarcacion",
                  readOnly: modeView ? true: false
                }}
              />

              <Item
                dataField="NombreCompleto"
                isRequired={true}
                label={{ text: intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.DRIVER" }) }}
                editorOptions={{
                  hoverStateEnabled: false,
                  inputAttr: { style: "text-transform: uppercase" },
                  showClearButton: true,
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                  buttons: [
                    {
                      name: "search",
                      location: "after",
                      useSubmitBehavior: true,
                      options: {
                        stylingMode: "text",
                        icon: "search",
                        onClick: () => {
                          setisVisiblePopUpPersonas(true);
                        },
                      },
                    },
                  ],
                }}
              />
              <Item />

              <Item
                dataField="IdTipoIdentificacion"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.IDTYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired("IdTipoIdentificacion", settingDataField) : false}
                editorOptions={{
                  items: lstTipoIdentificacion,
                  valueExpr: "IdTipoIdentificacion",
                  displayExpr: "TipoIdentificacion",
                  readOnly: true
                }}
              />

              <Item
                dataField="Identificacion"
                isRequired={modoEdicion ? isRequired("Identificacion", settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ID" }) }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true
                }}
              />

              <Item
                dataField="FechaCorta"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" })
                }}
                isRequired={
                  modoEdicion
                    ? isRequired("FechaCorta", settingDataField)
                    : false
                }
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: modeView ? true: false,
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item
                dataField="Minutos"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" })
                }}
                isRequired={
                  modoEdicion ? isRequired("Minutos", settingDataField) : false
                }
                editorType="dxDateBox"
                editorOptions={{
                  type: "time",
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "HH:mm",
                  readOnly: modeView ? true: false
                }}
              />

              <Item
                dataField="Tipo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.TYPE" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion ? isRequired("Tipo", settingDataField) : false}
                editorOptions={{
                  items: listarTipoMarcacion(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: true
                }}
              />

              <Item
                dataField="Placa"
                isRequired={modoEdicion ? isRequired("Placa", settingDataField) : false}
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.PLATE" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: modeView ? true: false
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
                  readOnly: modeView ? true: false
                }}
              />

              <Item
                dataField="Motivo"
                label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.REASON" }) }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: modeView ? true: false
                }}
              />

            </GroupItem>

            <GroupItem colCount={4}>
              {/* ========================================================================== */}
              <Item colSpan={4}>
                <AppBar
                  position="static" className={classesEncabezado.secundario}>
                  <Toolbar
                    variant="dense" className={classesEncabezado.toolbar} >
                    <Typography
                      variant="h6"
                      color="inherit"
                      className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ACCESS.VEHICLE.MARK.PASSENGERSDETAIL" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              {/* ========================================================================== */}

              <Item colSpan={4}>
                <VehiculoMarcacionPasajeroListPage
                  dataPasajero={dataPasajero}
                  eliminarRegistro={eliminarRegistro}
                  nuevoRegistro={nuevoRegistro}
                  seleccionarRegistro={seleccionarRegistro}
                  focusedRowKey={focusedRowKey}
                  accessButton={!modeView}
                />
              </Item>

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
                  readOnly: true
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

          </Form>
        </React.Fragment>
      </PortletBody>

      {/* POPUP-> buscar persona con licencia de conducir */}
      <AdministracionPersonaLicenciaBuscar
        showPopup={{ isVisiblePopUp: isVisiblePopUpPersonas, setisVisiblePopUp: setisVisiblePopUpPersonas }}
        cancelar={() => setisVisiblePopUpPersonas(false)}
        agregar={agregarPersonaChofer}
        selectionMode={"single"}
        IdTipoVehiculo={varIdTipoVehiculo}
        uniqueId={"administracionPersonasLicenciaBuscar"}
      />
      {/* POPUP-> buscar persona para pasajero */}
      <AdministracionPersonaBuscar
        showPopup={{ isVisiblePopUp: isVisiblePopUpPasajero, setisVisiblePopUp: setisVisiblePopUpPasajero }}
        cancelar={() => setisVisiblePopUpPasajero(false)}
        agregar={agregarPersonaPasajero}
        selectionMode={"multiple"}
        condicion="TRABAJADOR"
        uniqueId={"administracionPersonaBuscar"}
      />

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => eliminarRegistro(selected, true)}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

    </>
  );
};

function add_hora_fecha(fec1, fec2) {
  fec1.setHours(fec2.getHours());
  fec1.setMinutes(fec2.getMinutes());
  fec1.setSeconds(fec2.getSeconds());
  return fec1;
}

export default injectIntl(WithLoandingPanel(VehiculoMarcacionEditPage));
