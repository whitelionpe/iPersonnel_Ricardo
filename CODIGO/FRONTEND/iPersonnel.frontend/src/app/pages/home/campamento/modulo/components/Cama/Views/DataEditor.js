import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { listarEstadoSimple } from "../../../../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerCmbTipoCama } from "../../../../../../../api/campamento/habitacionCama.api";
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
  const [cmbTipoCama, setCmbTipoCama] = useState([]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getData = () => {
    let { IdCama, Cama, IdTipoCama, Activo } = usrData || {};
    return { IdCama, Cama, IdTipoCama, Activo };
  }
  const cargarCombos = async () => {
    setCmbTipoCama(await obtenerCmbTipoCama({ IdCliente: perfil.IdCliente }));
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
            <Item dataField="IdCama"
              label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
              isRequired={true}
              editorOptions={{
                maxLength: 10,
                inputAttr: { 'style': 'text-transform: uppercase' },
                disabled: !isEditing
              }}
            />
            <Item dataField="Cama"
              label={{ text: intl.formatMessage({ id: "CAMP.MODULE" }) }}
              isRequired={true}
              colSpan={2}
              editorOptions={{
                maxLength: 100,
                inputAttr: { 'style': 'text-transform: uppercase' }
              }}
            />
            <Item
              dataField="IdTipoCama"
              label={{ text: intl.formatMessage({ id: "CAMP.MODULE.MODULETYPE" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: cmbTipoCama,
                valueExpr: "IdTipoCama",
                displayExpr: "TipoCama",
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
            <Item dataField="IdCliente" visible={false} />
            <Item dataField="IdDivision" visible={false} />
            <Item dataField="IdCampamento" visible={false} />
            <Item dataField="IdModulo" visible={false} />
            <Item dataField="IdHabitacion" visible={false} />
          </GroupItem>
        </Form>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default injectIntl(DataEditor);