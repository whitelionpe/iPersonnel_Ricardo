import React, { Fragment } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma
import {
  DataGrid,
  Column,
  Editing,
  Pager,
  FilterRow,
  MasterDetail,
} from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import {
  PortletBody,
  PortletHeader,
  PortletHeaderToolbar,
} from "../../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import PersonaCentroCostoListPage from '../centroCosto/PersonaCentroCostoListPage';

const PersonaPosicionListOtroPage = (props) => {
  const { intl, readOnlyOptions } = props;

  const editarRegistro = (evt) => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = (evt) => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };
  const obtenerCampoActivo = (rowData) => {
    return rowData.Activo === "S";
  };
  const seleccionarRegistro = (evt) => {
    //console.log("seleccionarRegistro",evt);
    props.seleccionarRegistro(evt.data);
  };

  function onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.Activo === "N") {
        e.cellElement.style.color = "red";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };


  const editarRegistroPosicion = (dataRow) => { }

  const eliminarRegistroPosicion = (dataRow) => { }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={

          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  {readOnlyOptions == "1" ? null : (
                    <Fragment>
                      {/*<Button
                                                icon="plus"
                                                type="default"
                                                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                                                onClick={props.nuevoRegistro}
                                            />
                                            &nbsp;*/}
                      <Button
                        icon="fa fa-times-circle"
                        type="normal"
                        hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                        onClick={props.cancelarEdicion}
                      />
                    </Fragment>
                  )}
                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />

        } />

      <PortletBody>
        <DataGrid
          dataSource={props.personaPosicions}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          remoteOperations={true}
          onRowClick={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
        >
          <Editing
            mode="row"
            useIcons={true}
            texts={textEditing}
          />
          <FilterRow visible={false} />
          <Column
            dataField="RowIndex"
            caption="#"
            width={"5%"}
            alignment={"center"}
            visible={false}
            FilterRow={false}
            allowSorting={false}
            allowSearch={false}
            allowFiltering={false}
          />
          <Column
            dataField="IdPersona"
            caption={intl.formatMessage({ id: "COMMON.CODE" })}
            width={"10%"}
            alignment={"center"}
            allowSorting={true}
            allowSearch={true}
            allowFiltering={true}
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({
              id: "ADMINISTRATION.PERSON.COSTCENTER.POSITION.SURNAMESANDNAMES",
            })}
            width={"20%"}
            allowSorting={true}
            allowSearch={true}
            allowFiltering={true}
          />
          <Column
            dataField="Compania"
            caption={intl.formatMessage({
              id: "ADMINISTRATION.PERSON.COSTCENTER.POSITION.COMPANY",
            })}
            width={"16%"}
          />
          <Column dataField="Division" caption={intl.formatMessage({ id: "SYSTEM.DIVISION" })} width={"15%"} />
          <Column dataField="UnidadOrganizativa" caption={intl.formatMessage({ id: "ADMINISTRATION.ORGANIZATIONALUNIT.COSTCENTER.UO.TAB" })} width={"25%"} />

          <Column
            dataField="Posicion"
            caption={intl.formatMessage({
              id: "ADMINISTRATION.PERSON.COSTCENTER.POSITION.POSITION",
            })}
            width={"20%"}
            allowSorting={false}
            allowSearch={false}
            allowFiltering={false}
          />
          <Column
            dataField="FechaInicio"
            caption={intl.formatMessage({
              id: "ADMINISTRATION.PERSON.COSTCENTER.POSITION.STARTDATE",
            })}
            width={"10%"}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
          />
          <Column
            dataField="FechaFin"
            caption={intl.formatMessage({
              id: "ADMINISTRATION.PERSON.COSTCENTER.POSITION.ENDDATE",
            })}
            width={"10%"}
            dataType="date"
            format="dd/MM/yyyy"
            alignment={"center"}
          />
          <Column
            dataType="boolean"
            caption={intl.formatMessage({ id: "COMMON.ACTIVE" })}
            calculateCellValue={obtenerCampoActivo}
            width={"7%"}
            alignment={"center"}
          />
          <Column dataField="IdCliente" visible={false} />
          <Column dataField="UnidadOrganizativa" visible={false} />

          <MasterDetail enabled={true} component={(opt) => PersonaCentroCostoListPage({
            posicion: opt.data.data,
            intl,
            showButtons: true,
            editarRegistro: editarRegistroPosicion,
            eliminarRegistro: eliminarRegistroPosicion,
          })} />

        </DataGrid>
      </PortletBody>
    </>
  );
};

PersonaPosicionListOtroPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
PersonaPosicionListOtroPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(PersonaPosicionListOtroPage);
