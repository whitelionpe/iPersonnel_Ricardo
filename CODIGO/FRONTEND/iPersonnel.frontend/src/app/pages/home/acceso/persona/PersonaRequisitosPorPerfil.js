import React, { useSelector, useState, useEffect } from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';
import { serviceAccesoPersonaPerfil } from '../../../../api/acceso/personaPerfil.api';
import Form, { Item, GroupItem } from "devextreme-react/form";

//Multi-idioma
import { injectIntl } from "react-intl";
import { connect } from "react-redux";

const PersonaRequisitosPorPerfil = props => {

  //multi-idioma
  const { intl } = props;

  const [dataSource, setDataSource] = useState([]);

  function onCellPrepared(e) {

    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
      /*var DateNow = new Date();
      var FechaFin = new Date(e.data.FechaFin);
      if (FechaFin < DateNow) {
        e.cellElement.style.color = 'red';
      }

      if (e.data.StatusRequisito === 'PENDIENTE') {
        e.cellElement.style.color = 'orange';
      }*/

    }
  }
  async function listarPerfiles(params) {
    const { IdCliente, IdDivision, IdPersona, IdPerfil, IdSecuencial } = params;

    let filtro = { IdCliente, IdDivision, IdPersona: String(IdPersona), IdPerfil, IdSecuencial };
    let perfiles = await serviceAccesoPersonaPerfil.listar(filtro);
    setDataSource(perfiles);
  }

  useEffect(() => {
    listarPerfiles(props.data.data);
  }, []);

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  }

  return (

    <>
      <div className="grid_detail_title">
        Historial
      </div>
      <DataGrid
        dataSource={dataSource}
        showBorders={true}
        columnAutoWidth={true}
        onCellPrepared={onCellPrepared}

      >

        {/* <Column dataField="RowIndex" caption="#" width={40} />
        <Column dataField="IdPerfil" caption="IdPerfil" visible={false} />
        <Column dataField="IdRequisito" caption="IdRequisito" visible={false} />
        <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" })} />
        <Column dataField="StatusRequisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE.STATUS" })} />
        <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
        <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} /> */}


        <Column dataField="RowIndex" caption="#" width={40} />
        <Column dataField="IdPerfil" caption={intl.formatMessage({ id: "COMMON.CODE" })} visible={true} width={150} />
        <Column dataField="Perfil" caption={intl.formatMessage({ id: "ACCESS.PERSON.PROFILE" })} />
        <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
        <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} />
        <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={170} />



      </DataGrid>

    </>
  );



};

export default injectIntl(PersonaRequisitosPorPerfil);

