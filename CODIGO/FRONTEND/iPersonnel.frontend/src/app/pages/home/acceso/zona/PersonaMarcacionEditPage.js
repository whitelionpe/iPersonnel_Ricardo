import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../partials/content/Portlet";

import { useSelector } from "react-redux";

//Multi-idioma
import { injectIntl } from "react-intl";

import { obtenerTodos as obtenerZona } from "../../../../api/administracion/zona.api";
import { obtenerTodos as obtenerPuerta } from "../../../../api/acceso/puerta.api";
import { obtenerTodos as obtenerEquipo } from "../../../../api/acceso/puertaEquipo.api";
import { obtenerTodos as obtenerTipoMarcacion } from "../../../../api/acceso/tipoMarcacion.api";
import { obtenerTodos as obtenerTipoIdentificacion } from "../../../../api/identificacion/tipoIdentificacion.api";

import { listarTipoMarcacion } from "../../../../../_metronic/utils/utils";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const PersonaMarcacionEditPage = (props) => {

  const { intl } = props;
  const perfil = useSelector((state) => state.perfil.perfilActual);
  const readOnlyRecord = props.dataRowEditNew.isReadOnly;

  const [lstZona, setlstZona] = useState([]);
  const [lstPuerta, setlstPuerta] = useState([]);
  const [lstEquipo, setlstEquipo] = useState([]);
  const [lstTipoMarcacion, setlstTipoMarcacion] = useState([]);
  const [lstTipoIdentificacion, setlstTipoIdentificacion] = useState([]);

  const [IdPuerta, setIdPuerta] = useState("");
  const [IdEquipo, setIdEquipo] = useState("");

  const classesEncabezado = useStylesEncabezado();

  async function cargarCombos() {
    let cboZona = await obtenerZona({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
    }); //string idCliente, string idDivision

    let cboTipoMarcacion = await obtenerTipoMarcacion();
    let cboTipoIdentificacion = await obtenerTipoIdentificacion();

    setlstZona(cboZona);
    setlstTipoMarcacion(cboTipoMarcacion);
    setlstTipoIdentificacion(cboTipoIdentificacion);

    if (!props.dataRowEditNew.esNuevoRegistro) {
      let parametros = {
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdZona: props.dataRowEditNew.IdZona,
        IdPuerta: props.dataRowEditNew.IdPuerta,
        IdEquipo: props.dataRowEditNew.IdPuerta,
      };

      let cboPuerta = await obtenerPuerta(parametros);
      let cboEquipo = await obtenerEquipo(parametros);

      setIdPuerta(parametros.IdPuerta);
      setlstPuerta(cboPuerta);
      setIdEquipo(parametros.IdEquipo);
      setlstEquipo(cboEquipo);
    }
  }



  async function onValueChangedZona(value) {
    let cboPuerta = await obtenerPuerta({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdZona: value,
    });

    setIdPuerta(value);
    setlstPuerta(cboPuerta);
  }

  async function onValueChangedPuerta(value) {
    let cboEquipo = await obtenerEquipo({
      IdCliente: perfil.IdCliente,
      IdDivision: perfil.IdDivision,
      IdZona: IdPuerta,
      IdPuerta: value,
    });

    setIdEquipo(value);
    setlstEquipo(cboEquipo);

  }

  useEffect(() => {
    props.dataRowEditNew.IdPersona = props.varIdPersona;
    cargarCombos();
  }, []);

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={2}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
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

      <PortletBody>
        <React.Fragment>
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion">
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
              {/* ========================================================================== */}

              <SimpleItem dataField="IdPersona" visible={false}></SimpleItem>
              <SimpleItem dataField="IdSecuencial" visible={false}></SimpleItem>
              <SimpleItem dataField="IdVehiculo" visible={false}></SimpleItem>


              <Item
                colSpan={1}
                dataField="NombreCompleto"
                isRequired={true}
                label={{
                  text: intl.formatMessage({ id: "ACCESS.VEHICLE.NAMES" }),
                }}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: readOnlyRecord,
                }}
              />

              <Item
                colSpan={1}
                dataField="Documento"
                isRequired={true}
                label={{
                  text: intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" }),
                }}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: readOnlyRecord,
                }}
              />


              <Item
                dataField="IdZona"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.ZONE",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: lstZona,
                  valueExpr: "IdZona",
                  displayExpr: "Zona",
                  onValueChanged: (e) => onValueChangedZona(e.value),
                  readOnly: readOnlyRecord,
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
                isRequired={true}
                editorOptions={{
                  items: lstPuerta,
                  valueExpr: "IdPuerta",
                  displayExpr: "Puerta",
                  onValueChanged: (e) => onValueChangedPuerta(e.value),
                  readOnly: readOnlyRecord,
                }}
              />

              <Item
                dataField="IdEquipo"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.EQUIPMENT",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: lstEquipo,
                  valueExpr: "IdEquipo",
                  displayExpr: "Equipo",
                  readOnly: readOnlyRecord,
                  //onValueChanged: (e) => onValueChangedEquipo(e.value),
                }}
              />

              <Item
                dataField="IdTipoMarcacion"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.MARKTYPE",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: lstTipoMarcacion,
                  valueExpr: "IdTipoMarcacion",
                  displayExpr: "TipoMarcacion",
                  readOnly: readOnlyRecord,
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
                isRequired={true}
                editorOptions={{
                  items: lstTipoIdentificacion,
                  valueExpr: "IdTipoIdentificacion",
                  displayExpr: "TipoIdentificacion",
                  readOnly: readOnlyRecord,
                }}
              />

              <Item
                dataField="Identificacion"
                isRequired={true}
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ID" }),
                }}
                editorOptions={{
                  maxLength: 20,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: readOnlyRecord,
                }}
              />

              <Item
                dataField="FechaMarca"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.DATE" }),
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="datetime"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: readOnlyRecord,
                }}
              />

              <Item
                dataField="FechaMarca"
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.HOUR" }),
                }}
                isRequired={true}
                editorType="dxDateBox"
                editorOptions={{
                  type: "time",
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "HH:mm",
                  readOnly: readOnlyRecord,
                }}
              />

              <Item
                dataField="Tipo"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.TYPE",
                  }),
                }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: listarTipoMarcacion(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: true// readOnlyRecord,
                }}
              />

              <Item
                dataField="Placa"
                isRequired={false}
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.PLATE" }),
                }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: true,// readOnlyRecord,
                }}
              />

              <Item
                dataField="Automatico"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.AUTOMATIC",
                  }),
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  value: props.dataRowEditNew.Automatico === "S" ? true : false,
                  readOnly: true,
                }}
              />

              <Item
                dataField="Online"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.ONLINE",
                  }),
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  value: props.dataRowEditNew.Online === "S" ? true : false,
                  readOnly: true,
                }}
              />

              <Item
                dataField="Entrada"
                label={{
                  text: intl.formatMessage({
                    id: "ACCESS.PERSON.MARK.CHECK",
                  }),
                }}
                editorType="dxCheckBox"
                editorOptions={{
                  value: props.dataRowEditNew.Entrada === "S" ? true : false,
                  readOnly: readOnlyRecord,
                }}
              />

              <Item
                dataField="Motivo"
                isRequired={true}
                label={{
                  text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.REASON" }),
                }}
                colSpan={2}
                editorOptions={{
                  maxLength: 100,
                  inputAttr: { style: "text-transform: uppercase" },
                  readOnly: readOnlyRecord,
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

export default injectIntl(PersonaMarcacionEditPage);
