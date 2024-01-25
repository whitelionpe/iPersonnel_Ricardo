import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useSelector } from "react-redux";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { injectIntl } from "react-intl";
import { dateFormat, isNotEmpty, exportExcelDataGrid } from "../../../../../../_metronic";
import {
  DataGrid,
  Column,
  Editing,
  FilterRow,
  HeaderFilter,
  FilterPanel,
  Selection,
  Summary,
  TotalItem
} from "devextreme-react/data-grid";
import { Doughnut, Bar } from "react-chartjs-2";
import Form, {
  Item,
  GroupItem,
  PatternRule,
  EmptyItem
} from "devextreme-react/form";
import { handleInfoMessages } from "../../../../../store/ducks/notify-messages";
import CampamentoPerfilBuscar from "../../../../../partials/components/CampamentoPerfilBuscar";
import { getStartAndEndOfMonthByDay, truncateDate } from '../../../../../../_metronic/utils/utils';
import { campamentos as listarCampamentos } from "../../../../../api/campamento/perfilDetalle.api";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";

const ReporteReservasLiberadasListPage = props => {

  const { intl, setLoading } = props;
  const perfil = useSelector(state => state.perfil.perfilActual);


  const [campamentos, setCampamentos] = useState([]);

  const [viewFilter, setViewFilter] = useState(true);
  const [dataGridRef, setDataGridRef] = useState(null);
  const [dataHistogramaAutorizadores, setDataHistogramaAutorizadores] = useState([]);


  async function cargarCombos() {
    setLoading(true);
    let { FechaInicio, FechaFin } = getStartAndEndOfMonthByDay(new Date(), 1);
    FechaInicio = truncateDate(new Date());

    let IdCliente = perfil.IdCliente;
    let IdDivision = perfil.IdDivision;

    let IdCampamento = "";
    let [tmp_campamento] = await Promise.all([
      listarCampamentos({ IdCliente, IdDivision, IdPerfil: '' }),
    ]).finally(() => { });

    if (tmp_campamento.length > 0) {
      IdCampamento = tmp_campamento[0].IdCampamento;
    }

    setCampamentos(tmp_campamento);
    setLoading(false);
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
    title = intl.formatMessage({ id: "Reporte_ReservasLiberadas" });
    fileName = intl.formatMessage({ id: "Reporte_ReservasLiberadas" }) + "_" + dateFormat(new Date(), "yyyyMMdd");

    if (dataGridRef != undefined) {
      refDataGrid = dataGridRef.instance;
      exportExcelDataGrid(title, refDataGrid, fileName);
    }
    else {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.NO.DATA" }) + " " + intl.formatMessage({ id: "ACTION.EXPORT" }));
    }

  }

  const filtrar = (e) => {
    const { FechaInicio, FechaFin } = props.dataRowEditNew;

    if (!isNotEmpty(FechaInicio) || !isNotEmpty(FechaFin)) {
      handleInfoMessages(intl.formatMessage({ id: "CAMP.RESERVATION.DATE.VALIDATE" }));
      return;
    }

    props.dataRowEditNew.FechaInicio = FechaInicio;
    props.dataRowEditNew.FechaFin = FechaFin;
    props.listarResultadoAutorizadores();

  }


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
              onClick={(e) => filtrar(e)}
              disabled={viewFilter ? false : true}
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
          <GroupItem itemType="group" colCount={2} >

            <Item
              dataField="IdCampamento"
              label={{ text: intl.formatMessage({ id: "CAMP.RESERVATION.CAMP" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: campamentos,
                valueExpr: "IdCampamento",
                displayExpr: "Campamento",
                placeholder: "Seleccione..",
              }}
            />

            <EmptyItem />
            <GroupItem itemType="group" colSpan={2} >
              <div className="row">
                <div className="col-md-12">
                  <fieldset className="scheduler-border" >
                    <legend className="scheduler-border" > <h5>{intl.formatMessage({ id: "CAMP.DATE.REMOVALDATE" })} </h5></legend>
                    <Form formData={props.dataRowEditNew} validationGroup="FormEdicion" colCount={2}>
                      <Item dataField="FechaInicio"
                        label={{ text: intl.formatMessage({ id: "CAMP.DATE.FROM" }) }}
                        isRequired={true}
                        editorType="dxDateBox"
                        editorOptions={{
                          type: "date",
                          inputAttr: { 'style': 'text-transform: uppercase' },
                          displayFormat: "dd/MM/yyyy",
                        }}
                      />

                      <Item dataField="FechaFin"
                        label={{ text: intl.formatMessage({ id: "CAMP.DATE.UNTIL" }) }}
                        isRequired={true}
                        editorType="dxDateBox"
                        editorOptions={{
                          type: "date",
                          inputAttr: { 'style': 'text-transform: uppercase' },
                          displayFormat: "dd/MM/yyyy",
                        }}
                      />
                    </Form>
                  </fieldset>
                </div>
              </div>
            </GroupItem>

          </GroupItem>
        </Form>

        <br />

        <DataGrid
          dataSource={props.dataReporte}
          ref={ref => { setDataGridRef(ref); }}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          repaintChangesOnly={true}
        >
          <FilterRow visible={true} showOperationChooser={false} />
          <HeaderFilter visible={false} />
          <FilterPanel visible={false} />

          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={false}
            allowDeleting={false}
          />

          <Column
            dataField="Campamento" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.CAMP" })}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />
          <Column
            dataField="Habitacion" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.ROOM" })}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />
          <Column
            dataField="Cama" caption={intl.formatMessage({ id: "CAMP.PROFILE.DETAIL.BED" })}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />
          <Column
            dataField="NombreCompleto"
            caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.FULLNAME" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />
          <Column dataField="TipoDocumento"
            caption={intl.formatMessage({ id: "SYSTEM.DOCUMENTOTYPE" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />
          <Column dataField="Documento" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.DOCUMENT" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />
          <Column
            dataField="Compania" caption={intl.formatMessage({ id: "ADMINISTRATION.PERSON.COMPANY" })}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />
          <Column dataField="FechaInicioReserva" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.STARTDATE" })} dataType="date" format="dd/MM/yyyy"
            alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />
          <Column dataField="FechaFinReserva" caption={intl.formatMessage({ id: "CASINO.PERSON.GROUP.ENDDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />
          <Column dataField="FechaEliminacion" caption={intl.formatMessage({ id: "CAMP.DATE.REMOVALDATE" })} dataType="date" format="dd/MM/yyyy" alignment={"center"}
            allowSorting={false}
            allowFiltering={false}
            allowHeaderFiltering={false}
          />
          <Column dataField="IdUsuarioEliminacion" caption={intl.formatMessage({ id: "AUDIT.DELETEUSER" })}
            alignment={"center"}
            allowSorting={false}
            allowFiltering={true}
            allowHeaderFiltering={true}
          />








          <Summary>
            <TotalItem
              cssClass="classColorPaginador_"
              column="Compania"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
              width={150}
            />
          </Summary>
        </DataGrid>


      </PortletBody >
    </>
  );
};

export default injectIntl(WithLoandingPanel(ReporteReservasLiberadasListPage));

