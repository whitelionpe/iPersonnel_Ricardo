import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { obtenerTodos as obtenerCmbComedor } from "../../../../api/casino/comedor.api";
import { obtenerTodos as obtenerCmbServicio } from "../../../../api/casino/comedorServicio.api";
import { obtenerTodos as obtenerTipoIdentificacion } from "../../../../api/identificacion/tipoIdentificacion.api";
import { obtenerTodos as obtenerEquipo } from "../../../../api/casino/comedorEquipo.api";

import { listarEstado, isNotEmpty } from "../../../../../_metronic";
import { isRequired } from "../../../../../_metronic/utils/securityUtils";

import { obtenerCentroCostoMarcacion } from "../../../../api/administracion/centroCosto.api";
import '../../../../pages/home/acceso/persona/marcacion/PersonaMarcacionPage.css';
import HeaderInformation from "../../../../partials/components/HeaderInformation";


const MarcacionEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, dataRowEditNew, setLoading, setDataRowEditNew, fechasContrato, modeView } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  //const [estadoSimple, setEstadoSimple] = useState([]);
  const [cmbComedor, setCmbComedor] = useState([]);
  const [cmbServicio, setCmbServicio] = useState([]);
  const [lstTipoIdentificacion, setlstTipoIdentificacion] = useState([]);
  const [lstEquipo, setlstEquipo] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  const [cadenaMarcacion, setCadenaMarcacion] = useState("");
  const [automaticoReadOnly, setAutomaticoReadOnly] = useState(false);
  //const [estados, setEstados] = useState([]);

  async function cargarCombos() {

    //let estadoSimple = listarEstado();

    let cmbComedorX = await obtenerCmbComedor({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdTipo: '%' });
    let cboTipoIdentificacion = await obtenerTipoIdentificacion();

    if (!dataRowEditNew.esNuevoRegistro) {
      CargarEquipo(dataRowEditNew.IdComedor);
      CargarServicios(dataRowEditNew.IdComedor);
      setTimeout(() => {
        onValueChangedServicio(dataRowEditNew.IdServicio)
      }, 500)
    }

    let CentroCostoBE = await obtenerCentroCostoMarcacion({ IdCliente: perfil.IdCliente, IdPersona: dataRowEditNew.IdPersona, IdCompania: '%' });
    dataRowEditNew.IdCentroCosto = CentroCostoBE.IdCentroCosto;
    dataRowEditNew.CentroCosto = CentroCostoBE.CentroCosto;

    //setEstadoSimple(estadoSimple);
    setCmbComedor(cmbComedorX);
    setlstTipoIdentificacion(cboTipoIdentificacion);

    //let estados = listarEstado();
    //setEstados(estados);
    setAutomaticoReadOnly(dataRowEditNew.Automatico === 'N' ? false : false);

  }

  async function CargarServicios(idComedor) {
    // setLoading(true)
    let cmbServicioX = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: idComedor }).finally(() => { setLoading(false) });
    setCmbServicio(cmbServicioX);

  }

  async function CargarEquipo(idComedor) {
    // setLoading(true)
    let cboEquipo = await obtenerEquipo({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdComedor: idComedor
    }).finally(() => { setLoading(false) });

    setlstEquipo(cboEquipo);
  }

  const confuracionMarcacion = () => {
    const { Hash } = dataRowEditNew;
    if (isNotEmpty(Hash)) setCadenaMarcacion(Hash);
  }



  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (dataRowEditNew.esNuevoRegistro) {
        props.agregar(dataRowEditNew);
      } else {
        props.actualizar(dataRowEditNew);
      }
    }
  }

  function onValueChangedComedor(value) {
    dataRowEditNew.IdServicio = '';
    dataRowEditNew.IdEquipo = '';
    if (isNotEmpty(value)) {
      CargarEquipo(value);
      CargarServicios(value);
    }

  }

  async function onValueChangedServicio(value) {
    if (isNotEmpty(value)) {
      let cmbServicioX = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: dataRowEditNew.IdComedor }).finally(() => { setLoading(false) });
      let dataFilter = cmbServicioX.filter(x => x.IdServicio === value);
      let ValorMaximoConsumo = dataFilter[0].NumeroConsumos;

      if (dataFilter[0].Especial === "S") {
        let NumeroServicios = dataRowEditNew.esNuevoRegistro ? 1 : dataRowEditNew.NumeroServicios;
        setDataRowEditNew({
          ...dataRowEditNew,
          NumeroServicios,
          Especial: true,
          ValorMaximoConsumo
        });
      } else {
        setDataRowEditNew({
          ...dataRowEditNew,
          NumeroServicios: 1,
          Especial: false,
          ValorMaximoConsumo: 1
        });
      }
    }
  }



  useEffect(() => {
    dataRowEditNew.IdPersona = props.varIdPersona;
    cargarCombos();
    confuracionMarcacion();
  }, []);


  const DatosGenerales = (e) => {
    return (
      <>

        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item dataField="IdPersona" visible={false} />
            <Item dataField="IdSecuencial" visible={false} />

            <Item
              dataField="IdComedor"
              label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM" }) }}
              editorType="dxSelectBox"
              isRequired={true} // Es obligatorio por regla
              editorOptions={{
                items: cmbComedor,
                valueExpr: "IdComedor",
                displayExpr: "Comedor",
                readOnly: modeView ? true : automaticoReadOnly,
                onValueChanged: (e) => onValueChangedComedor(e.value),

              }}
            />

            <Item
              dataField="IdServicio"
              editorType="dxSelectBox"
              label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" }) }}
              isRequired={true} // Es obligatorio por regla
              editorOptions={{
                items: cmbServicio,
                valueExpr: "IdServicio",
                displayExpr: function (item) {
                  if (item) {
                    return item.Servicio + "- [" + item.HoraInicio + " " + item.HoraFin + "]" + (item.Especial === "S" ? " - " + intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.SPECIAL" }).toUpperCase() : "");
                  }
                },
                readOnly: modeView ? true : automaticoReadOnly,
                onValueChanged: (e) => onValueChangedServicio(e.value)
              }}
            />

            <Item
              dataField="IdEquipo"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.EQUIPMENT", }), }}
              editorType="dxSelectBox"
              isRequired={true} // Es obligatorio por regla
              editorOptions={{
                items: lstEquipo,
                valueExpr: "IdEquipo",
                displayExpr: "Equipo",
                readOnly: modeView ? true : automaticoReadOnly,

              }}
            />
            <Item
              dataField="FechaMarca"
              label={{
                text: intl.formatMessage({ id: "CASINO.MARKING.DATEMARKING" }),
              }}
              isRequired={true} // Es obligatorio por regla
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                type: "datetime",
                inputAttr: { style: "text-transform: uppercase" },
                displayFormat: "dd/MM/yyyy HH:mm",
                readOnly: modeView ? true : automaticoReadOnly,
                min: fechasContrato.FechaInicioContrato,
                max: fechasContrato.FechaFinContrato
              }}
            />

            <Item
              dataField="NumeroServicios"
              label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.CONSUMPTION.NUMBER", }), }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: (dataRowEditNew.Especial) ? false : true,
                inputAttr: { style: "text-transform: uppercase; text-align: right", },
                showSpinButtons: true,
                showClearButton: false,
                min: 1,
                max: parseInt(dataRowEditNew.ValorMaximoConsumo)
              }}
            >
              <PatternRule
                pattern={/[0-9]/}
                message={intl.formatMessage({
                  id: "COMMON.ENTER.NUMERIC.DATA",
                })}
              />
            </Item>

            <Item
              dataField="ConsumoNegado"
              label={{ text: intl.formatMessage({ id: "CASINO.MARKING.CONSUMTIONDENIED" }) }}
              visible={!dataRowEditNew.esNuevoRegistro ? true : false}
              editorType="dxSelectBox"
              editorOptions={{
                readOnly: true,
                items: listarEstado(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
              }}
            />
            <Item
              colSpan={2}
              dataField="TipoMarcacion"
              label={{ text: intl.formatMessage({ id: "COMMON.OBSERVATION" }), }}
              visible={!dataRowEditNew.esNuevoRegistro ? true : false}
              editorType="dxTextArea"
              editorOptions={{
                readOnly: true,
                maxLength: 500,
                inputAttr: { style: "text-transform: uppercase" },
                width: "100%",
                height: 45,                
              }}
            />

          </GroupItem>

          <GroupItem>
            <Item
              dataField="MotivoEliminacion"
              label={{ text: intl.formatMessage({ id: "CASINO.MARKING.REASONDELETE" }), }}
              visible={isNotEmpty(dataRowEditNew.MotivoEliminacion) ? true : false}
              editorType="dxTextArea"
              editorOptions={{
                maxLength: 500,
                inputAttr: { style: "text-transform: uppercase" },
                width: "100%",
                height: 70,
                readOnly: false,
              }}
            />
          </GroupItem>
        </Form>
      </>
    );
  }

  const DatosPersona = (e) => {
    return (
      <>
        <Form formData={dataRowEditNew} validationGroup="FormEdicion">
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="IdTipoIdentificacion"
              label={{ text: intl.formatMessage({ id: "CASINO.MARKING.DOCUMENTTYPE" }) }}
              editorType="dxSelectBox"
              isRequired={modoEdicion ? isRequired('IdTipoIdentificacion', settingDataField) : false}
              editorOptions={{
                items: lstTipoIdentificacion,
                valueExpr: "IdTipoIdentificacion",
                displayExpr: "TipoIdentificacion",
                readOnly: true
              }}
            />

            <Item
              dataField="Identificacion"
              label={{ text: intl.formatMessage({ id: "CASINO.MARKING.ID", }), }}
              isRequired={modoEdicion ? isRequired("Identificacion", settingDataField) : false}
              editorOptions={{
                maxLength: 50,
                inputAttr: { style: "text-transform: uppercase" },
                readOnly: true,
              }}
            />

            <Item
              dataField="ConsumoNegado"
              label={{ text: intl.formatMessage({ id: "CASINO.MARKING.CONSUMTIONDENIED" }) }}
              editorType="dxSelectBox"
              isRequired={modoEdicion}
              visible={false}
              editorOptions={{
                items: listarEstado(),
                valueExpr: "Valor",
                displayExpr: "Descripcion",
              }}
            />

            <Item
              colSpan={1}
              dataField="CentroCosto"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
              editorOptions={{
                readOnly: true
              }}
            />

            <Item dataField="Hash"
              visible={false}
              editorOptions={{
                value: isNotEmpty(cadenaMarcacion) ? cadenaMarcacion : dataRowEditNew.Hash
              }}
            />
          </GroupItem>
        </Form>
      </>
    );
  }

  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={6}
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
                  visible={modeView ? false : true}
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
          <Form formData={dataRowEditNew} validationGroup="FormEdicion" >
            {/* {(dataRowEditNew && dataRowEditNew.RegistroAlterado) && (
                 <GroupItem itemType="group" colCount={2} colSpan={2} >
                <Item>
                  <div className="detalle_barraTextHash">
                    <h6 style={{ color: "white" }}>{intl.formatMessage({ id: "ADMINISTRATION.PERSON.MARKING.ALTERED" })}</h6>
                  </div>
                </Item>
               
                </GroupItem>
              )} */}

            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ACCESS.REPORT.MARK" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <GroupItem colSpan={2} >
                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ACCESS.PERSON.CONSUMPTION" })} </h5>
                  </legend>
                  {DatosGenerales()}
                </fieldset>
              </GroupItem>

              <GroupItem colSpan={2} >
                <fieldset className="scheduler-border" >
                  <legend className="scheduler-border" >
                    <h5>{intl.formatMessage({ id: "ACCREDITATION.PEOPLE.EDIT" })} </h5>
                  </legend>
                  {DatosPersona()}
                </fieldset>
              </GroupItem>

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
                  items: listarEstado(),
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
                  items: listarEstado(),
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

          </Form>

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(MarcacionEditPage);
