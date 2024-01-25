import React, { useState } from "react";
import { DataGrid, Column, Editing, Summary, TotalItem, Button as ColumnButton, Paging, FilterRow } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import PropTypes from "prop-types";
import { Popup } from 'devextreme-react/popup';

import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { handleErrorMessages, handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const VehiculoRequisitoListPage = props => {
  const { intl, accessButton, setLoading, idModulo, idMenu, idAplicacion } = props;

  const [fileBase64, setFileBase64] = useState();
  const [fileName, setFileName] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);
  const [isVisiblePopDetalleRequisito, setisVisiblePopDetalleRequisito] = useState(false);


  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };


  const seleccionarRegistro = evt => {
    props.seleccionarRegistro(evt.data);
  }

  const descargarArchivo = async (evt) => {

    const { NombreArchivo } = evt.data;
    if (!isNotEmpty(props.pathFile)) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NOT.PATH.DOWNLOAD" }));
      return;
    }

    if (fileName !== NombreArchivo) {
      setFileName(NombreArchivo);
      let params = {
        FileName: NombreArchivo,
        FileType: "data:application/pdf;base64,",
        path: "",
        idModulo,
        idAplicacion,
        idMenu
      };
      setLoading(true);
      await downloadFile(params)
        .then(data => {
          setFileBase64(data.fileBase64);
          document.getElementById("fileOpenWindow").click()
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
        }).finally(() => setLoading(false));
    } else {
      if (isNotEmpty(fileBase64)) {
        document.getElementById("fileOpenWindow").click()
      }
    }
  }

  function MostrarHistorial(e) {
    props.listarHistorialRequisito(e.row.data);
    setisVisiblePopDetalleRequisito(true);
  }


  function onCellPreparedHistorial(e) {
    if (e.rowType === "data") {
      if (e.data.Color === "S") {
        e.cellElement.style.color = "green";
      }
    }
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  function cellRenderFile(data) {
    return isNotEmpty(data.value) && (
      <div className="dx-command-edit-with-icons">
        <span
          className="dx-icon-exportpdf"
          title={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
          aria-label={intl.formatMessage({ id: "ACTION.DOWNLOAD" })}
          onClick={(e) => descargarArchivo(data)}
        />
      </div>
    )
  }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                <PortletHeaderToolbar>
                  <Button icon="plus"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.NEW" })}
                    onClick={props.nuevoRegistro}
                    disabled={!accessButton.nuevo}
                    visible={false}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={props.cancelarEdicion}
                  />
                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />
        } 
      />

      <PortletBody>
        <React.Fragment>
          <Form>
            <GroupItem>
              <Item>
                <DataGrid
                  dataSource={props.vehiculosRequisito}
                  showBorders={true}
                  focusedRowEnabled={true}
                  keyExpr="RowIndex"
                  onEditingStart={editarRegistro}
                  onRowRemoving={eliminarRegistro}
                  onRowClick={seleccionarRegistro}
                  focusedRowKey={props.focusedRowKey}
                >
                  <Editing
                    mode="row"
                    useIcons={true}
                    allowUpdating={false}
                    allowDeleting={false}
                    texts={textEditing}
                  />

                  <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" })} width={"50%"} />
                  <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
                  <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
                  <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" />

                  <Column type="buttons"  >
                    <ColumnButton text="historial"
                      icon="menu"
                      hint={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS.RECORD" })}
                      onClick={MostrarHistorial}
                    />
                    <ColumnButton name="edit" />
                    <ColumnButton name="delete" />
                  </Column>

                  <Summary>
                    <TotalItem
                     cssClass="classColorPaginador_"
                      column="Requisito"
                      summaryType="count"
                      displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                    />
                  </Summary>

                </DataGrid>
              </Item>
            </GroupItem>
          </Form>

        </React.Fragment>
      </PortletBody>

      <Popup
        visible={isVisiblePopDetalleRequisito}
        dragEnabled={false}
        closeOnOutsideClick={true}
        showTitle={true}
        title={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS.HISTORY" })}
        height={"550px"}
        width={"600px"}
        onHiding={() => setisVisiblePopDetalleRequisito(!isVisiblePopDetalleRequisito)}
      >

        <DataGrid
          dataSource={props.requisitoHistorialData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPreparedHistorial}
        >
          <Editing
            mode="row"
            useIcons={false}
            allowUpdating={false}
            allowDeleting={false}
          />
          <FilterRow visible={true} />
          <Column dataField="RowIndex" caption="#" width={"7%"} alignment="center" allowSearch={false} allowFiltering={false} visible={false} />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" })} width={"50%"} allowSearch={false} allowFiltering={false} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />
          <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" visible={false} allowSearch={false} allowFiltering={false} />
          <Paging enabled={true} defaultPageSize={15} />
        </DataGrid>

      </Popup>


      {/* POPUP-> Visualizar documento .PDF*/}
      <FileViewer
        showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
        cancelar={() => setisVisiblePopUpFile(false)}
        fileBase64={fileBase64}
        fileName={fileName}
      />
    </>
  );
};

VehiculoRequisitoListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  pathFile: PropTypes.string,
};
VehiculoRequisitoListPage.defaultProps = {
  showHeaderInformation: true,
  pathFile: ""
};

export default injectIntl(WithLoandingPanel(VehiculoRequisitoListPage));
