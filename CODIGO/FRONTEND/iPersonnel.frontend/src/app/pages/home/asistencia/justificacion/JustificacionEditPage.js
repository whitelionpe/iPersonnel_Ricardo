import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import Form, { Label, Item, GroupItem, RequiredRule } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { DataGrid, Column, Selection, } from "devextreme-react/data-grid";
import PropTypes from 'prop-types';
import AccountBalance from '@material-ui/icons/AccountBalance';
import Alert from '@material-ui/lab/Alert';
import FormatListBulleted from '@material-ui/icons/FormatListBulleted';
import FeaturedPlayListIcon from '@material-ui/icons/FeaturedPlayList';

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { listarEstadoSimple, listarEstado } from "../../../../../_metronic";
import { isRequired, isModified } from "../../../../../_metronic/utils/securityUtils";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { Portlet } from "../../../../partials/content/Portlet";
import { useStylesEncabezado, useStylesTab } from "../../../../store/config/Styles";
import MenuTreeViewPage from "../../../../partials/content/TreeView/MenuTreeViewPage";
import { handleWarningMessages } from "../../../../store/ducks/notify-messages";
import FieldsetAcreditacion from '../../../../partials/content/Acreditacion/FieldsetAcreditacion/FieldsetAcreditacion';

const JustificacionEditPage = props => {
  const { intl, modoEdicion, settingDataField, accessButton } = props;
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [estado, setEstado] = useState([]);

  const [configurarPorSemana, setConfigurarPorSemana] = useState(false);
  const [configurarPorDia, setConfigurarPorDia] = useState(false);
  const [AplicarMaximoMinutos, setAplicarMaximoMinutos] = useState(false);
  const [nodeRecursive, setNodeRecursive] = useState(false);

  const [dataGrid, setDataGrid] = useState(null);
  const [selectedRowPlanilla, setSelectedRowPlanilla] = useState([]);

  const [selectedRowDivision, setSelectedRowDivision] = useState([]);
  const [minutosReadOnly, setMinutosReadOnly] = useState(false);

  // TABS HORIZONTAL INI
  const classesEncabezado = useStylesEncabezado();
  const classes = useStylesTab();
  const handleChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const [tabIndex, setTabIndex] = useState(0);

  let datacheck = [];
  let datacheckDivision = [];

  // TABS HORIZONTAL FIN
  async function cargarCombos() {
    let estadoSimple = listarEstadoSimple();
    let data = listarEstado();
    setEstadoSimple(estadoSimple);
    setEstado(data);

  }



  function validardatos() {
    let result = true;
    let auxArrSedes = [];
    auxArrSedes = props.divisionesTreeView.filter(item => item.IdMenuPadre != null && (item.selected != null && item.selected != undefined && item.selected != false));

    if (props.dataRowEditNew.AplicarMaximoMinutos && props.dataRowEditNew.MaximoMinutos == 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.INSERTMAXMINUTE" }));
      result = false;
    }
    else if (props.dataRowEditNew.ConfigurarPorDia && props.dataRowEditNew.NumeroVecesPorDia == 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.INSERTCONFIGDAY" }));
      result = false;
    }
    else if (props.dataRowEditNew.ConfigurarPorSemana && props.dataRowEditNew.NumeroVecesPorSemana == 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.INSERTCONFIGWEEK" }));
      result = false;
    }
    else if (selectedRowPlanilla.length == 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.SELECTFORM" }));
      result = false;
    }
    else if (auxArrSedes.length == 0) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.SELECTDIVISION" }));
      result = false;
    } else if (!props.dataRowEditNew.AplicaPorHora && !props.dataRowEditNew.AplicaPorDia) {
      handleWarningMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VALIDATION.SELECTONECONFIG" }));
      result = false;
    }

    return result;
  }

  function grabar(e) {
    let result = e.validationGroup.validate();
    if (result.isValid) {

      if (!validardatos()) { return; }

      let divisionSelected = [];

      //si el usuario hace click en el treeView, se toman los datos del mismo
      if (selectedRowDivision.length > 0) {
        divisionSelected = (selectedRowDivision[1].dataAll.filter(x => x.selected != null)).filter(y => y.selected !== false);
      }
      else{//si el usuario nunca hizo click en el treeView, se toman los datos que vienen del props(props.divisionesTreeView)
          divisionSelected = props.divisionesTreeView.filter(x => x.selected != null).filter(y => y.selected !== false);
      }

      if (props.dataRowEditNew.esNuevoRegistro) {
        let selectedRowDivisionAux = (divisionSelected.length === 0) ? [] : divisionSelected
        props.agregarJustificacion(props.dataRowEditNew, selectedRowPlanilla, selectedRowDivisionAux);
      } else {
        let selectedRowDivisionAux = (divisionSelected.length === 0) ? [] : divisionSelected
        props.actualizarJustificacion(props.dataRowEditNew, selectedRowPlanilla, selectedRowDivisionAux);
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


  // ::::::::::::::::::::::  OPCIONES TAB  HORIZONTAL END ::::::::::::::::::::::::::::
  function seleccionarNodo(selectNodo, dataAll) {
    setSelectedRowDivision([{ selectNodo }, { dataAll }]);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  useEffect(() => {
    if (!props.dataRowEditNew.esNuevoRegistro) {
      setConfigurarPorSemana(props.dataRowEditNew.ConfigurarPorSemana);
      console.log("test_usefe_dias", props.dataRowEditNew.ConfigurarPorDia)
      setConfigurarPorDia(props.dataRowEditNew.ConfigurarPorDia);
      setAplicarMaximoMinutos(props.dataRowEditNew.AplicarMaximoMinutos);
    }

  }, [props.dataRowEditNew]);


  const renderGenerales = (e) => {
    return (
      <>

        <Form formData={props.dataRowEditNew} validationGroup="FormEdicionx"  >
          <GroupItem itemType="group" colCount={2} >

            <Item colSpan={2}
              dataField="EsSubsidio"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: "¿Es Subsidio?",
                width: "100%"
              }}
            />

            <Item colSpan={2}
              dataField="Remunerado"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.PAID" }),
                width: "100%"
              }}
            />
            <Item colSpan={2}
              dataField="OrigenExterno"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.EXTERNALORIGIN" }),
                width: "100%"
              }}
            />

            <Item colSpan={2}
              dataField="AplicaFuturo"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYFUTURE" }),
                width: "100%"
              }}
            />
            <Item colSpan={2}
              dataField="RequiereObservacion"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.REQUIRESOBSERVATION" }),
                width: "100%"
              }}
            />

            <Item colSpan={2}
              dataField="RequiereAutorizacion"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.AUTHORIZATION" }),
                width: "100%"
              }}
            />
            <Item colSpan={2} ></Item>
            <Item colSpan={2}
              dataField="AplicarDiaDescanso"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYDAYOFF" }),
                width: "100%"
              }}
            />
            <Item colSpan={2}
              dataField="AplicaPorDia"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYDAY" }),
                width: "100%"
              }}
            />

            <Item colSpan={2}
              dataField="AplicaPorHora"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYTIME" }),
                width: "100%",
                onValueChanged: ((e) => {
                  setMinutosReadOnly(e.value);
                  if (e.value === false) props.setDataRowEditNew({ ...props.dataRowEditNew, AplicarMaximoMinutos: false });
                })
              }}
            />
            <Item colSpan={2} ></Item>

            {/* ============ FUNCION MINUTOS ================*/}
            <Item
              dataField="AplicarMaximoMinutos"
              label={{
                text: "Check",
                visible: false
              }}

              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !(modoEdicion ? minutosReadOnly : false),
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.APPLYMAXIMUMHOURS" }),
                width: "100%",
                onValueChanged: ((e) =>
                  setAplicarMaximoMinutos(e.value)
                )
              }}
            />
            <Item
              dataField="MaximoMinutos"
              label={{
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.NUMBER", }), visible: false
              }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? AplicarMaximoMinutos : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                width: "50%",
                min: 1,
                max: 999
              }}
            >
            </Item>

            {/* ============ FUNCION POR DIA ================*/}
            <Item
              dataField="ConfigurarPorDia"
              label={{ text: "Check", visible: false }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.SETBYDAY" }),
                width: "100%",
                onValueChanged: ((e) => {
                  console.log("test_xdias", e.value);
                  setConfigurarPorDia(e.value)
                }

                )
              }}
            />
            <Item
              dataField="NumeroVecesPorDia"
              label={{
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.NUMBERTIMESPERDAY", }), visible: false
              }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? configurarPorDia : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                width: "50%",
                min: 1,
                max: 472
              }}
            >
            </Item>

            {/* ============ FUNCION SEMANA ================*/}
            <Item
              dataField="ConfigurarPorSemana"
              label={{
                text: "Check",
                visible: false
              }}
              editorType="dxCheckBox"
              editorOptions={{
                readOnly: !props.modoEdicion,
                onValueChanged: ((e) => {

                  setConfigurarPorSemana(e.value)
                }),
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.NUMBEROFTIMESPERWEEK" }),
                width: "100%",
                min: 1,
                max: 99
              }}
            />

            <Item
              dataField="NumeroVecesPorSemana"
              label={{
                text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.SETBYWEEK" }), visible: false
              }}
              editorType="dxNumberBox"
              dataType="number"
              editorOptions={{
                readOnly: !(modoEdicion ? configurarPorSemana : false),
                inputAttr: { style: "text-transform: uppercase; text-align: right" },
                showSpinButtons: true,
                showClearButton: true,
                width: "50%",
                min: 1,
                max: 99

              }}
            >
            </Item>

          </GroupItem>
        </Form>
      </>
    );
  }

  const renderPlanillas = (e) => {
    return (
      <>
        {props.isVisibleAlert && (
          <Alert severity="warning" variant="outlined">
            <div style={{ color: 'red' }} >
              {intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.MSG1" })} {" "} {intl.formatMessage({ id: "ASSISTANCE.PAYROLL.MSG2" })}
            </div>
          </Alert>
        )}
        <br />

        <DataGrid
          dataSource={props.dataPlanilla}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="IdPlanilla"
          ref={(ref) => { setDataGrid(ref); }}
          onSelectionChanged={(e => onSelectionChanged(e))}
          onEditorPrepared={onEditorPrepared}
        >
          <Selection mode={"multiple"} />
          <Column dataField="IdPlanilla" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"10%"} alignment={"center"} />
          <Column dataField="Planilla" caption={intl.formatMessage({ id: "ASSISTANCE.PAYROLL" })} width={"40%"} />
        </DataGrid>

      </>
    );
  }

  const renderSedes = (e) => {
    return (
      <>
        <MenuTreeViewPage
          menus={props.divisionesTreeView}
          showCheckBoxesModes={"normal"}
          selectionMode={"multiple"}
          seleccionarNodo={seleccionarNodo}
        />

      </>
    )
  }

  const elementos = [
    { id: "idGenerales", nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.GENERAL" }), icon: <FormatListBulleted fontSize="large" />, bodyRender: (e) => { return renderGenerales() } },
    { id: "idPlanillas", nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.FORMS" }), icon: <FeaturedPlayListIcon fontSize="large" />, bodyRender: (e) => { return renderPlanillas() } },
    { id: "idSedes", nombre: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.VENUES" }), icon: <AccountBalance fontSize="large" />, bodyRender: (e) => { return renderSedes() } },
  ]

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
            <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" id="editForm"  >
              <GroupItem itemType="group" colCount={2} colSpan={2}>

                <Item dataField="IdJustificacion"
                  isRequired={modoEdicion}
                  label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
                  editorOptions={{
                    maxLength: 20,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                    readOnly: !props.dataRowEditNew.esNuevoRegistro ? true : false
                  }}
                >
                </Item>

                <Item dataField="Justificacion"
                  label={{ text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION" }) }}
                  isRequired={modoEdicion ? isRequired('Justificacion', settingDataField) : false}
                  editorOptions={{
                    readOnly: !(modoEdicion ? isModified('Justificacion', settingDataField) : false),
                    maxLength: 100,
                    inputAttr: { 'style': 'text-transform: uppercase' },
                  }}
                >
                </Item>

                <Item dataField="IdCompania" visible={false} />

                <GroupItem itemType="group" colCount={2} colSpan={2}>
                  <Item dataField="CodigoReferencia"
                    label={{ text: intl.formatMessage({ id: "ASSISTANCE.JUSTIFICACION.REFERENCECODE" }) }}
                    isRequired={modoEdicion ? isRequired('Planilla', settingDataField) : false}
                    editorOptions={{
                      maxLength: 20,
                      inputAttr: { 'style': 'text-transform: uppercase' },
                    }}
                  >
                  </Item>
                  <Item
                    dataField="Activo"
                    label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
                    editorType="dxSelectBox"
                    editorOptions={{
                      items: estadoSimple,
                      valueExpr: "Valor",
                      displayExpr: "Descripcion",
                      disabled: props.dataRowEditNew.esNuevoRegistro ? true : false,
                      readOnly: !modoEdicion

                    }}
                  />
                </GroupItem>
                <Item dataField="IdCliente" visible={false} />
              </GroupItem>
            </Form>
          </FieldsetAcreditacion>
          <br />
          <div className="row">

            <div className="col-md-6">
              <div className="card mb-3"  >
                <FieldsetAcreditacion title={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS" })}>
                  <div className="card-body" >
                    {renderGenerales()}
                  </div>
                </FieldsetAcreditacion>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card mb-3" >
                <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.ASSIGNMENT.PAYROLL" })}>
                  <div className="card-body" >
                    {renderPlanillas()}
                  </div>
                </FieldsetAcreditacion>
              </div>
              <div className="card mb-3" >
                <FieldsetAcreditacion title={intl.formatMessage({ id: "ASSISTANCE.ASSIGNMENT.VENUES" })}>
                  <div className="card-body" >
                    {renderSedes()}
                  </div>
                </FieldsetAcreditacion>
              </div>
            </div>
          </div>

        </React.Fragment>
      </PortletBody>
    </>
  );


};




function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Portlet
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </Portlet>
  );
}

TabPanel.propTypes =
{
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function tabPropsIndex(index) {
  return {
    id: `simple-tabpanel-${index}`,
    'aria-controls': `simple-tab-${index}`,
  };
}

export default injectIntl(JustificacionEditPage);
