import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";//Multi-idioma
import { Button } from "devextreme-react";
import { Portlet, PortletHeaderPopUp, PortletHeaderToolbar } from "../content/Portlet";

import { isNotEmpty, TYPE_TIPO_REQUISITO } from "../../../_metronic";
import { handleInfoMessages } from "../../store/ducks/notify-messages";
import { DataGrid, Column, Paging, Pager, FilterRow, HeaderFilter, FilterPanel, Selection, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Popup } from 'devextreme-react/popup';
import Tooltip from '@material-ui/core/Tooltip';

import PropTypes from "prop-types";
import {
  service as serviceRequisito
} from "../../api/acreditacion/requisito.api";
import WithLoandingPanel from "../content/withLoandingPanel";

const AcreditacionRequisitoBuscar = props => {
  const { intl, setLoading, IdEntidad } = props;
  const [selectedRow, setSelectedRow] = useState([]);
  const [listaRequisito, setListaRequisito] = useState([]);
  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);
  
  async function cargarCombos() {
    setLoading(true);
    await serviceRequisito.listar({
      IdCliente,
      IdEntidad:isNotEmpty(IdEntidad)?IdEntidad:""
    }).then(res => setListaRequisito(res)).finally(() => { setLoading(false) });

  }


  function aceptar() {
    if (selectedRow.length > 0) {
      props.selectData(selectedRow);
      props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
    } else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.SELECT.ROW" }));
    }
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.row.data)) setSelectedRow([{ ...evt.row.data }]);
    }
  }

  const onRowDblClick = evt => {
    if (evt.rowIndex === -1) return;
    if (props.selectionMode === "row" || props.selectionMode === "single") {
      if (isNotEmpty(evt.data)) {
        props.selectData([{ ...evt.data }]);
        props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp);
      }
    }
  }
  function cellRenderImage(param) {
    if (param && param.data) {
      const { TipoRequisito } = param.data;

      if (TipoRequisito === TYPE_TIPO_REQUISITO.AUTORIZADOR) {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.AUTHORIZER" })} </span>} >
          <i className="fas fa-circle  text-success icon-10x" ></i>
        </Tooltip>
      }
      else if (TipoRequisito === TYPE_TIPO_REQUISITO.SOLICITANTE) {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.APPLICANT" })} </span>} >
          <i className="fas fa-circle  text-info icon-10x" ></i>
        </Tooltip>
      }
    }
  }


  useEffect(() => {
    cargarCombos();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>
      <Popup
        visible={props.showPopup.isVisiblePopUp}
        dragEnabled={false}
        closeOnOutsideClick={false}
        showTitle={true}
        height={"600px"}
        width={"500px"}
        title={(intl.formatMessage({ id: "ACTION.SEARCH" }) + ' ' + intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })).toUpperCase()}
        onHiding={() => props.showPopup.setisVisiblePopUp(!props.showPopup.isVisiblePopUp)}
      >
        <Portlet>
          {props.showButton && (
            <PortletHeaderPopUp
              title={""}
              toolbar={
                <PortletHeaderToolbar>
                  <Button
                    icon="todo"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.ACCEPT" })}
                    onClick={aceptar}
                    useSubmitBehavior={true}
                  />

                </PortletHeaderToolbar>
              }
            />
          )}
          <DataGrid
            dataSource={listaRequisito}
            showBorders={true}
            keyExpr="IdRequisito"
            onCellPrepared={onCellPrepared}
            focusedRowEnabled={true}
            allowColumnReordering={true}
            allowColumnResizing={true}
            onRowDblClick={onRowDblClick}
            onFocusedRowChanged={seleccionarRegistro}
          >
            <Editing mode="cell" allowUpdating={true} >
            </Editing>

            <Selection mode={props.selectionMode} />
            <FilterRow visible={true} showOperationChooser={false} />
            <HeaderFilter visible={false} />
            <FilterPanel visible={false} />
            <Column dataField="IdRequisito" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"30%"} editorOptions={false} allowEditing={false} alignment={"center"} />
            <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })} width={"50%"} editorOptions={false} allowEditing={false} />
            <Column dataField="Orden" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT.ORDER" })} width={"15%"} alignment={"center"} editorOptions={false} allowEditing={false} />
            <Column
              dataField=""
              width={"5%"}
              alignment="center"
              cellRender={cellRenderImage}
              allowSorting={false}
              allowFiltering={false}
              allowHeaderFiltering={false} />
            <Summary>
              <TotalItem
               cssClass="classColorPaginador_"
                column="IdRequisito"
                summaryType="count"
                displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
              />
            </Summary>
            <Paging defaultPageSize={15} />
            <Pager showPageSizeSelector={false} />

          </DataGrid>


        </Portlet>
      </Popup>
    </>
  );
};

AcreditacionRequisitoBuscar.propTypes = {
  showButton: PropTypes.bool,
  selectionMode: PropTypes.string,
};
AcreditacionRequisitoBuscar.defaultProps = {
  showButton: true,
  selectionMode: "row", //['multiple', 'row','single]

};
export default injectIntl(WithLoandingPanel(AcreditacionRequisitoBuscar));
