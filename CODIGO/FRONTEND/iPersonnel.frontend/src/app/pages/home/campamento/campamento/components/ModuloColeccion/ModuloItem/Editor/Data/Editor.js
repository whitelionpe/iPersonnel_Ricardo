import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl"; 
import Form, { Item } from "devextreme-react/form";
import { Button } from "devextreme-react/button";
import { listarEstadoSimple } from "../../../../../../../../../../_metronic";
import { obtenerTodos as obtenerCmbTipoModulo } from "../../../../../../../../../api/campamento/tipoModulo.api";

import "./style.css";

const ModuloItemEditorDataEditor = ({
  dataEditor,
  grabar,
  cancelar,
  intl,
}) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  
  const [estadoSimple, setEstadoSimple] = useState([]);
  const [cmbTipoModulo, setCmbTipoModulo] = useState([]);

  const cargarCombos = async () => {
    let cmbTipoModulo = await obtenerCmbTipoModulo({ IdCliente: perfil.IdCliente });
    let estadoSimple = listarEstadoSimple();

    setCmbTipoModulo(cmbTipoModulo);
    setEstadoSimple(estadoSimple);
  }

  useEffect(() => {
    cargarCombos();
  }, []);

  return (
    <>
      <div className="midi">
        <div className="kt-widget1">
          <div className="kt-widget1__header bottom-header mb-2 mr-3 pb-1">
            <span className="kt-widget1__title editor text-info">Edición</span>
            <div className="buttons-header">
              <Button
                icon="floppy"
                hint="Guardar"
                type="normal"
                stylingMode="text"
                onClick={grabar}
              />
              <Button
                icon="undo"
                hint="Cancelar"
                type="normal"
                stylingMode="text"
                onClick={cancelar}
              />
            </div>
          </div>
          <Form formData={dataEditor}>
            <Item dataField="IdModulo"
              label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }}
              isRequired={true}
              editorOptions={{
                maxLength: 10,
                inputAttr: { 'style': 'text-transform: uppercase' },
              }}
            />
            <Item dataField="Modulo"
              label={{ text: intl.formatMessage({ id: "CAMP.CAMP" }) }}
              isRequired={true}
              colSpan={2}
              editorOptions={{
                maxLength: 100,
                inputAttr: { 'style': 'text-transform: uppercase' },
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
            <Item dataField="Activo"
              label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }}
              editorType="dxSelectBox"
              isRequired={true}
              editorOptions={{
                items: estadoSimple,
                valueExpr: "Valor",
                displayExpr: "Descripcion",
              }}
            />
          </Form>
        </div>
      </div>
    </>
  );
};

export default injectIntl(ModuloItemEditorDataEditor);
