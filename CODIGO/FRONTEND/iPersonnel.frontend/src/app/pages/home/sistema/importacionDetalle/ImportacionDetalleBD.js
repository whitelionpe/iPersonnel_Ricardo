import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, {
  Item,
  GroupItem,
  SimpleItem,
  ButtonItem,
  RequiredRule,
  StringLengthRule,
  PatternRule
} from "devextreme-react/form";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { useStylesEncabezado } from "../../../../store/config/Styles";

import { listarEstado,listarTipoDatoImportacion, PatterRuler } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { DataGrid, Column, Editing, Summary, TotalItem,FilterRow,Lookup  } from "devextreme-react/data-grid";
import Confirm from "../../../../partials/components/Confirm";

const ImportacionDetalleBD = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [tipoDato, setTipoDato] = useState([]);
  const classesEncabezado = useStylesEncabezado();

  const [disabledFormato, setDisabledFormato] = useState(true);

  const [isVisible, setIsVisible] = useState(false);
  const [instance, setInstance] = useState({});
  const [selectedDelete, setSelectedDelete] = useState({});


  async function cargarCombos() {
    let estadoSimple = listarEstado();
    setEstadoSimple(estadoSimple);

    let tipoDatos = listarTipoDatoImportacion();
    setTipoDato(tipoDatos);

  }

  function grabar(e) {
       props.agregarCamposFromBD(props.dataFromBD);
  }
  
  const textEditing = {
    confirmDeleteMessage:'',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" }),
    deleteRow: intl.formatMessage({ id: "ACTION.REMOVE" }),
};

const eliminarRegistro = (evt) => {
  evt.cancel = true;
  setSelectedDelete(evt.data);
  setIsVisible(true);
};

 function onConfirm() {
     let { RowIndex } = selectedDelete;
     let tmp = props.dataFromBD.filter(x => x.RowIndex !== RowIndex);
     props.setDataTableFromBD(tmp);
  }

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>
 
  <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
                toolbar={

                    <PortletHeader
                        title=""
                        toolbar={
                            <PortletHeaderToolbar>
                                <PortletHeaderToolbar>
                                    <Button
                                    icon="fa fa-save"
                                    type="default"
                                    hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                                    onClick={grabar}
                                    useSubmitBehavior={true}
                                    validationGroup="FormEdicion"
                                    visible={modoEdicion}
                                    disabled={!accessButton.grabar}
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

              <div className="row">
                <div className="col-md-12">
                  <div className="card mb-2" >
                    <div className="card-header card-header-estado" style={{backgroundColor:'gray',borderBottom:'gray'}} >
                      <p>{intl.formatMessage({ id: "SYSTEM.IMPORT.DATABD.INFO" })} </p>
                    </div>
                  </div>
                </div>
              </div>
              
    <PortletBody>
                <DataGrid
                  dataSource={props.dataFromBD}
                  showBorders={true}
                  focusedRowEnabled={true}
                  keyExpr="RowIndex"
                  onRowRemoving={eliminarRegistro}                  
                  repaintChangesOnly={true}
                >
                    <Editing
                        mode="cell" //cell | row
                        useIcons={true}
                        allowUpdating={true}
                        allowDeleting={true}
                        texts={textEditing}
                    />

                    <FilterRow visible={false} showOperationChooser={false} />
                    <Column dataField="Orden" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.ORDER" })} alignment={"center"} width={'5%'} allowEditing={false}  />
                    <Column dataField="Titulo" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.TITLE" })}  allowEditing={false}   />
                    <Column dataField="Campo" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.FIELD" })} allowEditing={false}  />
                    <Column dataField="Importar"  caption="Importar" >
                      <Lookup dataSource={estadoSimple} valueExpr="Valor" displayExpr="Descripcion" />
                      <RequiredRule message="Tiene que ingresar el dato Importar" />
                    </Column>
                    <Column dataField="Obligatorio"  caption={intl.formatMessage({ id: "SYSTEM.IMPORT.REQUIRED" })} allowEditing={false} >
                      <Lookup dataSource={estadoSimple} valueExpr="Valor" displayExpr="Descripcion" />
                    </Column>
                    <Column dataField="Editable"  caption="Editable" visible={false} >
                      <Lookup dataSource={estadoSimple} valueExpr="Valor" displayExpr="Descripcion" />
                    </Column>
                    <Column dataField="TipoDato"  caption={intl.formatMessage({ id: "SYSTEM.IMPORT.DATATYPE" })} allowEditing={false} >
                      <Lookup dataSource={tipoDato} valueExpr="Valor" displayExpr="Descripcion" />
                    </Column>
                    <Column dataField="TamanioDato" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.DATAZISE" })} alignment={"center"} allowEditing={false}   />
                    <Column dataField="Formato" caption={intl.formatMessage({ id: "SYSTEM.IMPORT.FORMAT" })} alignment={"center"}  allowEditing={false} />
                 
                    <Summary>
                        <TotalItem
                        cssClass="classColorPaginador_"
                            column="COLUMN_NAME"
                            summaryType="count"
                            displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
                        />
                    </Summary>

                </DataGrid>
            </PortletBody>

        <Confirm
          message={intl.formatMessage({ id: "ALERT.REMOVE" })}
          isVisible={isVisible}
          setIsVisible={setIsVisible}
          setInstance={setInstance}
          onConfirm={() => onConfirm() }
          title={intl.formatMessage({ id: "CONFIRM.TITLE" })}
          confirmText={intl.formatMessage({ id: "CONFIRM.CONFIRM.TEXT" })}
          cancelText={intl.formatMessage({ id: "CONFIRM.CANCEL.TEXT" })}
        />

    </>
  );
};

export default injectIntl(ImportacionDetalleBD);
