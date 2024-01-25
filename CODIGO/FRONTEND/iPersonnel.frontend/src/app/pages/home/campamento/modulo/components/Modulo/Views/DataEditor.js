import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { listarEstadoSimple } from "../../../../../../../api/sistema/entidad.api";
import { obtenerTodos as obtenerCmbTipoModulo } from "../../../../../../../api/campamento/tipoModulo.api";
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
  const [cmbTipoModulo, setCmbTipoModulo] = useState([]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getData = () => {
    let { IdModulo, Modulo, IdTipoModulo, Activo } = usrData || {};
    return { IdModulo, Modulo, IdTipoModulo, Activo };
  }
  const cargarCombos = async () => {
    setCmbTipoModulo(await obtenerCmbTipoModulo({ IdCliente: perfil.IdCliente }));
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
  // useEffect(() => {
  //   console.log("DataEditor -> usrData", usrData);
  // }, [usrData]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <Form formData={data}>
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="IdModulo"
              label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
              isRequired={true}
              editorOptions={{
                maxLength: 10,
                inputAttr: { 'style': 'text-transform: uppercase' },
                disabled: !isEditing
              }}
            />
            <Item dataField="Modulo"
              label={{ text: intl.formatMessage({ id: "CAMP.MODULE" }) }}
              isRequired={true}
              colSpan={2}
              editorOptions={{
                maxLength: 100,
                inputAttr: { 'style': 'text-transform: uppercase' }
              }}
            />
            <Item
              dataField="IdTipoModulo"
              label={{ text: intl.formatMessage({ id: "CAMP.MODULE.MODULETYPE" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: cmbTipoModulo,
                valueExpr: "IdTipoModulo",
                displayExpr: "TipoModulo",
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
          </GroupItem>
        </Form>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default injectIntl(DataEditor);