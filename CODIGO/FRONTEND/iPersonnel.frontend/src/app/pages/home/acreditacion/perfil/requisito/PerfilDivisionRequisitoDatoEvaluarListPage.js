import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { DataGrid, Column, Button as ColumnButton } from "devextreme-react/data-grid";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
//import { Button } from "devextreme-react";
import { PortletBody } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import {
  listar as listarPerfilDivisionRequisitoDatoEvaluar
} from "../../../../../api/acreditacion/perfilDivisionRequisitoDatoEvaluar.api";

const PerfilDivisionRequisitoDatoEvaluarListPage = props => {
  const { intl, setLoading } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);
  const [grillaDatosEvaluar, setGrillaDatosEvaluar] = useState([]);

  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = (evt) => {
    props.eliminarRegistro(evt.row.data);
  };

  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  const obtenerAdjuntarArchivo = rowData => {
    return rowData.AdjuntarArchivo === "S";
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const obtenerDatosEvaluar = async () => {
    let { IdPerfil, Perfil, Division, Requisito, IdDivision, IdRequisito } = props.requisito;
    setLoading(true);
    let divisiones = await listarPerfilDivisionRequisitoDatoEvaluar({ IdCliente: perfil.IdCliente, IdPerfil, IdDivision, IdRequisito }).finally(() => { setLoading(false); });
    setGrillaDatosEvaluar(divisiones.map(x => ({ ...x, esNuevoRegistro: false, Perfil, Division, Requisito })));
  }

  useEffect(() => {
    obtenerDatosEvaluar();
  }, []);

  return (
    <>
      <PortletBody>
        <div className="grid_detail_title">
          Datos a Evaluar
        </div>
        <DataGrid
          dataSource={grillaDatosEvaluar}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          // onFocusedRowChanged={seleccionarRegistro}
          remoteOperations={true}

        >
          <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} />
          <Column dataField="IdDatoEvaluar" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"25%"} alignment={"left"} />
          <Column dataField="DatoEvaluar" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"30%"} alignment={"left"} />
          <Column dataField="Orden" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" })} width={"10%"} alignment={"center"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.FILE" })} calculateCellValue={obtenerAdjuntarArchivo} width={"15%"} />
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"15%"} />
          <Column type="buttons" width={105} visible={props.showButtons} >
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
          </Column>
        </DataGrid>
      </PortletBody>
    </>
  );

};

export default injectIntl(WithLoandingPanel(PerfilDivisionRequisitoDatoEvaluarListPage));
