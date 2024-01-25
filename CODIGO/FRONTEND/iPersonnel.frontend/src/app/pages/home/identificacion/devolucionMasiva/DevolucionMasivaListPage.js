import React from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
// import { isNotEmpty } from "../../../../../_metronic";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";
import { isNotEmpty, PatterRuler, toAbsoluteUrl } from "../../../../../_metronic";
import TextBox from 'devextreme-react/text-box';


import Form, { 
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
  } from "devextreme-react/form";

const DevolucionMasivaListPage = props => {

    const { intl, accessButton } = props;
    const classesEncabezado = useStylesEncabezado();


    const eliminarRegistro = evt => {
        evt.cancel = true;
        props.devolverFotocheck(evt.data);
    };

    const obtenerCampoActivo = rowData => {
        return rowData.Activo === "S";
    }
    
     const seleccionarRegistro = evt=>{
         if (evt.rowIndex === -1) return;
         if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);
     }



     function onCellPrepared(e) {
         if (e.rowType === 'data') {
             if (e.data.Activo === 'N') {
                 e.cellElement.style.color = 'red';
             }
         }
     }

     const textEditing = {
         confirmDeleteMessage:'',
         editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
         deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
     };

     function cellRenderFoto(param) {
      if (param && param.data) {
        const { FotoPC } = param.data;
        return <img src={isNotEmpty(FotoPC) ? FotoPC : toAbsoluteUrl("/media/users/default.jpg")} className="form-avatar-grid" />;
      }
    }

  function onEnterKey(e){
    if (isNotEmpty(e.component._changedValue)){
      props.devolverFotocheck(e.component._changedValue);
    }
  }

    return (
        <>

            <PortletBody>

            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" >
            <GroupItem itemType="group" colCount={2} colSpan={2}>
              <Item colSpan={2}>
                <AppBar position="static" className={classesEncabezado.secundario}>
                  <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                    <Typography variant="h6" color="inherit" className={classesEncabezado.title}>
                    {intl.formatMessage({ id: "COMMON.DATA" })}
                    </Typography>
                  </Toolbar>
                </AppBar>
              </Item>

              <Item dataField="Credencial"
                label={{ text: intl.formatMessage({ id: "IDENTIFICATION.MANAGEMENT.CREDENTIAL" }) }}
                editorType={"dxTextBox"}
                editorOptions={{
                  maxLength: 50,
                  inputAttr: { 'style': 'text-transform: uppercase' },
                  onEnterKey: onEnterKey
                }}
              >
               <RequiredRule message={intl.formatMessage({ id: "COMMON.ISREQUIERD" })} />
              <PatternRule pattern={PatterRuler.LETRAS_NUMEROS_GUIONES} message={intl.formatMessage({ id: "COMMON.ENTER.LETTERS.NUMERIC" })} />
              </Item>

           
            </GroupItem>
          </Form>
          <br></br>

                <DataGrid
                    dataSource={props.dataFotocheksTemportal}
                    showBorders={true}
                    // focusedRowEnabled={true}
                    keyExpr="RowIndex"
                    // onCellPrepared = { onCellPrepared }
                    // onFocusedRowChanged={seleccionarRegistro}
                    // focusedRowKey={props.focusedRowKey}
                    // repaintChangesOnly={true}
                >
                    <Editing
                        mode="row"
                        useIcons={true}
                        allowUpdating={false}
                        allowDeleting={false}
                        texts={textEditing}
                    />

                    <Column 
                      dataField="Foto"
                      caption={intl.formatMessage({ id: "SECURITY.USER.PHOTO" })}
                      width={"8%"}
                      alignment={"center"}
                      cellRender={cellRenderFoto}
                      allowSearch={false}
                      allowFiltering={false}
                      visible={true}
                    />
                    <Column dataField="Credencial" caption={intl.formatMessage({ id: "Código Fotocheck" })} width={"10%"} alignment={"center"}/>
                    <Column dataField="IdCompania" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })} width={"10%"} />
                    <Column dataField="Compania" caption={intl.formatMessage({ id: "IDENTIFICATION.PHOTOCHECK.COMPANY" })} width={"20%"} />
                    <Column dataField="IdPersona" caption={intl.formatMessage({ id: "IDENTIFICATION.PHOTOCHECK.WORKER.CODE" })} width={"10%"} alignment={"center"} />
                    <Column dataField="NombreCompleto" caption={intl.formatMessage({ id: "SECURITY.USER.FULLNAME" })} width={"20%"} />
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="Credencial"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>
        </>
    );
};

export default injectIntl(DevolucionMasivaListPage);
