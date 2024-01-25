import React from "react";
import { injectIntl } from "react-intl"; 


import "./style.css";

const ModuloItemDeshabilitadoDataInfo = ({
  item,
  intl,
}) => {
  const { IdModulo, Modulo, TipoModulo } = item;
  
  return (
    <>
      <div className="hidi">
        <div className="kt-widget1">
          <div className="kt-widget1__header mr-3">
            <span className="kt-widget1__title">{Modulo}</span>
            <span className="kt-widget1__desc ml-2">{`(${IdModulo})`}</span>
          </div>
          <div className="kt-widget1__header bottom-header mb-2 mr-3 pb-1">
            {/* <span className="kt-widget1__desc">{IdModulo}</span>
            <span className="kt-widget1__desc"> - </span> */}
            <span className="kt-widget1__desc">{TipoModulo}</span>
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

export default injectIntl(ModuloItemDeshabilitadoDataInfo);
