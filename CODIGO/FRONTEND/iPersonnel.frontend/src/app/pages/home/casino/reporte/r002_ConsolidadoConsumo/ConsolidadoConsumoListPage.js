import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { dateFormat, isNotEmpty, exportExcelDataGrid } from "../../../../../../_metronic";
import DataGrid, { Column, Editing, Selection, Summary, SortByGroupSummaryInfo, TotalItem } from 'devextreme-react/data-grid';
import Form, {
  Item,
  GroupItem,
  PatternRule
} from "devextreme-react/form";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import { obtenerTodos as obtenerCmbComedor } from "../../../../../api/casino/comedor.api";
import { obtenerTodos as obtenerCmbServicio } from "../../../../../api/casino/comedorServicio.api";
import AdministracionCompaniaBuscar from "../../../../../partials/components/AdministracionCompaniaBuscar";
import AdministracionCentroCostoBuscar from "../../../../../partials/components/AdministracionCentroCostoBuscar";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const ConsolidadoConsumoListPage = props => {

  const { intl, accessButton,setLoading } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [viewFilter, setViewFilter] = useState(true);
  const [dataGridRef, setDataGridRef] = useState(null);

  const [cmbComedor, setCmbComedor] = useState([]);
  const [cmbServicio, setCmbServicio] = useState([]);
  const [popupVisibleCompania, setPopupVisibleCompania] = useState(false);
  const [isVisibleCentroCosto, setisVisibleCentroCosto] = useState(false);
  const [Filtros, setFiltros] = useState({ FlRepositorio: "1", IdUnidadOrganizativa: "" });


  async function cargarCombos() {
    setLoading(true);
    await Promise.all([
        obtenerCmbComedor({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdTipo: '%' }),
    ])
        .then(resp => {
            setCmbComedor(resp[0]);
        })
        .finally(resp => {
            setLoading(false);
        })
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


  const hideFilter = () => {
    let form = document.getElementById("FormFilter");
    if (viewFilter) {
      setViewFilter(false);
      form.classList.add('hidden');
    } else {
      form.classList.remove('hidden');
      setViewFilter(true);
    }
  }


  const exportarDatos = () => {
    let title = "";
    let refDataGrid = null;
    let fileName = "";
    title = intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.CONSOLIDADOCONSUMO" });
    fileName = intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.CONSOLIDADOCONSUMO" }) + "_" + dateFormat(new Date(), "yyyyMMdd");

    if (dataGridRef != undefined) {
      refDataGrid = dataGridRef.instance;
      exportExcelDataGrid(title, refDataGrid, fileName);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }) + " " + intl.formatMessage({ id: "ACTION.EXPORT" }));
    }

  }

  const filtrar = (e) => {
    let result = e.validationGroup.validate();
    if (result.isValid) {
    props.listarResultadoAutorizadores();
    }
  }

  const limpiar = () => {
    props.setDataRowEditNew({FechaInicio:props.dataRowEditNew.FechaInicio, FechaFin:props.dataRowEditNew.FechaFin}); 
  };


  async function CargarServicios(idComedor) {
      let cmbServicioX = await obtenerCmbServicio({ IdCliente: perfil.IdCliente, IdDivision: perfil.IdDivision, IdComedor: idComedor });
      setCmbServicio(cmbServicioX);
  }

  const selectCompania = dataPopup => {
    const { IdCompania, Compania } = dataPopup[0];
    props.dataRowEditNew.IdCompania = IdCompania;
    props.dataRowEditNew.Compania = Compania;
    setPopupVisibleCompania(false);
  }

  const agregarCentroCosto = (dataPopup) => {
    const { IdCentroCosto, CentroCosto } = dataPopup[0];
    setisVisibleCentroCosto(false);
    if (isNotEmpty(IdCentroCosto)) {
        props.setDataRowEditNew({
            ...props.dataRowEditNew,
            IdCentroCosto: IdCentroCosto,
            CentroCosto: CentroCosto,
        });
    }
  };

  useEffect(() => {
    cargarCombos();
  }, []);


  return (
    <>
      <PortletHeader
        title={''}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon={viewFilter ? "chevronup" : "chevrondown"}
              type="default"
              hint={viewFilter ? intl.formatMessage({ id: "COMMON.HIDE" }) : intl.formatMessage({ id: "COMMON.SHOW" })}
              onClick={hideFilter}
            />
            &nbsp;
            <Button
              icon="fa fa-search"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.FILTER" })}
              validationGroup="FormEdicion"
              onClick={filtrar}
              disabled={viewFilter ? false : true}
            />
               &nbsp;
              <Button
                icon="clearformat"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.CLEAN" })}
                onClick={limpiar}
                visible={true}
              />

            &nbsp;
            <Button
              icon="fa fa-file-excel"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.EXPORT" })}
              disabled={(props.tabIndex === 0) ? true : false}
              onClick={exportarDatos}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>

        <Form id="FormFilter" formData={props.dataRowEditNew} validationGroup="FormEdicion" >
          <GroupItem itemType="group" colCount={2} colSpan={2}>

          <Item
                                dataField="IdComedor"
                                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM" }) }}
                                editorType="dxSelectBox"
                                editorOptions={{
                                    items: cmbComedor,
                                    valueExpr: "IdComedor",
                                    displayExpr: "Comedor",
                                    showClearButton: true,
                                     onValueChanged: (e) => {
                                         if (isNotEmpty(e.value)) {
                                             CargarServicios(e.value);
                                         }
                                     },
                                }}
                            />

                            <Item
                                dataField="IdServicio"
                                editorType="dxSelectBox"
                                label={{ text: intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" }) }}
                                editorOptions={{
                                    items: cmbServicio,
                                    valueExpr: "IdServicio",
                                    showClearButton: true,
                                     displayExpr: function (item) {
                                         if (item) {
                                             return item.Servicio + "- [" + item.HoraInicio + " " + item.HoraFin + "]";
                                         }
                                     },
                                }}
                            />

                            <Item

                                dataField="Compania"
                                label={{ text: intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.DININGROOMS" }) }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { 'style': 'text-transform: uppercase' },
                                    showClearButton: true,
                                    buttons: [{
                                        name: 'search',
                                        location: 'after',
                                        useSubmitBehavior: true,
                                        options: {
                                            stylingMode: 'text',
                                            icon: 'search',
                                            disabled: false,
                                            onClick: () => {
                                               setPopupVisibleCompania(true);
                                            },
                                        }
                                    }]
                                }}
                            />

                            <Item
                                colSpan={1} dataField="CentroCosto"

                                label={{ text: intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.CENTROCOSTO" }), }}
                                editorOptions={{
                                    readOnly: true,
                                    hoverStateEnabled: false,
                                    inputAttr: { style: "text-transform: uppercase" },
                                    showClearButton: true,
                                    buttons: [
                                        {
                                            name: "search",
                                            location: "after",
                                            useSubmitBehavior: true,
                                            options: {
                                                stylingMode: "text",
                                                icon: "search",
                                                disabled:false,
                                                 onClick: () => {
                                                      setFiltros({ FlRepositorio: "1", IdUnidadOrganizativa: "" })
                                                      setisVisibleCentroCosto(true);
                                                 },
                                            },
                                        },
                                    ],
                                }}
                            />


                            <Item
                                dataField="FechaInicio"
                                isRequired={true}
                                label={{
                                    text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.STARTDATE" }),
                                }}
                                editorType="dxDateBox"
                                dataType="datetime"
                                editorOptions={{
                                    inputAttr: { style: "text-transform: uppercase" },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />

                            <Item
                                dataField="FechaFin"
                                isRequired={true}
                                label={{
                                    text: intl.formatMessage({ id: "ACCESS.PERSON.MARK.ENDDATE" }),
                                }}
                                editorType="dxDateBox"
                                dataType="datetime"
                                editorOptions={{
                                    inputAttr: { style: "text-transform: uppercase" },
                                    displayFormat: "dd/MM/yyyy",
                                }}
                            />

          </GroupItem>
        </Form>

        <br />

        <DataGrid
          dataSource={props.resultadoAutorizadores}
          ref={ref => { setDataGridRef(ref); }}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={false}
            texts={textEditing}
          />
          <Column caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.DATA" }).toUpperCase()} alignment={"center"} >
            <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.CONTRACT.RUC" })}  alignment={"center"}  width={"5%"}  />
            <Column dataField="Compania" caption={intl.formatMessage({ id: "ACCREDITATION.REPORT.COMPANY" })}  />
            <Column dataField="Comedor" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM" })} />
            <Column dataField="Servicio" caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE" })}  alignment={"center"} />
          </Column>

          <Column caption={intl.formatMessage({ id: "CASINO.CONSOLIDATED.REPORT.TOTAL" }).toUpperCase()} alignment={"center"} >
            <Column dataField="FormatCurrency" caption={intl.formatMessage({ id: "CONFIG.MENU.SISTEMA.MONEDA" })}  alignment={"center"} width={"5%"} /> 
            <Column dataField="TotalNumeroDeServicios" 
              caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.NUMBER" })} 
              alignment={"center"}
              format="#,##0.00"
            />
            <Column dataField="TotalCostoAsumidoEmpresa" 
            caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST.COMPANY" })} 
            alignment={"center"} 
            format="#,##0.00"
            />
            <Column dataField="TotalCostoAsumidoTrabajador" 
            caption={intl.formatMessage({ id: "CASINO.DINNINGROOM.SERVICE.COST.EMPLOYEE" })} 
            alignment={"center"}
            format="#,##0.00"
            />
          </Column>

        
          <Summary recalculateWhileEditing={true}>
            <TotalItem
              column="TotalNumeroDeServicios"
              summaryType="sum"
              // valueFormat="currency" 
              displayFormat={`${intl.formatMessage({id:"TOTAL"}) } {0}`}
              />
             <TotalItem
              column="TotalCostoAsumidoEmpresa"
              summaryType="sum" 
              displayFormat={`${intl.formatMessage({id:"TOTAL"}) } {0}`}
              />
             <TotalItem
              column="TotalCostoAsumidoTrabajador"
              summaryType="sum" 
              displayFormat={`${intl.formatMessage({id:"TOTAL"}) } {0}`}
              />
          </Summary> 
 

        </DataGrid>

        {/*******>POPUP DE COMPANIAS>******** */}
        <AdministracionCompaniaBuscar
          selectData={selectCompania}
          showPopup={{ isVisiblePopUp: popupVisibleCompania, setisVisiblePopUp: setPopupVisibleCompania }}
          cancelarEdicion={() => setPopupVisibleCompania(false)}
          uniqueId={"companiabuscarConsolidado02Page"}
        />

        {/*******>POPUP DE CENCTRO COSTO >******** */}
        {isVisibleCentroCosto && (
            <AdministracionCentroCostoBuscar
                selectData={agregarCentroCosto}
                showButton={false}
                showPopup={{ isVisiblePopUp: isVisibleCentroCosto, setisVisiblePopUp: setisVisibleCentroCosto }}
                cancelarEdicion={() => setisVisibleCentroCosto(false)}
                uniqueId={"Consolidado02PageBuscarCentroCostoListPage"}
                selectionMode={"row"}
                Filtros={Filtros}
            />
        )}

      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(ConsolidadoConsumoListPage));
