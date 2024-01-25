import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { useSelector } from "react-redux";

import { Button } from "devextreme-react";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { DataGrid, Column, Paging, Pager, Button as ColumnButton, } from "devextreme-react/data-grid";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import {
  servicePersona
} from "../../../../api/administracion/persona.api";
import { listarEstadoSimple, isNotEmpty, dateFormat } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import CasinoPersonaGruposBuscar from "../../../../partials/components/CasinoPersonaGruposBuscar";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import Confirm from "../../../../partials/components/Confirm";


const PersonasGrupoEditPage = props => {
  const { intl, modoEdicion, settingDataField } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [estadoSimple, setEstadoSimple] = useState([]);

  const classesEncabezado = useStylesEncabezado();

  const [isVisiblePopUpPersonaSinGrupo, setisVisiblePopUpPersonaSinGrupo] = useState(false);
  const [Filtros, setFiltros] = useState({ Filtro: "1" });
  const { IdCliente } = useSelector(state => state.perfil.perfilActual);
  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});

  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    setEstadoSimple(estadoSimple);
  }

  function grabar(e) {
    let result = e.validationGroup.validate();

    if (fechaInicioEsMayorQueFechaFin()) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
      return;
    }

    if (result.isValid) {
      if (props.dataRowEditNew.esNuevoRegistro) {

        let newArray = [...props.grillaPersona];

        if (newArray.length == 0) {
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.PERSON" }));
          return;
        }

        let evaluation = newArray.find(element => (element.Mensaje) && element.Mensaje.length > 0);
        if (evaluation) {
          //alert("Corrija las advertencias");
          handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE.ALERT" }));
          return;
        }

        newArray.map(x => {
          x.FechaInicio = dateFormat(props.dataRowEditNew.FechaInicio, 'yyyyMMdd');
          x.FechaFin = dateFormat(props.dataRowEditNew.FechaFin, 'yyyyMMdd'); //new Date(props.dataRowEditNew.FechaFin).toLocaleString();
          x.Activo = "S"
        });

        props.agregarPersonaGrupo(newArray);
      } else {
        props.actualizarPersonaGrupo(props.dataRowEditNew);
      }
    }
  }


  async function listar_Personas() {

    if (!props.dataRowEditNew.esNuevoRegistro) {
      let persona = await servicePersona.obtener({
        IdCliente: perfil.IdCliente,
        IdPersona: props.dataRowEditNew.IdPersona
      });
    }
  }

  useEffect(() => {
    cargarCombos();
    listar_Personas();
  }, []);

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  const agregarDatosGrilla = (dataPopup) => {
    props.setGrillaPersona([]);
    var personas = dataPopup.map(x => (x.IdPersona)).join(',');
    props.dataRowEditNew.IdPersona = personas;

    let cadenaMostrar = dataPopup.map(x => (x.Compania)).join(', ');
    if (cadenaMostrar.length > 100) {
      cadenaMostrar = cadenaMostrar.substring(0, 100) + '...';
    }
    props.validarDatosPersona();
  };

  function fechaInicioEsMayorQueFechaFin() {
    let fechaInicio = new Date(props.dataRowEditNew.FechaInicio);
    let fechaFin = new Date(props.dataRowEditNew.FechaFin);
    return fechaInicio.getTime() > fechaFin.getTime();
  }

  function reprint() {
    if (fechaInicioEsMayorQueFechaFin()) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.VALIDATION.MESSAGE" }));
      return;
    }
  }

  function formater(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (isNotEmpty(e.data.Mensaje)) {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const eliminarRegistro = (evt) => {
    setIsVisible(true);
     if(isNotEmpty(evt.row.data)){
      setSelectedDelete(evt.row.data);
     }
    // let dialog = custom({
    //   showTitle: false,
    //   messageHtml: intl.formatMessage({ id: "ALERT.REMOVE" }),
    //   buttons: [
    //     {
    //       text: "Yes",
    //       onClick: (e) => {
    //         let newArray = props.grillaPersona.filter(x => x.IdPersona != data.IdPersona);

    //         newArray.map((x, i) => {
    //           x.RowIndex = i + 1;
    //         });
    //         props.setGrillaPersona(newArray);
    //       }
    //     },
    //     { text: "No", },
    //   ]
    // });
    // dialog.show();
  };

  function confirmarEliminar (){
    let newArray = props.grillaPersona.filter(x => x.IdPersona != selectedDelete.IdPersona);
    props.setGrillaPersona(newArray);
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
                  icon="group"
                  type="default"
                  hint={intl.formatMessage({ id: "CASINO.PERSON.GROUP.PERSON" })}
                  useSubmitBehavior={true}
                  onClick={function (evt) {
                    setFiltros({ ...Filtros, IdCliente })
                    setisVisiblePopUpPersonaSinGrupo(true);
                  }}
                />
                &nbsp;
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  onClick={grabar}
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
          <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                      {intl.formatMessage({ id: "ACCESS.GROUP.ADD" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>
              <Item
                dataField="IdGrupo" visible={false} />
              <Item
                dataField="IdSecuencial" visible={false} />
              <Item
                dataField="FechaInicio"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" }) }}
                editorType="dxDateBox"
                dataType="date"
                isRequired={modoEdicion}
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaInicio', settingDataField) : false),
                  onClosed: (evt) => {
                    reprint();
                  }
                }}
              />
              <Item
                dataField="FechaFin"
                label={{ text: intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" }) }}
                editorType="dxDateBox"
                isRequired={modoEdicion}
                dataType="date"
                editorOptions={{
                  displayFormat: "dd/MM/yyyy",
                  readOnly: !(modoEdicion ? isModified('FechaFin', settingDataField) : false),
                  onClosed: (evt) => {
                    reprint();
                  }
                }}
              />

              <Item
                dataField="Activo"
                label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                editorType="dxSelectBox"
                colSpan={2}
                isRequired={modoEdicion}
                visible={false}
                editorOptions={{
                  items: estadoSimple,
                  valueExpr: "Valor",
                  displayExpr: "Descripcion",
                }}
              />

              <Item dataField="IdPersona" visible={false} />
              <Item />

            </GroupItem>
          </Form>

          <DataGrid
            dataSource={props.grillaPersona}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="RowIndex"
            onCellPrepared={onCellPrepared}
          >
            <Column dataField="RowIndex" caption="#" width={"6%"} alignment={"center"} allowSorting={false} allowSearch={false} allowFiltering={false} />
            <Column dataField="IdPersona" caption={intl.formatMessage({ id: "COMMON.CODE" })} alignment={"center"} width={"10%"} />
            <Column dataField="NombreCompleto"
              caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
              width={"20%"} 
              allowSorting={true}
              allowSearch={true}
              allowFiltering={true}
            />
            <Column dataField="TipoDocumentoAlias" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })} width={"10%"} />
            <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })} width={"14%"} />
            <Column dataField="Mensaje" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.REGIME.MESSAGE" })} width={"40%"} />
            <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.STATE" })} calculateCellValue={obtenerCampoActivo} width={"10%"} visible={false} />
            <Column type="buttons"
              width={70} 
              //  visible={props.showButtons}
               visible={props.dataRowEditNew.esNuevoRegistro} 
               >
              <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
            </Column>

            <Paging defaultPageSize={20} />
            <Pager showPageSizeSelector={false} />
          </DataGrid>

        {isVisiblePopUpPersonaSinGrupo && (
                  <CasinoPersonaGruposBuscar
                  uniqueId = {"CasinoPersonaGruposBuscar"}
                  showPopup={{ isVisiblePopUp: isVisiblePopUpPersonaSinGrupo, setisVisiblePopUp: setisVisiblePopUpPersonaSinGrupo }}
                  cancelar={() => setisVisiblePopUpPersonaSinGrupo(false)}
                  agregar={agregarDatosGrilla}
                  //Filtros={Filtros}
                  selectionMode={"multiple"}
                />
        )}

      <Confirm
        message={intl.formatMessage({ id: "ALERT.REMOVE" })}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        setInstance={setInstance}
        onConfirm={() => confirmarEliminar()}
        title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
        confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
        cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
      />

        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(PersonasGrupoEditPage);
