import React, { useState, useEffect } from "react";
import { DataGrid, Column, Button as ColumnButton, Paging, Pager, Summary, TotalItem } from "devextreme-react/data-grid";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty, TYPE_TIPO_REQUISITO } from "../../../../../../_metronic";
import Tooltip from '@material-ui/core/Tooltip';

import PopupRender from "../../../../../partials/components/PopupRender";
import RequisitoDatoEvaluarListPage from "../../requisito/datoEvaluar/RequisitoDatoEvaluarListPage";
import { listar } from "../../../../../api/acreditacion/requisitoDatoEvaluar.api";
import BallotOutlinedIcon from '@material-ui/icons/BallotOutlined';


const PerfilRequisitoListPage = props => {
  const { intl, setLoading } = props;
  const [isVisiblePopUpRequisitos, setisVisiblePopUpRequisitos] = useState(false);
  const [listaDatosEvaluar, setListaDatosEvaluar] = useState([]);


  const editarRegistro = evt => {
    props.editarRegistro(evt.row.data);
  };

  const eliminarRegistro = (evt) => {
    props.eliminarRegistro(evt.row.data, false, 0);
  };


  const obtenerCampoActivo = rowData => {
    return rowData.Activo === "S";
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt[0]);
  }


  function cellRenderImage(param) {
    if (param && param.data) {
      const { TipoRequisito } = param.data;

      if (TipoRequisito === TYPE_TIPO_REQUISITO.AUTORIZADOR) {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.AUTHORIZER" })} </span>} >
          <i className="fas fa-circle  text-success icon-10x" ></i>
          {/* <Badge badgeContent={""} overlap="circle" color="secondary" variant="standard" /> */}
        </Tooltip>
      }
      else if (TipoRequisito === TYPE_TIPO_REQUISITO.SOLICITANTE) {
        return <Tooltip title={<span style={{ fontSize: "15px" }}> {intl.formatMessage({ id: "ACCREDITATION.PROFILE.ENTITY.APPLICANT" })} </span>} >
          <i className="fas fa-circle  text-info icon-10x" ></i>
          {/* <Badge badgeContent={""} overlap="circle" color="primary" variant="standard" /> */}
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

  useEffect(() => {
    // props.cargarInformacion();
  }, []);

  //:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

  return (
    <>

      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <Button icon="plus" type="default" hint={intl.formatMessage({ id: "ACTION.NEW" })} onClick={props.nuevoRegistro} />
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
          dataSource={props.dataSource}
          showBorders={true}
          focusedRowEnabled={true}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          onSelectionChanged={seleccionarRegistro}
        >
          <Column
            dataField=""
            // caption={intl.formatMessage({ id: "" })} 
            width={"5%"}
            alignment="center"
            cellRender={cellRenderImage}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false} />
          {/* <Column dataField="RowIndex" caption="#" width={"5%"} alignment={"center"} /> */}
          <Column dataField="IdRequisito" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"20%"} />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCREDITATION.REQUIREMENT" })} />
          <Column dataField="Orden" caption={intl.formatMessage({ id: "SYSTEM.MENU.ORDER" })} width={"10%"} alignment={"center"}/>
          <Column dataType="boolean" caption={intl.formatMessage({ id: "COMMON.ACTIVE" })} calculateCellValue={obtenerCampoActivo} width={"10%"}/>
          <Column type="buttons" width={"10%"} caption={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })} >
            <ColumnButton icon="comment" hint={intl.formatMessage({ id: "ACCREDITATION.DATAEVALUATE" })} onClick={abrirDatoEvaluar} />
          </Column>
          <Column type="buttons" width={"10%"} visible={props.showButton} >
            <ColumnButton icon="edit" hint={intl.formatMessage({ id: "ACTION.EDIT", })} onClick={editarRegistro} />
            <ColumnButton icon="trash" hint={intl.formatMessage({ id: "ACTION.REMOVE", })} onClick={eliminarRegistro} />
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

export default injectIntl(WithLoandingPanel(PerfilRequisitoListPage));
