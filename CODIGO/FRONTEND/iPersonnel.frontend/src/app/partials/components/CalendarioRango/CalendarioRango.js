import React, { useState, useEffect } from 'react';
import Calendar from 'devextreme-react/calendar';
import { Tooltip } from 'devextreme-react/tooltip';
import { injectIntl } from "react-intl";
import { getStartAndEndOfMonthByDay, addDaysToDate, Meses, isNotEmpty } from '../../../../_metronic/utils/utils';
import './CalendarioRango.css';
import PropTypes from 'prop-types';

const CalendarioRango = (props) => {
  const { intl, cambiarFechaActual } = props;
  const [fechaActual, setFechaActual] = useState();
  const [rangoFecha, setRangoFecha] = useState({
    FechaInicio: new Date(),
    FechaFin: new Date(),
  });
  const ListaMeses = Meses();
  const [rangoFechaText, setRangoFechaText] = useState("-");
  const [cargarFechas, setCargarFechas] = useState(false);
  const cantMeses = 2;
  const [verCalendario, setVerCalendario] = useState(false);

  useEffect(() => {
    //console.log("useEffect ::: ", props.FechaInicio);
    !!props.FechaInicio ? setFechaActual(props.FechaInicio) : setFechaActual(new Date());
    setCargarFechas(true);
  }, []);

  useEffect(() => {
    if (cargarFechas) {
      cargarRangoFechas(fechaActual);
    }
  }, [cargarFechas]);

  //ADD-JDL: Cambiar fecha actual desde otro componente.
  useEffect(() => {
    if (isNotEmpty(cambiarFechaActual)) {
      cargarRangoFechas(cambiarFechaActual);
      setFechaActual(cambiarFechaActual);
      setVerCalendario(false);
    }
  }, [cambiarFechaActual]);

  function fnCambiarMes(isBack) {
    //console.log("============================");
    let fechasTruncas = getStartAndEndOfMonthByDay(fechaActual);
    if (isBack) {
      let nuevaFecha = addDaysToDate(fechasTruncas.FechaInicio, -1);
      setFechaActual(getStartAndEndOfMonthByDay(nuevaFecha).FechaInicio);
      cargarRangoFechas(nuevaFecha);
    } else {
      let nuevaFecha = addDaysToDate(fechasTruncas.FechaFin, +1);
      nuevaFecha = getStartAndEndOfMonthByDay(nuevaFecha).FechaInicio;
      setFechaActual(nuevaFecha);
      cargarRangoFechas(nuevaFecha);
    }
    //console.log("============================");

  }

  function cargarRangoFechas(fecha) {
    let rangoFechaTemp = getStartAndEndOfMonthByDay(fecha, cantMeses);
    let rangoInicial = intl.formatMessage({ id: ListaMeses[rangoFechaTemp.FechaInicio.getMonth()].Descripcion });
    let rangoFinal = intl.formatMessage({ id: ListaMeses[rangoFechaTemp.FechaFin.getMonth()].Descripcion });
    let mensaje = '';
    let anio1 = rangoFechaTemp.FechaInicio.getFullYear();
    let anio2 = rangoFechaTemp.FechaFin.getFullYear();

    if (anio1 === anio2) {
      mensaje = `${rangoInicial} - ${rangoFinal} del ${rangoFechaTemp.FechaInicio.getFullYear()}`;
    } else {
      mensaje = `${rangoInicial}-${anio1} a ${rangoFinal}-${anio2}`;
    }
    //console.log("cargarRangoFechas::rangoFechaTemp>", rangoFechaTemp);
    setRangoFecha(rangoFechaTemp);
    setRangoFechaText(mensaje.toUpperCase());
    props.ejecutarCambioRango(rangoFechaTemp);
  }

  function cargarCalendario() {
    //console.log("CARGAR CALENDARIO");
    setVerCalendario(!verCalendario);
    //console.log("CARGAR CALENDARIO", verCalendario);

  }

  const onCurrentValueChanged = (e) => {
    let fecha = e.value;
    //console.log("onCurrentValueChanged", fecha);
    cargarRangoFechas(fecha);
    setFechaActual(fecha);
    setVerCalendario(false);
  }

  return (
    <div className="input-group mb-3 calendario_grupo">
      <div className="input-group-prepend">
        <button className="btn btn-outline-secondary calendario_button" type="button" onClick={(e) => { fnCambiarMes(true) }} >
          <i className="dx-icon dx-icon-back"></i>
        </button>
      </div>
      <input
        id="calendario_texto"
        value={rangoFechaText} type="text"
        className="form-control calendario_texto"
        placeholder="" readOnly aria-label=""
        aria-describedby="basic-addon1"
        onClick={cargarCalendario}
      />


      <div>
        <Tooltip
          target="#calendario_texto"
          visible={verCalendario}
          closeOnOutsideClick={false}
        >
          <Calendar
            id="calendar-container"
            value={fechaActual}
            onValueChanged={onCurrentValueChanged}
          />
        </Tooltip>
      </div>

      <div className="input-group-append">
        <button className="btn btn-outline-secondary calendario_button" type="button" onClick={(e) => { fnCambiarMes(false) }}>
          <i className="dx-icon dx-icon-chevronnext"></i>
        </button>
      </div>
    </div>
  );
};
CalendarioRango.propTypes = {
  cambiarFechaActual: PropTypes.string,
}
CalendarioRango.defaultProps = {
  cambiarFechaActual: ''
}

export default injectIntl(CalendarioRango); 
