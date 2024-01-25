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
    let { IdHabitacion, Habitacion, TipoHabitacion, Activo } = usrData || {};
    ([IdHabitacion, Habitacion, TipoHabitacion, Activo] = [ IdHabitacion, Habitacion, TipoHabitacion, objEstadoSimple[Activo] ].map(value => isString(value) ? value.toUpperCase() : value));
    return { IdHabitacion, Habitacion, TipoHabitacion, Activo };
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
  useEffect(() => {
    console.log("Habitacion --> usrData", usrData);
  }, [usrData]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      {
        <Form formData={data} readOnly={true}>
          <GroupItem itemType="group" colCount={2} colSpan={2}>
            <Item dataField="IdHabitacion" label={{ text: intl.formatMessage({ id: "COMMON.CODE" }) }} />
            <Item dataField="Habitacion" label={{ text: intl.formatMessage({ id: "CAMP.ROOM.BED" }) }} colSpan={2} />
            <Item dataField="TipoHabitacion" label={{ text: intl.formatMessage({ id: "CAMP.ROOM.BED.BEDTYPE" }) }} />
            <Item dataField="Activo" label={{ text: intl.formatMessage({ id: "COMMON.STATE" }) }} />
          </GroupItem>
        </Form>
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default injectIntl(DataView);