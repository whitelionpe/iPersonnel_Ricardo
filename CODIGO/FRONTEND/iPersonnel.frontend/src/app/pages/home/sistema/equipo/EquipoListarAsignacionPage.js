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

const EquipoListarAsignacionPage = props => {
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
    const { NombreArchivo } = evt.data;

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
          dataSource={props.equiposAsignacion}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            texts={textEditing}
          />
          <Column dataField="Modulo" caption={intl.formatMessage({ id: "CAMP.RESERVATION.MODULE" })} width={"30%"} />
          <Column dataField="Zona" caption={intl.formatMessage({ id: "ACCESS.GROUP.RESTRICTION.ZONE" })} width={"40%"} />
          <Column dataField="ModuloAlternativo" caption={intl.formatMessage({ id: "SYSTEM.TEAM.MODULE.ALTERNATIVE" })} width={"30%"} />
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

    </>
  );
};
EquipoListarAsignacionPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
EquipoListarAsignacionPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(WithLoandingPanel(EquipoListarAsignacionPage));
