import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button, Form } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { dateFormat, isNotEmpty } from "../../../../../_metronic";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

import FileViewer from "../../../../partials/content/FileViewer";
import { downloadFile } from "../../../../api/helpers/fileBase64.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";
import { GroupItem, Item } from "devextreme-react/form";
// import WithLoandingPanel from "../../../../partials/content/withLoandingPanel";

const JustificacionMasivaListPage = props => {
  const { intl, accessButton, setLoading, idModulo, idMenu, idAplicacion,
    dataRowEditNew, varIdCompania, companiaData, getCompanySeleccionada } = props;

  const [fileBase64, setFileBase64] = useState();
  const [fileName, setFileName] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  /*  EVENTOS GRILLAS  */
  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarRegistro(evt.data);
  };

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.CantidadPersonas === 0) {
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

  function abrirJustificacionMasiva() {
    setLoading(true);

    props.nuevoRegistro();

    setTimeout(() => {
      setLoading(false);
    }, 555);
  }


  const getFiltrar = async () => {
console.log("Enterg getFiltrar");
    let parameterFilter = {
      FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
    }
    props.listarCargaMasivoJustificacion(parameterFilter);

  }


  return (
    <>

      <HeaderInformation
        visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>
                {/* <Button
                  icon="plus"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" })}
                  onClick={abrirJustificacionMasiva}
                  disabled={!accessButton.nuevo}
                />
                &nbsp;
                <Button
                  icon="fa flaticon2-clip-symbol"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " +
                    intl.formatMessage({ id: "ACTION.IMPORT" })}
                  onClick={props.nuevaAsignacionImportar}
                //disabled={!accessButton.nuevo}
                /> */}

                <Button
                  icon="fa fa-search"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.FILTER" })}
                  onClick={getFiltrar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                />
                &nbsp;
                <Button
                  icon="fa flaticon2-files-and-folders"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ACTION.USED.WIZARD" })}
                  //onClick={props.nuevaAsginacionConAsistente}
                //---disabled={!accessButton.nuevo}
                />
                &nbsp;
                <Button
                  icon="fa flaticon2-clip-symbol"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ACTION.IMPORT" })}
                  onClick={props.nuevaAsignacionImportar}
                //---disabled={!accessButton.nuevo}
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />


      <PortletBody>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
          <GroupItem itemType="group" colCount={4} colSpan={2}>
            <Item colSpan={2}
              dataField="IdCompania"
              label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: companiaData,
                valueExpr: "IdCompania",
                displayExpr: "Compania",
                //showClearButton: true,
                searchEnabled: true,
                value: varIdCompania,
                onValueChanged: (e) => {
                  if (isNotEmpty(e.value)) {
                    var company = companiaData.filter(x => x.IdCompania === e.value);
                    getCompanySeleccionada(e.value, company);
                  }
                }
              }}
            />
            <Item
              dataField="FechaInicio"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }), }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                displayFormat: "dd/MM/yyyy",
              }}
            />
            <Item
              dataField="FechaFin"
              label={{ text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }), }}
              isRequired={true}
              editorType="dxDateBox"
              dataType="datetime"
              editorOptions={{
                displayFormat: "dd/MM/yyyy",
              }}
            />
          </GroupItem>
        </Form>
        <br />


        <DataGrid
          dataSource={props.justificacionMasivoData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
          noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />
          <Column dataField="IdProceso" caption={intl.formatMessage({ id: "Proceso" })} alignment={"center"} width={"10%"} allowSorting={false} />
          <Column dataField="IdCompania" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} allowSorting={false} />
          <Column dataField="Compania" caption={intl.formatMessage({ id: "Compañia" })} alignment={"left"} allowSorting={false} />
          <Column dataField="Justificacion" caption={intl.formatMessage({ id: "Justificacion" })} alignment={"left"} allowSorting={false} />
          <Column dataField="FechaInicio" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.STARTDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} allowSorting={false} />
          <Column dataField="FechaFin" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"} allowSorting={false} />
          <Column dataField="CantidadPersonas" caption={intl.formatMessage({ id: "# Personas" })} width={"10%"} alignment={"center"} allowSorting={false} />
          <Column dataField="NombreArchivo" caption={intl.formatMessage({ id: "COMMON.FILE" })} cellRender={cellRenderFile} width={"10%"} alignment="center" allowSorting={false} />
          <Summary>
            <TotalItem
              cssClass="classColorPaginador_"
              column="IdProceso"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>


        </DataGrid>
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

export default injectIntl(WithLoandingPanel(JustificacionMasivaListPage));
