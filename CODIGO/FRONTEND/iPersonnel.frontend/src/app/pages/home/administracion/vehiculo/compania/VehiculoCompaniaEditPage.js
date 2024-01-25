import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "devextreme-react";
import Form, { Item, GroupItem } from "devextreme-react/form";

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";

import { useStylesEncabezado } from "../../../../../store/config/Styles";
import { listarEstadoSimple } from "../../../../../../_metronic";
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";

import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty, dateFormat } from "../../../../../../_metronic";
import Alert from '@material-ui/lab/Alert';
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";

import { serviceVehiculo } from "../../../../../api/administracion/vehiculo.api";


const VehiculoCompaniaEditPage = (props) => {
  const { intl, modoEdicion, settingDataField, accessButton, varIdVehiculo } = props;
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);

  const [isVisiblePopUp, setIsVisiblePopUp] = useState(false);
  const [estadoSimple, setEstadoSimple] = useState([]);
  const classesEncabezado = useStylesEncabezado();
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [fechasContrato, setFechasContrato] = useState({ FechaInicioContrato: null, FechaFinContrato: null });


  const grabar = (e) => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarCompania(props.dataRowEditNew);
      } else {
        props.actualizarCompania(props.dataRowEditNew);
      }
    }
  };

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }


  const agregarDatosGrilla = (companias) => {
    let { IdCompania, Compania } = companias[0];
    props.setDataRowEditNew({
      ...props.dataRowEditNew,
      IdCompania: IdCompania,
      Compania: Compania,
    });
  };


  const obtenerVehiculoPeriodo = async () => {
    await serviceVehiculo.obtenerPeriodo({
      IdCliente: IdCliente,
      IdVehiculo: varIdVehiculo,
      FechaInicio: dateFormat(new Date(), 'yyyyMMdd'),
      FechaFin: dateFormat(new Date(), 'yyyyMMdd'),
    }).then(response => {
      if (response) {
        if (!isNotEmpty(response.MensajeValidacion)) {
          setIsVisibleAlert(false);
          setFechasContrato({ FechaInicioContrato: response.FechaInicio, FechaFinContrato: response.FechaFin });
        } else {
          setFechasContrato({ FechaInicioContrato: null, FechaFinContrato: null });
          setIsVisibleAlert(true);
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), response.MensajeValidacion);
        }
      }
    }).finally(x => {
    });
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  useEffect(() => {
    if (varIdVehiculo) obtenerVehiculoPeriodo();
  }, [varIdVehiculo]);


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
        } />



      {isVisibleAlert && (
        <Alert severity="warning" variant="outlined">
          <div style={{ color: 'red' }} >
            {intl.formatMessage({ id: "ACCREDITATION.VEHICLE.MSG1" })}
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
              <Item dataField="IdSecuencial" visible={false} />
              <Item dataField="IdCompania" visible={false} />
              <Item
                dataField="Compania"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.VEHICLE.COMPANY",
                  }),
                }}
                isRequired={modoEdicion}
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
                        onClick: () => {
                          setIsVisiblePopUp(true);
                        },
                      },
                    },
                  ],
                }}
              />

              <Item itemType="empty" />

              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion ? isRequired('FechaInicio', settingDataField) : false}
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  //readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />
              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                editorType="dxDateBox"
                isRequired={modoEdicion ? isRequired('FechaFin', settingDataField) : false}
                dataType="date"
                editorOptions={{
                  type: "date",
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  displayFormat: "dd/MM/yyyy",
                  //readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
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

              <Item itemType="empty" />
            </GroupItem>
          </Form>


          {/* ---------------------------------------------------- */}
          <AdministracionCompaniaBuscar
            showPopup={{ isVisiblePopUp: isVisiblePopUp, setisVisiblePopUp: setIsVisiblePopUp }}
            cancelar={() => setIsVisiblePopUp(false)}
            selectData={agregarDatosGrilla}
            selectionMode={"row"}
            uniqueId={"companiabuscarVehiculoCompaniaEditPage"}
          />
          {/* ---------------------------------------------------- */}

        </React.Fragment>
      </PortletBody>
    </>
  );
}

export default injectIntl(VehiculoCompaniaEditPage);
