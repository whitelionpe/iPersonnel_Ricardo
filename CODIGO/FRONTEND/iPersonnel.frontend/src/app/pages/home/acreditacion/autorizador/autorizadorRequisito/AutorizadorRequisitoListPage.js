import React, { useState } from "react";
import { injectIntl } from "react-intl"; //Multi-idioma /, useIntl
import { DataGrid, Column, Editing, Paging, Pager, Summary, TotalItem, Button as ColumnButton } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty, TYPE_TIPO_REQUISITO } from "../../../../../../_metronic";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import Tooltip from '@material-ui/core/Tooltip';

import PopupRender from "../../../../../partials/components/PopupRender";
import RequisitoDatoEvaluarListPage from "../../requisito/datoEvaluar/RequisitoDatoEvaluarListPage";
import { listar } from "../../../../../api/acreditacion/requisitoDatoEvaluar.api";


const AutorizadorRequisitoListPage = props => {

  const { intl, dataSource, focusedRowKey, setLoading } = props;
  const [isVisiblePopUpRequisitos, setisVisiblePopUpRequisitos] = useState(false);
  const [listaDatosEvaluar, setListaDatosEvaluar] = useState([]);


  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }
  const textEditing = {
    confirmDeleteMessage: '',
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  const eliminarAutorizadorRequisito = evt => {
    evt.cancel = true; 
    props.eliminarRegistro(evt.row.data);
  };

  const seleccionarAutorizadorRequisito = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  };

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
  const leyendaTipoRequisito = () => {
    return (<>
      <div className="content">
        <div className="row">
          <i className="fas fa-circle  text-success icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.AUTHORIZER" })}</i>  &nbsp; &nbsp;
          <i className="fas fa-circle  text-info icon-10x" > &nbsp; {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.APPLICANT" })}</i>
        </div>
      </div>
    </>)
  }

  const renderGridDatoEvaluar = () => {
    return (
      <RequisitoDatoEvaluarListPage
        showButton={false}
        getInfo={{}}
        datosEvaluarDetalle={listaDatosEvaluar}
        verRegistroDblClick={() => { }}
        seleccionarRegistro={() => { }}
        focusedRowKey={0}
      />
    )
  }
  async function abrirDatoEvaluar(evt) {
    if (evt.rowIndex === -1) return;
    const { IdCliente, IdRequisito } = evt.row.data;
    setLoading(true);
    await listar({ IdCliente, IdRequisito }).then(response => {
      setListaDatosEvaluar(response);
      setisVisiblePopUpRequisitos(true);
    }).finally(() => { setLoading(false); });

  }

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
  return (

    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <Button
                  icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={props.nuevoRegistro}
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

      <PortletBody>

        <DataGrid
          dataSource={dataSource}
          showBorders={true}
          columnAutoWidth={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}

          focusedRowKey={focusedRowKey}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          //onRowRemoving={eliminarAutorizadorRequisito}
          onFocusedRowChanged={seleccionarAutorizadorRequisito}
        >
          {/* <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={true}
            texts={textEditing}
          /> */}
          <Column
            dataField=""
            width={"5%"}
            alignment="center"
            cellRender={cellRenderImage}
          />
          {/* <Column dataField="RowIndex" caption="#" width={"10%"} alignment={"center"} /> */}
          <Column dataField="IdRequisito" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.REQUIREMENT" })} width={"60%"} />
          <Column type="buttons" width={"10%"} caption={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })} >
            <ColumnButton icon="comment" hint={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })} onClick={abrirDatoEvaluar} />
          </Column>
          <Column type="buttons" width={"10%"} visible={props.showButton} >
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarAutorizadorRequisito} />
          </Column>
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdRequisito"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
          <Pager showPageSizeSelector={true} />
          <Paging defaultPageSize={20} />

        </DataGrid>
        <br />
        {leyendaTipoRequisito()}
        {/*++++++++++-Popup Listar Datos a Evaluar-++++++++++++*/}
        <PopupRender
          title={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })}
          showButton={true}
          showPopup={{ isVisiblePopUp: isVisiblePopUpRequisitos, setisVisiblePopUp: setisVisiblePopUpRequisitos }}
          cancelarEdicion={() => setisVisiblePopUpRequisitos(false)}
          renderDataGrid={renderGridDatoEvaluar}
        />
      </PortletBody>
    </>
  );
};


export default injectIntl(WithLoandingPanel(AutorizadorRequisitoListPage));
