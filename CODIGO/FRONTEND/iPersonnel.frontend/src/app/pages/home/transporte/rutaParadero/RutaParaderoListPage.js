import React, { useEffect, useState } from "react";
import Form, { GroupItem } from "devextreme-react/form";
import { Button } from "devextreme-react";
import { handleInfoMessages } from "../../../../store/ducks/notify-messages";
import DataGrid, { Column, Editing, RowDragging, Paging, ColumnChooser } from 'devextreme-react/data-grid';

import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import TransporteParaderosBuscar from '../../../../partials/components/transporte/popUps/TransporteParaderosBuscar';
import { injectIntl } from "react-intl";

const RutaParaderoListPage = props => {

  const { intl, selected } = props;
  const [dataGridParaderosSeleccionados, setDataGridParaderosSeleccionados] = useState(null);
  const [popUpVisibleParaderos, setpopUpVisibleParaderos] = useState(false);

  const textEditing = {
    confirmDeleteMessage: '',
  };

  const grabar = () => {
    dataGridParaderosSeleccionados.instance.saveEditData().then(() => {
      if (props.dataParaderosSeleccionados.length === 0 || props.dataParaderosSeleccionados.length === undefined) {
        handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "TRANSPORTE.WHEREABOUTS.NOT.WHEREAS.MSG" }));

        return;
      }
        const data = props.dataParaderosSeleccionados.map((item, index) => ({ ...item, Orden: (index + 1) }));
        const { IdTipoRuta } = selected;
        if (IdTipoRuta === 'NORMAL') {
          props.actualizarParaderos(props.IdRuta, data);

        } else {
          props.actualizarParaderos(props.IdRuta, data);
        }
    })
  }

 
  const eliminarRegistro = evt => {
    evt.cancel = true;
    props.eliminarParadero(evt.data);
  }

  const getParaderosNoSeleccionados = () => {
    const { dataParaderosSeleccionados: seleccionados = [], paraderos = [] } = props;

    if (paraderos && paraderos.length > 0) {
      const idsSeleccionados = (seleccionados || []).map(({ IdParadero }) => IdParadero);
      const noSeleccionados = paraderos.filter(({ IdParadero }) => !idsSeleccionados.includes(IdParadero));
      return noSeleccionados;
    }
    return [];
  }

  const mostrarPopupAgregarParaderos = () => {
      const hayParaderos = getParaderosNoSeleccionados().length > 0;
      if (hayParaderos) setpopUpVisibleParaderos(true);
      else handleInfoMessages(intl.formatMessage({ id: "TRANSPORTE.WHEREABOUTS.NOT.WHEREAS.MSG" }));

  }

  const onReorder = e => {
    let visibleRows = e.component.getVisibleRows(),
      toIndex = props.dataParaderosSeleccionados.indexOf(visibleRows[e.toIndex].data),
      fromIndex = props.dataParaderosSeleccionados.indexOf(e.itemData);

    props.dataParaderosSeleccionados.splice(fromIndex, 1);
    props.dataParaderosSeleccionados.splice(toIndex, 0, e.itemData);

    e.component.refresh();

    props.setDataParaderosSeleccionados([...props.dataParaderosSeleccionados]);
  }

  const getInfo = () => {
    let Origen = '', Destino = '';
    const data = props.dataParaderosSeleccionados;
    if (data && data.length > 0) {
      Origen = data[0].Paradero;
      if (data.length > 1) Destino = data[data.length - 1].Paradero;
    }

    return [

      { text: [intl.formatMessage({ id: "TRANSPORTE.ROUTE" })], value: selected.Ruta, colSpan: 1 },
      { text: [intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.ORIGEN" })], value: Origen, colSpan: 1 },
      { text: [intl.formatMessage({ id: "SYSTEM.CONFIGURATIONS.DESTINO" })], value: Destino, colSpan: 1 },

    ];
  }

  const agregarParaderos = (personas) => {

      const { dataParaderosSeleccionados: seleccionados = [] } = props;

      if (personas.length == 0) {
      handleInfoMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), intl.formatMessage({ id: "TRANSPORTE.WHEREABOUTS.NOT.WHEREAS.MSG" }));
      return;
      }

      const seleccionadosYAgregados = [...seleccionados, ...personas];
      const data = seleccionadosYAgregados.map((item, index) => ({ ...item, Orden: (index + 1) }));

      const { IdTipoRuta } = selected;
      if (IdTipoRuta === 'NORMAL') {
      props.actualizarParaderos(props.IdRuta, data);

      } else {
        props.actualizarParaderos(props.IdRuta, data);
      }
        setpopUpVisibleParaderos(false);

  };


   useEffect(() => {
   }, []);

  return (
    <>
    
  <HeaderInformation data={getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
            title={''}
            toolbar={
              <PortletHeaderToolbar>
               <Button 
                icon="fa fa-plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.ADD" })}
                onClick={mostrarPopupAgregarParaderos}
                />
               &nbsp;
                <Button
                  icon="fa fa-save"
                  type="default"
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={grabar}
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
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

        <PortletBody>

          {/* <Form validationGroup="FormEdicion">
            <GroupItem itemType="group" visible={true} >
              <ColumnChooser enabled={true} mode="select" />
                <Button
                  onClick={mostrarPopupAgregarParaderos}
                  text="Agregar"
                  icon="fieldchooser"
                  type="default"
                  style={{marginBottom:"10px"}}
                />
             </GroupItem>
          </Form> */}

          <DataGrid
            dataSource={props.dataParaderosSeleccionados}
            showBorders={true}
            keyExpr="IdParadero"
            visible={true}
            ref={ref => { setDataGridParaderosSeleccionados(ref); }}
            onRowRemoving={eliminarRegistro}
          >
            <RowDragging
              allowReordering={true}
              onReorder={onReorder}
              showDragIcons={true}
            />
            <Editing
              mode="cell"
              useIcons={true}
              allowDeleting={true}
              texts={textEditing}
            />

            <Paging enabled={true} defaultPageSize={10} />
            <Column dataField="IdParadero" caption={intl.formatMessage({ id: "COMMON.CODE" })} editorOptions={false} allowEditing={false} visible={false} />
            <Column dataField="Paradero" caption={intl.formatMessage({ id: "TRANSPORTE.WHEREABOUTS" })} editorOptions={false} allowEditing={false} />
          </DataGrid>
        </PortletBody>

          {popUpVisibleParaderos && (
              <TransporteParaderosBuscar
                  selectData={agregarParaderos}
                  showPopup={{ isVisiblePopUp: popUpVisibleParaderos, setisVisiblePopUp: setpopUpVisibleParaderos }}
                  cancelarEdicion={() => setpopUpVisibleParaderos(false)}
                  uniqueId={"TransporteParaderosRutaParaderoBuscar"}
                  showButton={true}
                  selectionMode={"multiple"}
                  IdRuta = {props.IdRuta}
              />
          )}

    </>
  );

};

export default injectIntl(RutaParaderoListPage);
