import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import ListView from "./components/ListView";
import ModuloItem from "./example/Modulo/ModuloItem";
import { useSelector } from "react-redux";

import { filtrar as filtrarModulo } from "../../../../api/campamento/modulo.api";
import { filtrar as filtrarHabitacion } from "../../../../api/campamento/habitacion.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { arrayToObjectBySomeKey, attachChildren } from "../../../../partials/shared/ArrayAndObjectHelper";
import { isObject } from "../../../../partials/shared/CommonHelper";

const CampamentoEditPage = ({
  idCampamento: IdCampamento,
  titulo,
  cancelarEdicion,
  intl,
}) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  // const initialChanges = { Disabled: false, SectionType: undefined, DetailSectionType: undefined, Habitacion: undefined, };
  const uniqueDataField = 'IdModulo';

  const [source, setSource] = useState([]);

  const getParams = () => {
    const { IdCliente, IdDivision } = perfil;
    const [ filter, sort, pager ] = [ { IdCliente, IdDivision, IdCampamento }, { OrderField: 'Configuracion', OrderDesc: false }, { Skip: 0, Take: 0 } ];
    return { filter, sort, pager };
  }
    
  const getModulos = async () => {
    const { filter, sort, pager } = getParams();
    let config = await filtrarModulo({ filter, sort, pager }).catch(handleErrorMessages);
    // return config.map(item => ({ ...item, ...initialChanges }));
    return config;
  }
  
  const getHabitaciones = async () => {
    const { filter, sort, pager } = getParams();
    return await filtrarHabitacion({ filter, sort, pager }).catch(handleErrorMessages);
  }
  
  const loadData = async () => {
    const data = attachChildren(await getModulos(), 'IdModulo', await getHabitaciones(), { keyNameForChildren: 'Habitaciones' }).slice(0,5);
    // console.log("loadData -> data", data);
    setSource(data);
  };
  // const loadData = async () => {
  //   setSource(attachChildren((await getModulos()).slice(0, 5), 'IdModulo', await getHabitaciones()));
  // };
  // const loadData = async () => {
  //   let modulos = attachChildren((await getModulos()).slice(0, 5), 'IdModulo', await getHabitaciones());
  //   console.log("loadData -> modulos", modulos);
  //   setSource(modulos);
  // };
  // const loadData = async () => {
  //   let modulos = (await getModulos()).slice(0, 5);
  //   const habitaciones = await getHabitaciones();
  //   modulos = attachChildren(modulos, 'IdModulo', habitaciones, { keyNameForChildren: 'Habitaciones' })
  //   setSource(modulos);
  // };
  // const loadData = async () => {
  //   const modulos = (await getModulos()).slice(0, 5);
  //   const modulosById = arrayToObjectBySomeKey(modulos, uniqueDataField);
  //   const habitaciones = arrayToObjectBySomeKey(modulos, uniqueDataField, { valueFunc: () => [] });
  //   (await getHabitaciones()).forEach(item => uniqueDataField in item && item.IdModulo && item.IdModulo in habitaciones? habitaciones[item.IdModulo].push(item) : void 0);
  //   Object.keys(habitaciones).forEach(key => modulosById[key] = { ...modulosById[key], Habitaciones: habitaciones[key] });
  //   setSource(isObject(modulosById) ? Object.values(modulosById) : []);
  // };
  
  const renderHeader = () => {
    return (
      <h4>Soy Headerrrrrrrrrrrrrr</h4>
    );
  }
  const renderItem = ({ item, targetChanges, mergeData, applyChanges }) => {
    return (
      <ModuloItem item={item} targetChanges={targetChanges} mergeData={mergeData} applyChanges={applyChanges}/>
    );
  }
  const renderFooter = () => {
    return (
      <h4>Soy Footerrrrrrrrrrrrrr</h4>
    );
  }

  const performOnAfterChangedIdCampamento = () => { 
    loadData(); 
  }

  useEffect(performOnAfterChangedIdCampamento, [IdCampamento]);

  return (
    <>
      <PortletHeader title={titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <ListView source={source}
          uniqueDataField={uniqueDataField}
          renderHeader={renderHeader}
          renderItem={renderItem}
          renderFooter={renderFooter}
        />
      </PortletBody>
    </>
  );
};

export default injectIntl(CampamentoEditPage);






































