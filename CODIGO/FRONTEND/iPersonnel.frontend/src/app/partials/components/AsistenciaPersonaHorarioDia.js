import React, { useEffect } from "react";
import { injectIntl } from "react-intl";
import PropTypes from "prop-types";
import { getDayWeek, isNotEmpty } from "../../../_metronic";
//import { Table } from "react-bootstrap";
import './AsistenciaPersonaHorarioDia.css';

const AsistenciaPersonaHorarioDia = props => {
  const { intl, horarioDia } = props;

  //console.log("AsistenciaPersonaHorarioDia", { horarioDia });

  useEffect(() => {
  }, []);

  return (

    <div className={"content"}>
      <div className={"row"} >
        <div className={"col-md-5"}>
          {isNotEmpty(horarioDia.HoraEntradaInicio) && (
            <p className="dayName" > {getDayWeek(new Date(horarioDia.HoraEntradaInicio))} </p>
          )}
        </div>
        <div className={"col-md-7"}>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'center' }}>
                <th className="header-dia" > {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.TURN" }).toUpperCase()} </th>
                <th className="header-ingreso"> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.ENTRY" }).toUpperCase()} </th>
                <th className="header-refrigerio" colSpan={2}> {intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.REFRESHMENT" }).toUpperCase()} </th>
                <th className="header-salida">{intl.formatMessage({ id: "ASSISTANCE.SCHEDULE.DAY.DEPARTURE" }).toUpperCase()}</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ textAlign: 'center' }} >
                <td className="detail">  {horarioDia.Turno === "N" ? (<i className="fas fa-moon" style={{ fontSize: "15px" }} />) : (<i className="fas fa-sun text-warning " style={{ fontSize: "15px" }} />)} </td>
                <td className="detail"> {horarioDia.HoraEntrada} </td>
                <td className="detail"> {horarioDia.InicioRefrigerio} </td>
                <td className="detail"> {horarioDia.FinRefrigerio} </td>
                <td className="detail">{horarioDia.HoraSalida}  </td>
              </tr>
            </tbody>
          </table>

        </div>

      </div>
    </div>
  );
};

AsistenciaPersonaHorarioDia.propTypes = {
  horarioDia: PropTypes.object,

};
AsistenciaPersonaHorarioDia.defaultProps = {
  horarioDia: {},
};
export default injectIntl(AsistenciaPersonaHorarioDia);
