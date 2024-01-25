import React, { useState, useEffect } from "react";
import { injectIntl } from "react-intl";
import { isString } from "../../../../../../../partials/shared/CommonHelper";
import { listarEstadoSimple } from "../../../../../../../api/sistema/entidad.api";
import { arrayToObjectBySomeKey } from "../../../../../../../partials/shared/ArrayAndObjectHelper";
import Form, { Item, GroupItem } from "devextreme-react/form";

const objEstadoSimple = arrayToObjectBySomeKey(listarEstadoSimple(), 'Valor', { valueFunc: ({ Descripcion }) => Descripcion });

const DataView = ({
  data: usrData,
  intl,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------

  const [data, setData] = useState();
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getData = () => {
    let { IdModulo, Modulo, TipoModulo, Activo } = usrData || {};
    ([IdModulo, Modulo, TipoModulo, Activo] = [ IdModulo, Modulo, TipoModulo, objEstadoSimple[Activo] ].map(value => isString(value) ? value.toUpperCase() : value));
    return { IdModulo, Modulo, TipoModulo, Activo };
  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedUsrData = () => setData(getData());
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedUsrData, [usrData]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <Form formData={data} readOnly={true}>
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="IdModulo" label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }} />
            <Item dataField="Modulo" label={{ text: intl.formatMessage({ id: "CAMP.MODULE" }) }} colSpan={2} />
            <Item dataField="TipoModulo" label={{ text: intl.formatMessage({ id: "CAMP.MODULE.MODULETYPE" }) }} />
            <Item dataField="Activo" label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }} />
          </GroupItem>
        </Form>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default injectIntl(DataView);