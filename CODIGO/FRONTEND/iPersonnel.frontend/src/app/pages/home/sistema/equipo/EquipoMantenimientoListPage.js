import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";

const EquipoMantenimientoListPage = props => {
  const { intl, accessButton, setLoading, idModulo, idMenu, idAplicacion } = props;

  const [fileBase64, setFileBase64] = useState();
  const [fileName, setFileName] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  }

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const descargarArchivo = async (evt) => {

    const { NombreArchivo, IdItemSharepoint } = evt.data;

    if (fileName !== NombreArchivo) {
      setFileName(NombreArchivo);
      let params = {
        FileName: NombreArchivo,
        IdItemSharepoint: IdItemSharepoint,
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
          //setisVisiblePopUpFile(true);
          document.getElementById("fileOpenWindow").click()
        })
        .catch((err) => {
          handleErrorMessages(intl.formatMessage({ id: "MESSAGES.WARNING" }), err);
        }).finally(() => setLoading(false));
    } else {
      if (isNotEmpty(fileBase64)) {
        //setisVisiblePopUpFile(true);
        document.getElementById("fileOpenWindow").click()
      }
    }
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
                    disabled={!accessButton.nuevo} />
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

        } />

      <PortletBody>

        <DataGrid
          dataSource={props.equiposMant}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />

          <Column dataField="Descripcion" caption={intl.formatMessage({ id: "COMMON.DESCRIPTION" })} width={"21%"} />
          <Column dataField="IdTipoMantenimiento" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} />
          <Column dataField="TipoMantenimiento" caption={intl.formatMessage({ id: "COMMON.TYPE" })} width={"15%"} />
          <Column dataField="Tecnico" caption={intl.formatMessage({ id: "SYSTEM.TEAM.TECHNICAL" })} width={"15%"} />
          <Column dataField="Observacion" caption={intl.formatMessage({ id: "COMMON.OBSERVATION" })} width={"15%"} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "SYSTEM.TEAM.DATE" })} dataType="datetime" format="dd/MM/yyyy HH:mm" alignment={"center"} width={"15%"} /> {/*hh: mm */}
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "SYSTEM.TEAM.DATE.END" })} dataType="datetime" format="dd/MM/yyyy HH:mm " alignment={"center"} width={"15%"} />
          <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" />
          <Column dataField="IdItemSharepoint" caption="IdItemSharepoint" visible={false} />
          <Summary>
            <TotalItem
              cssClass="classColorPaginador_"
              column="Descripcion"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>


        </DataGrid>

      </PortletBody>
      {/* POPUP-> Visualizar -PDF*/}
      <FileViewer
        showPopup={{ isVisiblePopUp: isVisiblePopUpFile, setisVisiblePopUp: setisVisiblePopUpFile }}
        cancelar={() => setisVisiblePopUpFile(false)}
        fileBase64={fileBase64}
        fileName={fileName}
      />
    </>
  );
};
EquipoMantenimientoListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
EquipoMantenimientoListPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(WithLoandingPanel(EquipoMantenimientoListPage));
