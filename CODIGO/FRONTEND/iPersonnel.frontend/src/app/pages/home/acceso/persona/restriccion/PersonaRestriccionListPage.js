import React, { useState } from "react";
import { DataGrid, Column, Editing } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { isNotEmpty } from "../../../../../../_metronic";

import FileViewer from "../../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../../api/helpers/fileBase64.api";
import { handleErrorMessages } from "../../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../../partials/content/withLoandingPanel";

const PersonaRestriccionListPage = props => {

  //multi-idioma
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

  const obtenerCampoActivo = rowData => {
    return rowData.FlgDiaCompleto === "S";
  }

  const seleccionarRegistro = evt => {
    props.seleccionarRegistro(evt.data);
  }

  const descargarArchivo = async (evt) => {

    const { NombreArchivo, IdItemSharepoint } = evt.data;
    if (fileName !== NombreArchivo) {
      setFileName(NombreArchivo);
      let params = {
        FileName: NombreArchivo,
        idItemSharepoint: IdItemSharepoint,
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
        <React.Fragment>
          <Form>
            <GroupItem>
              <Item>
                <DataGrid
                  dataSource={props.personaRestriccionData}
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
                    allowUpdating={accessButton.editar}
                    allowDeleting={accessButton.eliminar}
                    texts={textEditing}
                  />
                  <Column dataField="RowIndex" caption="#" width={"7%"} alignment={"center"} />
                  <Column dataField="Restriccion" caption={intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION" })} width={"40%"} />
                  <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
                  <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" width={"15%"} alignment={"center"} />
                  <Column dataType="boolean" dataField="FlgDiaCompleto" caption={intl.formatMessage({ id: "ACCESS.PERSON.RESTRICTION.COMPLETEDAY" })} width={"10%"} calculateCellValue={obtenerCampoActivo} />
                  <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" />


                </DataGrid>
              </Item>
            </GroupItem>
          </Form>
        </React.Fragment>
      </PortletBody>
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


PersonaRestriccionListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
  pathFile: PropTypes.string,
};
PersonaRestriccionListPage.defaultProps = {
  showHeaderInformation: true,
  pathFile: ""
};

export default injectIntl(WithLoandingPanel(PersonaRestriccionListPage));
