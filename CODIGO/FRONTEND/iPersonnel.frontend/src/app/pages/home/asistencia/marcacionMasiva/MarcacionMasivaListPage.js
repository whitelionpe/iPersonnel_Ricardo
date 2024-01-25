import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem, Export } from "devextreme-react/data-grid";
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

const MarcacionMasivaListPage = props => {
  const { intl, accessButton, setLoading, idModulo, idMenu, idAplicacion,
    dataRowEditNew, varIdCompania, companiaData, getCompanySeleccionada } = props;

  const [fileBase64, setFileBase64] = useState();
  const [fileName, setFileName] = useState();
  const [isVisiblePopUpFile, setisVisiblePopUpFile] = useState(false);

  /*  EVENTOS GRILLAS  */

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
  }

  const seleccionarRegistroDblClick = evt => {
    if (isNotEmpty(evt.data)) {
      props.verRegistroDblClick(evt.data);
    };
  }

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


  const getFiltrar = async () => {
    console.log("Enterg getFiltrar");
    let parameterFilter = {
      FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
      FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
    }
    props.listarCargaMasivoJustificacion(parameterFilter);

  }
 

  useEffect(() => {

    if (isNotEmpty(varIdCompania)) {
      //Filtrar cambio de compania
      let parameterFilter = {
        FechaInicio: dateFormat(dataRowEditNew.FechaInicio, 'yyyyMMdd'),
        FechaFin: dateFormat(dataRowEditNew.FechaFin, 'yyyyMMdd'),
      }
      props.listarCargaMasivoJustificacion(parameterFilter);
    }
  }, [varIdCompania]);

  return (
    <>

      <HeaderInformation
        visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
              <PortletHeaderToolbar>

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
                  icon="fa flaticon2-clip-symbol"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.NEW" }) + " " + intl.formatMessage({ id: "ACTION.IMPORT" })}
                  onClick={props.nuevaAsignacionImportar}
                //---disabled={!accessButton.nuevo}
                />
                &nbsp;
                <Button
                  icon="fa fa-trash"
                  type="default"
                  hint={intl.formatMessage({ id: "ACCREDITATION.REQUEST.BUTTON.GRID.CANCEL" }) + " " + intl.formatMessage({ id: "CONFIG.MENU.ASSISTANCE.REPORT_JUSTIFICATION" })}
                  onClick={props.nuevaCancelacionJustificaciones} 
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
          dataSource={props.marcacionMasivaData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onFocusedRowChanged={seleccionarRegistro}
          onRowDblClick={seleccionarRegistroDblClick}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
          noDataText={intl.formatMessage({ id: "ASSISTANCE.PERSON.JUSTIFICATION.NO_DATA" })}

          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}  
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={false}
            texts={textEditing}
          /> 
          <Column dataField="IdProcesoMasivo" caption={intl.formatMessage({ id: "SYSTEM.PROCESS" })} alignment={"center"} width={"10%"} allowSorting={false} />
          <Column dataField="IdCompania" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} allowSorting={false} />
          <Column dataField="Compania" caption={intl.formatMessage({ id: "CONFIG.MENU.COMEDORES.COMPANIA" })} alignment={"left"} allowSorting={false} /> 
          <Column dataField="CantidadMarcas" caption={"# " + intl.formatMessage({ id: "ADMINISTRATION.BRAND.MAINTENANCE" }) } width={"10%"} alignment={"center"} allowSorting={false} />
          <Column dataField="IdUsuarioCreacion" caption={intl.formatMessage({ id: "AUDIT.USERCREATION" })} alignment={"center"} allowSorting={false} />
          <Column dataField="FechaCreacion" caption={intl.formatMessage({ id: "ASSISTANCE.MASSIVE.JUSTIFICATION.DATE_UPLOAD" })} dataType="date" format="dd/MM/yyyy HH:mm" alignment={"center"} allowSorting={false} />
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

export default injectIntl(WithLoandingPanel(MarcacionMasivaListPage));
