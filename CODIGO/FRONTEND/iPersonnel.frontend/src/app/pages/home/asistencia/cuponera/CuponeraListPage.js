import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { isNotEmpty } from "../../../../../_metronic";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { WithLoandingPanel } from "../../../../partials/content/withLoandingPanel";



const CuponeraListPage = props => {
  const { intl, accessButton, companiaData, changeValueCompany, varIdCompania, setVarIdCompania,setFocusedRowKey} = props;

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
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  async function getCompanySeleccionada(idCompania, company) {
    if (isNotEmpty(idCompania)) {
        setVarIdCompania(idCompania);
        changeValueCompany(company[0]);
    }else
    {
      changeValueCompany(null);
    }
  }

  useEffect(() => {
    if(!isNotEmpty(varIdCompania)){
        if (companiaData.length > 0) {
          const { IdCompania } = companiaData[0];
          var company = companiaData.filter(x => x.IdCompania === IdCompania);
          getCompanySeleccionada(IdCompania, company);
       }
     }
 }, [companiaData]);

  return (
    <>

      <PortletHeader
        title={
          <Form>
            <GroupItem itemType="group" colSpan={2}>
                <Item
                    dataField="IdCompania"
                    label={{ text: intl.formatMessage({ id: "ADMINISTRATION.COMPANY.COMPANY" }) }}
                    editorType="dxSelectBox"
                    editorOptions={{
                        items: companiaData,
                        valueExpr: "IdCompania",
                        displayExpr: "Compania",
                        showClearButton: true,
                        value: varIdCompania,
                        onValueChanged: (e) => {
                            if (isNotEmpty(e.value)) {
                                  var company = companiaData.filter(x => x.IdCompania === e.value);
                                  getCompanySeleccionada(e.value, company);
                                  setFocusedRowKey();
                            }else{
                              setVarIdCompania("");
                              getCompanySeleccionada(null, "");
                              setFocusedRowKey();
                            }
                        },
                    }}
                />
            </GroupItem>

          </Form>
        }
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="plus"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.NEW" })}
              onClick={props.nuevoRegistro}
              disabled={isNotEmpty(varIdCompania) ? false : true}
            />
          </PortletHeaderToolbar>
        }
      />

      <PortletBody>
        <DataGrid
          dataSource={props.cuponeraData}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onRowRemoving={eliminarRegistro}
          onFocusedRowChanged={seleccionarRegistro}
          focusedRowKey={props.focusedRowKey}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            allowDeleting={accessButton.eliminar}
            texts={textEditing}
          />

          <Column dataField="Division" caption={intl.formatMessage({ id: "SYSTEM.DIVISION" })} alignment={"center"} />
          <Column dataField="Periodo" caption={intl.formatMessage({ id: "ASSISTANCE.COUPON.PERIOT" })} alignment={"center"} />
          <Column dataField="MesesParaGanarCupon" caption={intl.formatMessage({ id: "ASSISTANCE.COUPON.MONTHTOEARN" })} alignment={"center"} />
          <Column dataField="Cupones" caption={intl.formatMessage({ id: "ASSISTANCE.COUPON.COUPONS" })} alignment={"center"} />
          <Column dataField="HorasCupon" caption={intl.formatMessage({ id: "ASSISTANCE.COUPON.HOURS" })} alignment={"center"} />
          <Column dataField="MaximoCuponesDia" caption={intl.formatMessage({ id: "ASSISTANCE.COUPON.MAXIUM.DAYS" })} alignment={"center"} />
          <Column dataField="MaximoCuponesSemana" caption={intl.formatMessage({ id: "ASSISTANCE.COUPON.MAXIUM.WEEKS" })} alignment={"center"} />

          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="Division"
              alignment="left"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>


        </DataGrid>
      </PortletBody>
    </>
  );
};

export default injectIntl(WithLoandingPanel(CuponeraListPage));