/*
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import ListView from "./components/ListView";
import ModuloItem from "./example/Modulo/ModuloItem";
import { useSelector } from "react-redux";

import { filtrar as filtrarModulo } from "../../../../api/campamento/modulo.api";
import { filtrar as filtrarHabitacion } from "../../../../api/campamento/habitacion.api";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { arrayToObjectBySomeKey } from "../../../../partials/shared/ArrayAndObjectHelper";
import { isObject } from "../../../../partials/shared/CommonHelper";

const CampamentoEditPage = ({
  idCampamento: IdCampamento,
  titulo,
  cancelarEdicion,
  intl,
}) => {
  const perfil = useSelector(state => state.perfil.perfilActual);
  // const initialChanges = { Disabled: false, SectionType: undefined, DetailSectionType: undefined, Habitacion: undefined, };
  const uniqueDataField = 'IdModulo';

  const [sourceById, setSourceById] = useState({});
  const [source, setSource] = useState([]);

  const getParams = () => {
    const { IdCliente, IdDivision } = perfil;
    const [ filter, sort, pager ] = [ { IdCliente, IdDivision, IdCampamento }, { OrderField: 'Configuracion', OrderDesc: false }, { Skip: 0, Take: 0 } ];
    return { filter, sort, pager };
  }
    
  const getModulos = async () => {
    const { filter, sort, pager } = getParams();
    let config = await filtrarModulo({ filter, sort, pager }).catch(handleErrorMessages);
    // return config.map(item => ({ ...item, ...initialChanges }));
    return config;
  }
  
  const getHabitaciones = async () => {
    const { filter, sort, pager } = getParams();
    return await filtrarHabitacion({ filter, sort, pager }).catch(handleErrorMessages);
  }
  
  const loadData = async () => {
    const modulos = (await getModulos()).slice(0, 5);
    const modulosById = arrayToObjectBySomeKey(modulos, 'IdModulo');
    const habitaciones = arrayToObjectBySomeKey(modulos, 'IdModulo', { valueFunc: () => [] });
    (await getHabitaciones()).forEach(item => 'IdModulo' in item && item.IdModulo && item.IdModulo in habitaciones? habitaciones[item.IdModulo].push(item) : void 0);
    Object.keys(habitaciones).forEach(key => modulosById[key] = { ...modulosById[key], Habitaciones: habitaciones[key] });
    setSourceById(modulosById);
  };
  
  const renderHeader = () => {
    return (
      <h4>Soy Headerrrrrrrrrrrrrr</h4>
    );
  }
  const renderItem = ({ item, targetChanges, mergeData, applyChanges }) => {
    return (
      <ModuloItem item={item} targetChanges={targetChanges} mergeData={mergeData} applyChanges={applyChanges}/>
    );
  }
  const renderFooter = () => {
    return (
      <h4>Soy Footerrrrrrrrrrrrrr</h4>
    );
  }

  const performOnAfterChangedIdCampamento = () => { 
    loadData(); 
  }
  const performOnAfterChangedSourceById = () => {
    setSource(isObject(sourceById) ? Object.values(sourceById) : []);
  }

  useEffect(performOnAfterChangedIdCampamento, [IdCampamento]);
  useEffect(performOnAfterChangedSourceById, [sourceById]);

  return (
    <>
      <PortletHeader title={titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <ListView source={source}
          uniqueDataField={uniqueDataField}
          renderHeader={renderHeader}
          renderItem={renderItem}
          renderFooter={renderFooter}
        />
      </PortletBody>
    </>
  );
};

export default injectIntl(CampamentoEditPage);
*/





/*
import React from "react";
import { injectIntl } from "react-intl"; 
import { Button } from "devextreme-react";
import { PortletBody, PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";


import ModuloColeccion from "./components/ModuloColeccion";

const CampamentoEditPage = props => {
  const { intl } = props;
  const { idCampamento: IdCampamento } = props;

  const cancelar = async () => {
    await props.cancelarEdicion();
  }

  return (
    <>
      <PortletHeader title={props.titulo}
        toolbar={
          <PortletHeaderToolbar>
            <Button
              icon="fa fa-save"
              type="default"
              hint={intl.formatMessage({ id: "ACTION.RECORD" })}
              // onClick={grabar}
              // useSubmitBehavior={true}
              // validationGroup="FormEdicion"
              visible={props.modoEdicion}
            />
            <Button
              icon="fa fa-times-circle"
              type="normal"
              hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
              onClick={props.cancelarEdicion}
            />
          </PortletHeaderToolbar>
        }
      />
      <PortletBody>
        <React.Fragment>
          <ModuloColeccion IdCampamento={IdCampamento} />
        </React.Fragment>
      </PortletBody>
    </>
  );
};

export default injectIntl(CampamentoEditPage);
*/