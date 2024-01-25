import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Button as ColumnButton, Column, Editing,Summary, TotalItem  } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { obtenerTodos as obtenerTodosTipoVehiculo } from "../../../../../api/administracion/tipoVehiculo.api";
import { serviceTipoVehiculo } from "../../../../../api/administracion/tipoVehiculo.api";
import { useSelector } from "react-redux";
import  IdentificacionTipoVehiculoBuscar from "../../../../../partials/components/IdentificacionTipoVehiculoBuscar"

const PersonaLicenciaListPage = props => {

  const { intl , accessButton} = props;
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [isVisiblePopUpTipoVehiculo, setIsVisiblePopUpTipoVehiculo] = useState(false);
  const [tipoVehiculos, setTipoVehiculos] = useState([]);



  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };
  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  const seleccionarRegistro = evt => {
    props.seleccionarRegistro(evt.data);
  }

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage:'',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  async function  mostrarTipoVehiculoPorLicencia (e){
    //  console.log("mostrarTipoLicencia|e:",e);
    const { IdLicencia } = e.row.data;
    let tipoVehiculos = await serviceTipoVehiculo.obtenerTipoVehiculoLicencia({IdLicencia :IdLicencia });
    setTipoVehiculos(tipoVehiculos);
    setIsVisiblePopUpTipoVehiculo(true);
  }

  return (
    <>
      <HeaderInformation
        data={props.getInfo()}
        visible={props.showHeaderInformation}
        labelLocation={'left'}
        colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                <Button icon="plus" type="default"
                        hint={intl.formatMessage({ id: "ACTION.NEW" })}
                        onClick={props.nuevoRegistro}
                        disabled={!accessButton.nuevo}
                        visible={props.showButtons}
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

        <DataGrid
          dataSource={props.personaLicencias}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onCellPrepared={onCellPrepared}
          focusedRowKey={props.focusedRowKey}
          allowColumnResizing={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={props.showButtons}
            allowDeleting={props.showButtons}
            texts={textEditing}
          />
          <Column dataField="IdLicencia" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} />
          <Column dataField="Licencia" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.LICENSE" })} width={"35%"} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} width={"15%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} width={"15%"} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} width={"10%"} calculateCellValue={obtenerCampoActivo} />
          <Column type="buttons" width={"10%"}>
            <ColumnButton
              icon="car"
              hint={intl.formatMessage({ id: "ADMINISTRATION.VEHICLETYPE.VEHICLETYPE" })}
              onClick={mostrarTipoVehiculoPorLicencia}
            />
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>
          <Summary>
            <TotalItem
              cssClass="classColorPaginador_"
              column="IdLicencia"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>

        </DataGrid>

      </PortletBody>

      {/*** PopUp -> Buscar Tipo Vehículos Modo Detalle ****/}
      {isVisiblePopUpTipoVehiculo && (
        <IdentificacionTipoVehiculoBuscar
          dataSource={tipoVehiculos}
          showPopup={{ isVisiblePopUp: isVisiblePopUpTipoVehiculo, setisVisiblePopUp: setIsVisiblePopUpTipoVehiculo }}
          cancelarEdicion={() => setIsVisiblePopUpTipoVehiculo(false)}
          selectionMode ={"row"}
          showButton={false}
        />
      )}

    </>
  );
};
PersonaLicenciaListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  showButtons: PropTypes.bool,
};
PersonaLicenciaListPage.defaultProps = {
  showHeaderInformation: true,
  showButtons: true,
};

export default injectIntl(PersonaLicenciaListPage);
