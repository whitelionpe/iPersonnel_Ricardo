import React, { useState } from "react";
import { DataGrid, Column, Editing, Button as ColumnButton, Paging, FilterRow } from "devextreme-react/data-grid";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import { Popup } from 'devextreme-react/popup';
//Multi-idioma
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const PersonaRequisitoListPage = props => {

  //multi-idioma
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

    const { NombreArchivo, IdItemSharepoint } = evt.data;

    if (fileName !== NombreArchivo) {
      setFileName(NombreArchivo);
      let params = {
        fileName: NombreArchivo,
        idItemSharepoint: IdItemSharepoint,
        fileType: "data:application/pdf;base64,",
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
              </PortletHeaderToolbar>
            }
          />
        }
      />


      <PortletBody>
        <DataGrid
          dataSource={props.personaRequisitosData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onRowClick={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >
          <Editing
            mode="row"
            useIcons={props.showButtons}
            allowUpdating={props.showButtons}
            allowDeleting={props.showButtons}
            texts={textEditing}
          />

          <Column dataField="RowIndex" caption="#" width={"7%"} alignment="center" />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" })} width={"50%"} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
          <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" />
          <Column dataField="IdItemSharepoint" caption="Item Sharepoint" width={"10%"} alignment="center" visible={false} />

          <Column type="buttons"  >
            <ColumnButton text="historial"
              icon="menu"
              hint={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENTS.RECORD" })}
              onClick={MostrarHistorial}
            />
            <ColumnButton name="edit" />
            <ColumnButton name="delete" />
          </Column>

        </DataGrid>
      </PortletBody>

      <PortletBody>

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
          dataSource={props.requisitosHistorialData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPreparedHistorial}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >


          <Paging enabled={true} defaultPageSize={15} />
          <FilterRow visible={true} />
          <Column dataField="RowIndex" caption="#" width={"7%"} alignment="center" allowSearch={false} allowFiltering={false} visible={false} />
          <Column dataField="Requisito" caption={intl.formatMessage({ id: "ACCESS.PERSON.REQUIREMENT" })} width={"50%"} allowSearch={false} allowFiltering={false} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} allowSearch={false} allowFiltering={false} />
          <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" visible={true} allowSearch={false} allowFiltering={false} />

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

PersonaRequisitoListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  pathFile: PropTypes.string,
  showButtons: PropTypes.bool
};
PersonaRequisitoListPage.defaultProps = {
  showHeaderInformation: true,
  pathFile: "",
  showButtons: false,
};


export default injectIntl(WithLoandingPanel(PersonaRequisitoListPage));
