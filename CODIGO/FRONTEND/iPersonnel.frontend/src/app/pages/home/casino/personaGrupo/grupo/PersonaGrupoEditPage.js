import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../../store/config/Styles";

import { isNotEmpty, listarEstadoSimple } from "../../../../../../_metronic"; 
import { isRequired, isModified } from "../../../../../../_metronic/utils/securityUtils";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

import {
  listar as listarCGrupoServicio,
} from "../../../../../api/casino/grupoServicio.api";

import { obtenerTodos as obtenerCmbCasinoGrupo } from "../../../../../api/casino/casinoGrupo.api";
 
const PersonaGrupoEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton,setLoading,fechasContrato } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);

  const classesEncabezado = useStylesEncabezado();
  const [cmbCasinoGrupo, setCmbCasinoGrupo] = useState([]);

  async function cargarCombos() {
    let cmbCasinoGrupo = await obtenerCmbCasinoGrupo({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision });
    let estadoSimple = listarEstadoSimple();

    setCmbCasinoGrupo(cmbCasinoGrupo);
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {
        props.agregarGrupo(props.dataRowEditNew);
      } else {
        props.actualizarGrupo(props.dataRowEditNew);
      }
    }
  }

  const obtenerCampoLunes = rowData => {
    return rowData.Lunes === "S";
}
const obtenerCampoMartes = rowData => {
    return rowData.Martes === "S";
}
const obtenerCampoMiercoles = rowData => {
    return rowData.Miercoles === "S";
}
const obtenerCampoJueves = rowData => {
    return rowData.Jueves === "S";
}
const obtenerCampoViernes = rowData => {
    return rowData.Viernes === "S";
}
const obtenerCampoSabado = rowData => {
    return rowData.Sabado === "S";
}
const obtenerCampoDomingo = rowData => {
    return rowData.Domingo === "S";
}
const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
}

async function onValueChangedGrupo(value) {
  setLoading(true);
  if(isNotEmpty(value))
  {
    let data = await listarCGrupoServicio({
        IdGrupo: value,
        IdCliente: perfil.IdCliente,
        IdDivision: perfil.IdDivision,
        IdComedor: '%',
        IdServicio: '%',
        NumPagina: 0,
        TamPagina: 0
    }).finally(() => { setLoading(false) });
    props.setGrupoServicios(data)
  }
  setLoading(false);
}


  useEffect(() => {
    cargarCombos();
  }, []);

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
              <Item
                dataField="IdGrupo"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.GROUP" }) }}
                editorType="dxSelectBox"
                isRequired={modoEdicion}
                editorOptions={{
                  showClearButton: true,
                  items: cmbCasinoGrupo,
                  valueExpr: "IdGrupo",
                  displayExpr: "Grupo",
                  readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false,
                  onValueChanged: (e) => onValueChangedGrupo(e.value)
                }}
              />
              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                colSpan={2}
                isRequired={modoEdicion}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                  readOnly: !(modoEdicion ? (props.dataRowEditNew.esNuevoRegistro ? false : true) : false)
                }}
              />
              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />
              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />
       
              <Item dataField="IdPersona" visible={false} />
            </GroupItem>
          </Form>

          <br></br>
            { props.dataRowEditNew.IdGrupo && (
                <>
                <AppBar position="static" className={classesEncabezado.secundario}>
                              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                                  {intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.SERVICES" })}
                                </Typography>
                              </Toolbar>
                            </AppBar>

                          <DataGrid
                                    dataSource={props.grupoServicios}
                                    showBorders={true}
                                    focusedRowEnabled={true}
                                    keyExpr="RowIndex"
                                    repaintChangesOnly={true}
                                >
                                    <Editing
                                        mode="row"
                                        useIcons={true}
                                        allowUpdating={false}
                                        allowDeleting={false}
                                    />
                                    
                                    <Column dataField="Comedor" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM" })} width={"10%"}  alignment={"center"}/>
                                    <Column dataField="Servicio" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" })} width={"10%"}   />
                                    <Column dataField="Grupo" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO" })} visible={false} />

                                    <Column caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SCHEDULE" })} alignment={"center"}>
                                        <Column dataField="HoraInicio" caption={intl.formatMessage({ id: "ACCESS.PERSON.GRUPO.STARTTIME" })} width={"8%"} alignment={"center"} />
                                        <Column dataField="HoraFin" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.ENDTIME" })} width={"8%"} alignment={"center"} />
                                    </Column>

                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.MONDAY" })} calculateCellValue={obtenerCampoLunes} width={"6%"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.TUESDAY" })} calculateCellValue={obtenerCampoMartes} width={"7%"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.WEDNESDAY" })} calculateCellValue={obtenerCampoMiercoles} width={"8%"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.THURSDAY" })} calculateCellValue={obtenerCampoJueves} width={"7%"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.FRIDAY" })} calculateCellValue={obtenerCampoViernes} width={"7%"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SATURDAY" })} calculateCellValue={obtenerCampoSabado} width={"7%"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "CASINO.GROUP.SERVICE.SUNDAY" })} calculateCellValue={obtenerCampoDomingo} width={"9%"} />
                                    <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoActivo} width={"7%"} />

                                    <Summary>
                                        <TotalItem
                                        cssClass="classColorPaginador_"
                                            column="Comedor"
                                            summaryType="count"
                                            displayFormat={`${intl.formatMessage({id:"COMMON.TOTAL.ROW"}) } {0}`}
                                        />                      
                                    </Summary>

                                </DataGrid>

                </>

            )}
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(PersonaGrupoEditPage));
