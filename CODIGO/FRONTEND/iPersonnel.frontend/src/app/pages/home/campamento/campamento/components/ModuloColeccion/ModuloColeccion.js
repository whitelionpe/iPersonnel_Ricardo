import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl"; 

import { filtrar as filtrarModulo } from "../../../../../../api/campamento/modulo.api";
import { filtrar as filtrarHabitacion } from "../../../../../../api/campamento/habitacion.api";
import { handleErrorMessages } from "../../../../../../store/ducks/notify-messages";

import ModuloItem from "./ModuloItem";
import { arrayToObjectBySomeKey } from "../../../../../../partials/shared/ArrayAndObjectHelper";

import "./style.css";
import { isArray } from "../../../../../../partials/shared/CommonHelper";

const ModuloColeccion = ({
  IdCampamento,
  intl,
}) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  const initialChanges = { Disabled: false, SectionType: undefined, DetailSectionType: undefined, Habitacion: undefined, };

  const [sourceById, setSourceById] = useState({});
  const [source, setSource] = useState([]);

  const getParams = () => {
    const { IdCliente, IdDivision } = perfil;
    const [ filter, sort, pager ] = [ { IdCliente, IdDivision, IdCampamento }, { OrderField: 'Configuracion', OrderDesc: false }, { Skip: 0, Take: 0 } ];
    return { filter, sort, pager };
  }
  
  const selectItemInEdit = (selected, { forSelected = {}, forUnselected = {} } = {}) => {
    const config = { ...sourceById };
    if (selected) {
      Object.keys(config).filter(key => selected && selected.IdModulo && key !== selected.IdModulo).forEach(key => (config[key] = { ...config[key], ...forUnselected }));
      if (selected && selected.IdModulo) config[selected.IdModulo] = { ...selected, ...forSelected };
    } else {
      Object.keys(config).filter(key => selected && selected.IdModulo && key !== selected.IdModulo).forEach(key => (config[key] = { ...config[key], ...forUnselected }));
    }
    setSourceById(config);
    // setSource(Object.values(config));
  }
  
  const getModulos = async () => {
    const { filter, sort, pager } = getParams();
    let config = await filtrarModulo({ filter, sort, pager }).catch(handleErrorMessages);
    return config.map(item => ({ ...item, ...initialChanges }));
  }
  
  const getHabitaciones = async () => {
    const { filter, sort, pager } = getParams();
    return await filtrarHabitacion({ filter, sort, pager }).catch(handleErrorMessages);
  }
  
  const loadData = async () => {
    const modulos = (await getModulos()).slice(0, 5);
    const modulosById = arrayToObjectBySomeKey(modulos, 'IdModulo');
    const habitaciones = arrayToObjectBySomeKey(modulos, 'IdModulo', { valueFunc: () => [] });
    const tmpHab = (await getHabitaciones());
    // console.log("loadData -> habitaciones, tmpHab", habitaciones, tmpHab);
    tmpHab.forEach(item => 'IdModulo' in item && item.IdModulo && item.IdModulo in habitaciones? habitaciones[item.IdModulo].push(item) : void 0);
    Object.keys(habitaciones).forEach(key => modulosById[key] = { ...modulosById[key], Habitaciones: habitaciones[key] });
    setSourceById(modulosById);
    // selectItemInEdit(undefined, {}, modulosById);
  };

  const performOnAfterChangedIdCampamento = () => { loadData(); }
  const performOnAfterChangedSourceById = () => {
    if (typeof sourceById === 'object') {
      setSource(Object.values(sourceById));
    } else setSource([]);
    console.log("performOnAfterChangedSourceById -> Object.values(sourceById)", Object.values(sourceById));
  }

  // useEffect(performOnAfterChangedIdCampamento, []);
  useEffect(performOnAfterChangedIdCampamento, [IdCampamento]);
  useEffect(performOnAfterChangedSourceById, [sourceById]);
  
  return (
    <>
      {
        source.map(item => {
          return (
            <ModuloItem key={item['IdModulo']} 
              item={item} 
              selectItemInEdit={selectItemInEdit}
            />
          );
        })
      }
    </>
  );
};

export default injectIntl(ModuloColeccion);