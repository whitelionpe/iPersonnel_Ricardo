import React, { useEffect, useState } from "react";
import Form, { Item, GroupItem, PatternRule } from "devextreme-react/form";
import { Button, DataGrid, Toolbar } from "devextreme-react";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar
} from "../../../../partials/content/Portlet";
import { AppBar, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import {
  isModified,
  isRequired
} from "../../../../../_metronic/utils/securityUtils";
import {
  dateFormat,
  isNotEmpty,
  listarEstado,
  listarEstadoSimple
} from "../../../../../_metronic";
import CampamentoPerfilPersonaBuscar from "../../../../partials/components/CampamentoPerfilPersonaBuscar";
import PerfilPersonaMasivoBuscar from "./PerfilPersonaMasivoBuscar";
import { Column, Button as ColumnButton } from "devextreme-react/data-grid";
import { DoubleLinePersona } from "../../../../partials/content/Grid/DoubleLineLabel";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";

const PerfilPersonaMasivoPage = ({
  intl,
  modoEdicion,
  settingDataField,
  fechasContrato,
  varIdPersona,
  dataRowEditNew,
  agregarPerfil,
  actualizarPerfil,
  getInfo,
  showHeaderInformation,
  cancelarEdicion,
  IdPerfilCampamento = "",
  setLoading,
  grabarMasivo
}) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const classesEncabezado = useStylesEncabezado();
  const [isVisibleAlert, setIsVisibleAlert] = useState(false);
  const [
    isVisiblePopUpPersonaSinPerfil,
    setIsVisiblePopUpPersonaSinPerfil
  ] = useState(false);
  const [dataSourcePersona, setdataSourcePersona] = useState([]);

  const grabar = e => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
      if (
        Date.parse(new Date(dataRowEditNew.FechaInicio)).toLocaleString() >=
        Date.parse(new Date(dataRowEditNew.FechaFin)).toLocaleString()
      ) {
        handleInfoMessages(
          intl.formatMessage({ id: "ACCESS.PERSON.STARTDATE.VALID" })
        );
        return;
      }

      if (dataSourcePersona.length === 0) {
        handleInfoMessages(
          intl.formatMessage({
            id: "ADMINISTRATION.PERSON.VALIDATION.MESSAGE.SELECT.WORKER"
          })
        );
        return;
      }

      let {
        FechaInicio,
        FechaFin,
        CheckInSinReserva,
        DiasPermanencia
      } = dataRowEditNew;

      let strPersonas = dataSourcePersona.map(x => x.IdPersona).join(",");

      let param = {
        IdDivision: perfil.IdDivision,
        IdPerfil: IdPerfilCampamento,
        FechaInicio: dateFormat(FechaInicio, "yyyyMMdd"),
        FechaFin: dateFormat(FechaFin, "yyyyMMdd"),
        CheckInSinReserva: isNotEmpty(CheckInSinReserva)
          ? CheckInSinReserva
          : "",
        DiasPermanencia: isNotEmpty(DiasPermanencia) ? DiasPermanencia : 0,
        IdPersonas: strPersonas
      };
      //crearmasivobyperfil
      console.log(param);
      grabarMasivo(param);
    }
  };

  const agregarDatosGrilla = data => {
    setLoading(true);
    console.log("agregarDatosGrilla", { data });
    setdataSourcePersona(prev => {
      let newData = data.filter(
        x => !prev.map(item => item.IdPersona).includes(x.IdPersona)
      );
      return [...prev, ...newData];
    });
    setLoading(false);
  };

  const btn_click_eliminarRegistro = evt => {
    setLoading(true);
    let { IdPersona } = evt.row.data;
    console.log("btn_click_eliminarRegistro", { evt, IdPersona });

    setdataSourcePersona(prev => prev.filter(x => x.IdPersona !== IdPersona));
    setLoading(false);
  };

  return (
    <>
      <HeaderInformation
        data={getInfo()}
        visible={true}
        labelLocation={"left"}
        colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="group"
                  type="default"
                  hint={intl.formatMessage({
                    id: "CASINO.PERSON.GROUP.PERSON"
                  })}
                  useSubmitBehavior={true}
                  onClick={function(evt) {
                    console.log("Click", { evt });
                    setIsVisiblePopUpPersonaSinPerfil(true);
                    // setFiltros({ ...Filtros, IdCliente });
                    // setisVisiblePopUpPersonaSinGrupo(true);
                  }}
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
                  disabled={isVisibleAlert}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={cancelarEdicion}
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
              <Item
                dataField="FechaInicio"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.PERSON.STARTDATE"
                  })
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: false,
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item
                dataField="FechaFin"
                label={{
                  text: intl.formatMessage({
                    id: "ADMINISTRATION.PERSON.ENDDATE"
                  })
                }}
                isRequired={true}
                editorType="dxDateBox"
                dataType="date"
                editorOptions={{
                  inputAttr: { style: "text-transform: uppercase" },
                  displayFormat: "dd/MM/yyyy",
                  readOnly: false,
                  min: fechasContrato.FechaInicioContrato,
                  max: fechasContrato.FechaFinContrato
                }}
              />

              <Item
                dataField="CheckInSinReserva"
                label={{
                  text: intl.formatMessage({
                    id: "CAMP.CAMP.WITHIUTRESERVATION"
                  })
                }}
                editorType="dxSelectBox"
                isRequired={true}
                editorOptions={{
                  items: listarEstado(),
                  valueExpr: "Valor",
                  displayExpr: "Descripcion"
                }}
              />

              <Item
                dataField="DiasPermanencia"
                label={{
                  text: intl.formatMessage({ id: "CAMP.CAMP.DAYSPERMANENCE" })
                }}
                editorType="dxNumberBox"
                isRequired={true}
                dataType="number"
                editorOptions={{
                  readOnly: false,
                  inputAttr: {
                    style: "text-transform: uppercase; text-align: right"
                  },
                  showSpinButtons: true,
                  showClearButton: true,
                  min: 1,
                  max: 99
                }}
              >
                <PatternRule
                  pattern={/[0-9]/}
                  message={intl.formatMessage({
                    id: "COMMON.ENTER.NUMERIC.DATA"
                  })}
                />
              </Item>
            </GroupItem>
          </Form>
          <br />
          <DataGrid
            id="gridContainer"
            dataSource={dataSourcePersona}
            showBorders={true}
            focusedRowEnabled={true}
            keyExpr="RowIndex"
            // onCellPrepared={onCellPrepared}
            repaintChangesOnly={true}
            // onRowDblClick={onRowDblClick}
            // onFocusedRowChanged={seleccionarRegistro}
            // onSelectionChanged={e => onSelectionChanged(e)}
            allowColumnReordering={true}
            allowColumnResizing={true}
            columnAutoWidth={true}
          >
            <Column
              dataField="IdPersona"
              caption={intl.formatMessage({ id: "COMMON.CODE" })}
              allowHeaderFiltering={false}
              allowSorting={true}
              width={"10%"}
              alignment={"center"}
              // fixed={true}
            />
            <Column
              dataField="NombreCompleto"
              caption={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.FULLNAME"
              })}
              allowSorting={true}
              allowHeaderFiltering={false}
            />
            <Column
              dataField="TipoDocumento"
              caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.TYPE" })}
              allowHeaderFiltering={false}
              alignment={"center"}
              width={"20%"}
            ></Column>
            <Column
              dataField="Documento"
              caption={intl.formatMessage({
                id: "ADMINISTRATION.PERSON.DOCUMENT"
              })}
              allowHeaderFiltering={false}
              width={"20%"}
            />
            <Column type="buttons" width={85} visible={true}>
              <ColumnButton
                icon="trash"
                hint={intl.formatMessage({ id: "ACTION.REMOVE" })}
                onClick={btn_click_eliminarRegistro}
                visible={true}
              />
            </Column>
          </DataGrid>
        </React.Fragment>
      </PortletBody>

      {isVisiblePopUpPersonaSinPerfil && (
        <PerfilPersonaMasivoBuscar
          intl={intl}
          showPopup={{
            isVisiblePopUp: isVisiblePopUpPersonaSinPerfil,
            setisVisiblePopUp: setIsVisiblePopUpPersonaSinPerfil
          }}
          uniqueId={"key_popupcpp"}
          selectionMode={"multiple"}
          filtro={{ IdPerfil: IdPerfilCampamento }}
          agregar={agregarDatosGrilla}
        />
      )}
    </>
  );
};
/*
PerfilPersonaMasivoBuscar = ({
  intl,
  showPopup,
  uniqueId = "PerfilPersonaMasivoBuscar",
  selectionMode = "multiple",
  agregar = () => {}

*/
export default PerfilPersonaMasivoPage;
