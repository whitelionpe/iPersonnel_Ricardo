import React from "react";
import { injectIntl } from "react-intl"; 


import "./style.css";
import { Button } from "devextreme-react/button";

const HabitacionItemEditorDataInfo = ({
  item,
  mostrarEditor,
  intl,
}) => {
  const { IdHabitacion, Habitacion, TipoHabitacion } = item;
  
  return (
    <>
      <div className="hidi">
        <div className="kt-widget1">
          <div className="kt-widget1__header mr-3">
            <span className="kt-widget1__title">{Habitacion}</span>
            <span className="kt-widget1__desc ml-2">{`(${IdHabitacion})`}</span>
            <div className="buttons-header">
              <Button
                icon="edit"
                hint="Editar"
                type="normal"
                stylingMode="text"
                onClick={mostrarEditor}
              />
            </div>
          </div>
          <div className="kt-widget1__header bottom-header mb-2 mr-3 pb-1">
            {/* <span className="kt-widget1__desc">{IdHabitacion}</span>
            <span className="kt-widget1__desc"> - </span> */}
            <span className="kt-widget1__desc">{TipoHabitacion}</span>
          </div>
          <div className="kt-widget1__item ng-star-inserted">
            <div className="kt-widget1__info">
              <h3 className="kt-widget1__title">Habitaciones</h3>
              <span className="kt-widget1__desc kt-font-brand">Total</span>
            </div>
            <span className="kt-widget1__number kt-font-brand position-relative pt-4">200</span>
          </div>
          <div className="kt-widget1__item ng-star-inserted">
            <div className="kt-widget1__info">
              <span className="kt-widget1__desc kt-font-success">Activas</span>
            </div>
            <span className="kt-widget1__numbe kt-font-success">191</span>
          </div>
          <div className="kt-widget1__item ng-star-inserted">
            <div className="kt-widget1__info">
              <span className="kt-widget1__desc kt-font-danger">Inactivas</span>
            </div>
            <span className="kt-widget1__number kt-font-danger">9</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default injectIntl(HabitacionItemEditorDataInfo);
