import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { injectIntl } from "react-intl";
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Button } from "devextreme-react";

import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";

import { handleErrorMessages } from "../../../../store/ducks/notify-messages";

import { filtrar as filtrarModulo } from "../../../../api/campamento/modulo.api";
import { filtrar as filtrarHabitacion } from "../../../../api/campamento/habitacion.api";
import { filtrar as filtrarCama } from "../../../../api/campamento/habitacionCama.api";

import { Header, Modulo, Habitacion, Cama } from "./components";
import { Actions } from "./components/Shared";

import LayoutView from "../../../../partials/components/LayoutView";
import { isNullOrUndefined, isArray, isSet, isObject } from "../../../../partials/shared/CommonHelper";
import HeaderInformation from "../../../../partials/components/HeaderInformation";
import { arrayPrimitiveValueToObjectKeyValueSame } from "../../../../partials/shared/ArrayAndObjectHelper";

import "./components/boxes-grid.css";
import "./components/style.css";

const ModuloConfiguracion = ({
  IdCampamento,
  IdModulo,
  getInfo,
  cancelarEdicion,
  intl,
}) => {
  // --------------------------------------------------------------------
  // declarations
  // --------------------------------------------------------------------
  const ComponentTagType = { Header, Modulo, Habitacion, Cama };
  const ComponentType = arrayPrimitiveValueToObjectKeyValueSame(Object.keys(ComponentTagType));

  const { IdCliente, IdDivision } = useSelector(state => state.perfil.perfilActual);

  const [nivel, setNivel] = useState(1);
  const [totalNiveles, setTotalNiveles] = useState(10);
  const [data, setData] = useState(); // información del módulo
  const [changes, setChanges] = useState({}); // información del módulo
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // functionalities for the component
  // --------------------------------------------------------------------
  const getParams = (filter = {}) => {
    const [ auxFilter, sort, pager ] = [ 
      { IdCliente, IdDivision, IdCampamento, IdModulo, Nivel: nivel, ...filter }, 
      { OrderField: 'Configuracion', OrderDesc: false }, 
      { Skip: 0, Take: 0 } 
    ];
    return { filter: auxFilter, sort, pager };
  }
  const getData = async (sourceFunc, filter = {}, onlyFirst = false) => {
    const data =  await sourceFunc(getParams(filter)).catch(handleErrorMessages);
    return !onlyFirst ? data : (isArray(data, true) ? data[0] : undefined);
  }
  const getModulo = (filter = {}) => getData(filtrarModulo, filter, true);
  const getHabitaciones = (filter = {}, onlyFirst = false) => getData(filtrarHabitacion, filter, onlyFirst);
  const getCamas = (filter = {}, onlyFirst = false) => getData(filtrarCama, filter, onlyFirst);
  const loadData = async () => {
    let modulo = undefined;
    if (isSet(nivel))  {
      modulo = await getModulo();
      if (!isNullOrUndefined(modulo)) {
        const habitaciones = await getHabitaciones();
        modulo['Habitaciones'] = !isNullOrUndefined(habitaciones) ? habitaciones : [];
      }
    }
    setData(modulo);
  }
  const applyChanges = (changesToMerge = {}) => {
    // console.log("applyChanges -> changes, changesToMerge", changes, changesToMerge)
    let merge = isObject(changes) ? changes : {};
    // console.log("applyChanges 1: -> merge", merge)
    if (isObject(changesToMerge)) merge = { ...merge, ...changesToMerge };
    // console.log("applyChanges 2: -> merge", merge)
    setChanges(merge);
  }
  const performAction = async (type, params = {}) => {
    switch(type) {
      case Actions.LoadModulo: loadData(); break;
      case Actions.GetCamas: return await getCamas(params);
    }
  }
  // const performAction = async (type, params = {}) => {
  //   switch(type) {
  //     case Actions.LoadModulo: loadData(); break;
  //     case Actions.GetCamas: return await getCamas(params);
  //   }
  // }
  const onChangePage = page => setNivel(page);
  const getExtraProps = type => {
    switch (type) {
      case ComponentType.Modulo: return { currentPage: nivel, totalPages: totalNiveles, onChangePage, changes, applyChanges, performAction };
      case ComponentType.Habitacion: return { changes, applyChanges, getCamas, performAction };
      case ComponentType.Cama: return { changes, applyChanges, performAction };
    }
    return {};
  }
  const renderComponent = (type, props = {}) => {
    const { [type]: ComponentTag } = ComponentTagType;
    return (
      <ComponentTag { ...props } { ...getExtraProps(type) } />
    );
  }
  const renderCenter = (props) => {
    return (
      <Grid fluid className="">
        <Row><Col xs>{ renderComponent(ComponentType.Modulo, props) }    </Col></Row>
        <Row><Col xs><hr /></Col></Row>
        <Row><Col xs>{ renderComponent(ComponentType.Habitacion, props) }</Col></Row>
        <Row><Col xs><hr /></Col></Row>
        <Row><Col xs>{ renderComponent(ComponentType.Cama, props) }      </Col></Row>
      </Grid>
    );
  }
  const renderToolbar = () => {
    return (
      <PortletHeader
        title=""
        toolbar={
          <PortletHeaderToolbar>
            <PortletHeaderToolbar>
              <Button
                icon="plus"
                type="default"
                hint={intl.formatMessage({ id: "ACTION.NEW" })}
                onClick={nuevoModulo}
              />
              &nbsp;
              <Button
                icon="fa fa-times-circle"
                type="normal"
                hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                onClick={cancelarEdicion}
              />
            </PortletHeaderToolbar>
          </PortletHeaderToolbar>
        }
      />
    );
  }
  const nuevoModulo = () => {

  }
  // --------------------------------------------------------------------
  
  // --------------------------------------------------------------------
  // functionality for effects
  // --------------------------------------------------------------------
  const performOnAfterChangedStatesForModuloConfiguracion = () => { loadData(); };
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // attach effects
  // --------------------------------------------------------------------
  useEffect(performOnAfterChangedStatesForModuloConfiguracion, [ IdCampamento, IdModulo, nivel ]);
  // --------------------------------------------------------------------

  // --------------------------------------------------------------------
  // rendering
  // --------------------------------------------------------------------
  return (
    <>
      <HeaderInformation visible={true}
        data={getInfo()} 
        labelLocation={'left'} 
        colCount={8} 
        toolbar={renderToolbar()}
      />
      {
        isSet(nivel) && 
        <LayoutView data={data}
          layoutCssClass="modulo-layout"
          centerCssClass="p-0"
          renderCenter={renderCenter}
        />
      }
    </>
  );
  // --------------------------------------------------------------------
};

export default injectIntl(ModuloConfiguracion);