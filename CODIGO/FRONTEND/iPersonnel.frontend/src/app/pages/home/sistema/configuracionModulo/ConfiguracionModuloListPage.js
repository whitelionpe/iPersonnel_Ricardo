import React, { useState } from "react";
import { injectIntl } from "react-intl";
import { DataGrid, Column, Editing, Summary, TotalItem } from "devextreme-react/data-grid";
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import PropTypes from "prop-types";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import SistemaConfiguracionModuloImportar from "../../../../partials/components/SistemaConfiguracionModuloImportar";
import { handleSuccessMessages } from "../../../../store/ducks/notify-messages";
import { isNotEmpty } from "../../../../../_metronic";

const ConfiguracionModuloListPage = props => {
  const { intl, accessButton, varIdCliente, varIdModulo, varIdAplicacion, cancelarEdicion } = props;
  const [isVisiblePopUpImportar, setisVisiblePopUpImportar] = useState(false);

  const editarRegistro = evt => {
    props.editarRegistro(evt.data);
  };

  const textEditing = {
    confirmDeleteMessage: '',
    editRow: intl.formatMessage({ id: "ACTION.EDIT" })
  };

  function onCellPrepared(e) {
    if (e.rowType === 'data') {
      if (e.data.Activo === 'N') {
        e.cellElement.style.color = 'red';
      }
    }
  }

  const seleccionarRegistro = evt => {
    if (evt.rowIndex === -1) return;
    if (isNotEmpty(evt.row.data)) props.seleccionarRegistro(evt.row.data);

  }


  function showPopUp() {
    setisVisiblePopUpImportar(true);
  }

  function importarConfiguracionModulo(listarConfiguracionImpor) {
    //debugger;
    props.importarConfiguracionModulo(listarConfiguracionImpor);
    setisVisiblePopUpImportar(false);
    handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "MESSAGES.REGISTRY.IMPORT" }));
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
                  <Button
                    icon="movetofolder"
                    type="default"
                    hint={intl.formatMessage({ id: "ACTION.IMPORT" })}
                    onClick={showPopUp}
                  />
                  &nbsp;
                  <Button
                    icon="fa fa-times-circle"
                    type="normal"
                    hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                    onClick={cancelarEdicion}
                  />

                </PortletHeaderToolbar>
              </PortletHeaderToolbar>
            }
          />

        } />


      <PortletBody>
        <DataGrid
          dataSource={props.configuracionesModulo}
          showBorders={true}
          focusedRowEnabled={true}
          keyExpr="RowIndex"
          onEditingStart={editarRegistro}
          onCellPrepared={onCellPrepared}
          repaintChangesOnly={true}
        >
          <Editing
            mode="row"
            useIcons={true}
            allowUpdating={accessButton.editar}
            texts={textEditing}
          />
          <Column dataField="IdConfiguracion" caption={intl.formatMessage({ id: "COMMON.CODE" })} width={"15%"} alignment={"left"} />
          <Column dataField="Configuracion" caption={intl.formatMessage({ id: "SYSTEM.CONFIGURATION" })} width={"35%"} alignment={"left"} />
          <Column dataField="Valor1" caption={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR1" })} width={"10%"} alignment={"center"} />
          <Column dataField="Valor2" caption={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR2" })} width={"10%"} alignment={"center"} />
          <Column dataField="Valor3" caption={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR3" })} width={"10%"} alignment={"center"} />
          <Column dataField="Valor4" caption={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR4" })} width={"10%"} alignment={"center"} />
          <Column dataField="Valor5" caption={intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.VALOR5" })} width={"10%"} alignment={"center"} />
          <Summary>
            <TotalItem
            cssClass="classColorPaginador_"
              column="IdConfiguracion"
              summaryType="count"
              displayFormat={`${intl.formatMessage({ id: "COMMON.TOTAL.ROW" })} {0}`}
            />
          </Summary>
        </DataGrid>
      </PortletBody>

      { isVisiblePopUpImportar && (
        <SistemaConfiguracionModuloImportar
          configuracionesModulo={props.configuracionesModulo}
          showPopup={{ isVisiblePopUp: isVisiblePopUpImportar, setisVisiblePopUp: setisVisiblePopUpImportar }}
          cancelar={() => setisVisiblePopUpImportar(false)}
          importarConfiguracionModulo={importarConfiguracionModulo}
          selectionMode={"multiple"}
          showButton={true}
          selected={props.selected}
          dataRowEditNew={props.dataRowEditNew}
          varIdModulo={varIdModulo}
          varIdAplicacion={varIdAplicacion}
          varIdCliente = {varIdCliente}
        />
      )}

    </>
  );
};

ConfiguracionModuloListPage.propTypes = {
  showHeaderInformation: PropTypes.bool,
};
ConfiguracionModuloListPage.defaultProps = {
  showHeaderInformation: true,
};

export default injectIntl(ConfiguracionModuloListPage);
