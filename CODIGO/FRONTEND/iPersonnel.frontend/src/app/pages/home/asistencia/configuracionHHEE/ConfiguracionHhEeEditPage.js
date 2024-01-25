import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Label, Item, GroupItem, RequiredRule } from "devextreme-react/form";
import { Button, TreeView } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { DataGrid, Column, Selection, } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import { Portlet } from "../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
//import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import Alert from '@material-ui/lab/Alert';
import { handleWarningMessages } from "../../../../store/ducks/notify-messages";
import { serviceConceptoHoraExtra } from "../../../../api/asistencia/conceptoHoraExtra.api";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const ConfiguracionHhEeEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton, varIdCompania, dataRowEditNew } = props;
  const [listConceptoHoraExtra, setListConceptoHoraExtra] = useState([]);


  const [dataGrid, setDataGrid] = useState(null);
  const [selectedRowPlanilla, setSelectedRowPlanilla] = useState([]);

  //const [selectedNodeUO, setSelectedNodeUO] = useState([]);
  const [viewCheckHorarioSemanal, setViewCheckHorarioSemanal] = useState(false);
  const [treeViewRefUO, setTreeViewRefUO] = useState(null);

  // TABS HORIZONTAL INI
  const classesEncabezado = useStylesEncabezado();

  let datacheck = [];

  async function cargarCombos() {

    serviceConceptoHoraExtra.obtenerTodos({ IdCliente: "X", IdCompania: varIdCompania, IdConceptoHoraExtra: "" })
      .then(result => {
        setListConceptoHoraExtra(result);
      });

    if (!dataRowEditNew.esNuevoRegistro) {
      console.log("dataRowEditNew", dataRowEditNew.HorarioSemanal);
      setViewCheckHorarioSemanal(dataRowEditNew.HorarioSemanal);
    }

  }

  function validardatos() {
    let result = true;
    let auxArrSedes = [];
    auxArrSedes = treeViewRefUO.props.items.filter(result => { return result.selected });

    if (selectedRowPlanilla.length == 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.SELECTFORM" }));
      result = false;
    }
    else if (auxArrSedes.length == 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.SELECT.UNIT.ORG" }));
      result = false;
    }

    return result;
  }

  function grabar(e) {

    let ArrayIdUnidadOrganizativa = [];

    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (!validardatos()) { return; }

      ArrayIdUnidadOrganizativa = treeViewRefUO.props.items.filter(result => { return result.selected });

      if (dataRowEditNew.esNuevoRegistro) {
        props.agregarRegistro(dataRowEditNew, selectedRowPlanilla, ArrayIdUnidadOrganizativa);
      } else {
        props.actualizarRegistro(dataRowEditNew, selectedRowPlanilla, ArrayIdUnidadOrganizativa);
      }
    }

  }

  const isRequiredRule = (id) => {
    return modoEdicion ? isRequired(id, settingDataField) : false;
  }
  // ::::::::::::::::::::::  OPCIONES TAB  HORIZONTAL INI ::::::::::::::::::::::::::::

  function onEditorPrepared(e) {

    if (e.row != undefined) {
      if (e.row.data.selected === 1) {
        datacheck.push(e.row.data.IdPlanilla);
      }
    }

    setTimeout(function () {
      dataGrid.instance.selectRows(datacheck);
    }, 50);

  }

  function onSelectionChanged(e) {
    setSelectedRowPlanilla(e.selectedRowsData);
  }


  // ::::::::::::::::::::::  ::::::::::::::::::::::::::::

  // function seleccionarNodo(selectNodo, dataAll) {

  //   setSelectedNodeUO([{ selectNodo }, { dataAll }]);

  // }

  useEffect(() => {
    cargarCombos();
  }, []);


  const renderPlanillas = (e) => {
    return (
      <>
        {props.isVisibleAlert && (<>
          <Alert severity="warning" variant="outlined">
            <div style={{ color: 'red' }} >
              {intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.MSG1" })} {" "} {intl.formatMessage({ id: "ASSISTANCE.PAYROLL.MSG2" })}
            </div>
          </Alert>
          <br />
        </>
        )}

        <DataGrid
          dataSource={props.dataPlanilla}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="IdPlanilla"
          ref={(ref) => { setDataGrid(ref); }}
          onSelectionChanged={(e => onSelectionChanged(e))}
          onEditorPrepared={onEditorPrepared}
          repaintChangesOnly={true}
          allowColumnReordering={true}
          allowColumnResizing={true}
          columnAutoWidth={true}
        >
          <Selection mode={"multiple"} />
          <Column dataField="IdPlanilla" caption={intl.formatMessage({ id: "COMMON.CODE" })} width="20%" alignment={"center"} />
          <Column dataField="Planilla" caption={intl.formatMessage({ id: "ASSISTANCE.PAYROLL" })} width="70%" />
        </DataGrid>

      </>
    );
  }

  const renderUnidadOrg = (e) => {
    return (
      <>
        {/* <MenuTreeViewPage
          menus={props.unidadOrganizativaTreeView}
          showCheckBoxesModes={"normal"}
          selectionMode={"multiple"}
          seleccionarNodo={seleccionarNodo}
        // selectNodesRecursive={nodeRecursive}
          //treeViewRef = {treeViewRef}
        /> */}
        <TreeView
          id="treeview-base"
          ref={e => setTreeViewRefUO(e)}
          items={props.unidadOrganizativaTreeView}
          dataStructure="plain"
          virtualModeEnabled={true}
          selectNodesRecursive={true}
          selectionMode={"multiple"}
          showCheckBoxesMode={"normal"}
          selectByClick={true}
          displayExpr="Menu"
          parentIdExpr="IdMenuPadre"
          keyExpr="IdMenu"
          searchEnabled={true}
          searchMode={"contains"}

        />

      </>
    )
  }

  return (
    <>
      <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title={""}
            toolbar={
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
            }
          />
        }
      />

      <PortletBody >
        <React.Fragment>
          <FieldsetAcreditacion title={intl.formatMessage({ id: "COMMON.DETAIL" })}>
            <Form formData={dataRowEditNew} validationGroup="FormEdicion" id="editForm"  >
              <GroupItem itemType="group" colCount={2} colSpan={2}>
                <Item dataField="IdConfiguracionHHEE"
                  //isRequired={modoEdicion}
                  label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                  editorOptions={{
                    maxLength: 20,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: true,
                    placeholder: intl.formatMessage({ id: "COMMON.CODE.AUTO" }).toUpperCase()
                  }}
                />
                <Item
                  dataField="IdConceptoHoraExtra"
                  label={{ text: intl.formatMessage({ id: "ASSISTANCE.OVERTIME.TYPE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: listConceptoHoraExtra,
                    valueExpr: "IdConceptoHoraExtra",
                    displayExpr: "TipoHoraExtra",
                    //disabled: dataRowEditNew.esNuevoRegistro ? true : false,
                    readOnly: !modoEdicion

                  }}
                />

                <Item
                  dataField="RangoInicio"
                  label={{
                    text: intl.formatMessage({ id: "ASSISTANCE.RANGE.START", }),
                  }}
                  isRequired={modoEdicion}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    readOnly: !modoEdicion,
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    showSpinButtons: true,
                    showClearButton: true,
                    width: "50%",
                    min: 1,
                    max: 24
                  }}
                />

                <Item
                  dataField="RangoFin"
                  label={{
                    text: intl.formatMessage({ id: "ASSISTANCE.RANGE.END", })
                  }}
                  isRequired={modoEdicion}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    readOnly: !modoEdicion,
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    showSpinButtons: true,
                    showClearButton: true,
                    width: "50%",
                    min: dataRowEditNew.RangoInicio,
                    max: 24
                  }}
                />

                <Item
                  dataField="DiaLaborable"
                  label={{ text: "Check", visible: false }}
                  editorType="dxCheckBox"
                  //isRequired={modoEdicion}
                  editorOptions={{
                    readOnly: !modoEdicion,
                    text: intl.formatMessage({ id: "ASSISTANCE.WEEKDAY" }),
                    width: "100%",
                    // onValueChanged: ((e) => {
                    //   setMinutosReadOnly(e.value);
                    //   if (e.value === false) props.setDataRowEditNew({ ...dataRowEditNew, AplicarMaximoMinutos: false });
                    // })
                  }}
                />
                <Item
                  dataField="Feriado"
                  label={{
                    text: "Check",
                    visible: false
                  }}
                  //isRequired={modoEdicion}
                  editorType="dxCheckBox"
                  editorOptions={{
                    readOnly: !modoEdicion,
                    text: intl.formatMessage({ id: "ADMINISTRATION.HOLIDAY" }),
                    width: "100%",
                  }}
                />

                <Item
                  dataField="HorarioSemanal"
                  label={{ text: "Check", visible: false }}
                  //isRequired={modoEdicion}
                  editorType="dxCheckBox"
                  editorOptions={{
                    readOnly: !modoEdicion,
                    text: intl.formatMessage({ id: "ASSISTANCE.DAY.ACTIVITY" }),
                    width: "100%",
                    onValueChanged: (e) => { setViewCheckHorarioSemanal(e.value) }
                  }}
                />

                <Item
                  dataField="Domingo"
                  label={{ text: "Check", visible: false }}
                  //isRequired={modoEdicion}
                  editorType="dxCheckBox"
                  editorOptions={{
                    //readOnly: true,
                    //value: viewCheckHorarioSemanal ? 'SI' : '',
                    text: intl.formatMessage({ id: "ASSISTANCE.DAY.ACTIVITY.SUNDAY" }),
                    width: "100%",
                    disabled: !viewCheckHorarioSemanal,
                  }}
                />

                <Item
                  dataField="Orden"
                  label={{ text: intl.formatMessage({ id: "SYSTEM.MODULE.ORDER" }) }}
                  isRequired={modoEdicion}
                  editorType="dxNumberBox"
                  dataType="number"
                  editorOptions={{
                    //readOnly: !(modoEdicion ? configurarPorSemana : false),
                    inputAttr: { style: "text-transform: uppercase; text-align: right" },
                    showSpinButtons: true,
                    showClearButton: true,
                    width: "50%",
                    min: 0,
                    max: 99
                  }}
                />
                <Item
                  dataField="Activo"
                  label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                  editorType="dxSelectBox"
                  isRequired={modoEdicion}
                  editorOptions={{
                    items: listarEstadoSimple(),
                    valueExpr: "Valor",
                    displayExpr: "Descripcion",
                    readOnly: dataRowEditNew.esNuevoRegistro ? true : false,
                    //readOnly: !modoEdicion
                  }}
                />

              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
          <br />

          <div className="row">

            <div className="col-md-6">
              <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.ASSIGNMENT.PAYROLL" })}>
                <div className="card-body" >
                  {renderPlanillas()}
                </div>
              </FieldsetAcreditacion>  
            </div>

            <div className="col-md-6">
              <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.ASSIGNMENT.UNIT.ORG" })}>
                <div className="card-body" >
                  {renderUnidadOrg()}
                </div>
              </FieldsetAcreditacion>
            </div>

          </div>

        </React.Fragment>
      </PortletBody>
    </>
  );
};


export default injectIntl(ConfiguracionHhEeEditPage);
