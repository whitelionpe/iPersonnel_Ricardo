import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { listarEstadoSimple } from "../../../../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerCmbTipoHabitacion } from "../../../../../../../api/campamento/tipoHabitacion.api";
import Form, { Item, GroupItem } from "devextreme-react/form";
import { useSelector } from "react-redux";

const estadoSimple = listarEstadoSimple();

const DataEditor = ({
  data: usrData,
  isEditing = true,
  intl,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [data, setData] = useState();
  const [cmbTipoHabitacion, setCmbTipoHabitacion] = useState([]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getData = () => {
    let { IdHabitacion, Habitacion, IdTipoHabitacion, Activo } = usrData || {};
    return { IdHabitacion, Habitacion, IdTipoHabitacion, Activo };
  }
  const cargarCombos = async () => {
    setCmbTipoHabitacion(await obtenerCmbTipoHabitacion({ IdCliente: perfil.IdCliente }));
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const inicialization = () => { cargarCombos(); }
  const performOnAfterChangedUsrData = () => setData(getData());
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(inicialization, []);
  useEffect(performOnAfterChangedUsrData, [usrData]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <Form formData={data}>
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="IdHabitacion"
              label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
              isRequired={true}
              editorOptions={{
                maxLength: 10,
                inputAttr: { 'style': 'text-transform: uppercase' },
                disabled: !isEditing
              }}
            />
            <Item dataField="Habitacion"
              label={{ text: intl.formatMessage({ id: "CAMP.ROOM.BED" }) }}
              isRequired={true}
              colSpan={2}
              editorOptions={{
                maxLength: 100,
                inputAttr: { 'style': 'text-transform: uppercase' }
              }}
            />
            <Item
              dataField="IdTipoHabitacion"
              label={{ text: intl.formatMessage({ id: "CAMP.ROOM.BED.BEDTYPE" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: cmbTipoHabitacion,
                valueExpr: "IdTipoHabitacion",
                displayExpr: "TipoHabitacion",
              }}
            />
            <Item
              dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
                disabled: isEditing
              }}
            />
            <Item dataField="IdModulo" visible={false}/>
            <Item dataField="IdCampamento" visible={false}/>
          </GroupItem>
        </Form>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default injectIntl(DataEditor);