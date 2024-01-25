import React, { useEffect, useState } from "react";
import { PortletHeader, PortletHeaderToolbar } from "../../../../partials/content/Portlet";
import { Button } from 'devextreme-react';
import './Componentes/style.css';
import './style.css';
import Bus, { columnLayoutType, sectionType, cssClassType } from "../../../../partials/components/Bus";
import { handleErrorMessages } from "../../../../store/ducks/notify-messages";
import { service } from "../../../../api/transporte/manifiesto.api";
import { service as serviceVehiculo   } from "../../../../api/transporte/vehiculoAsiento.api";
import { ContentPopoverInformacion, ContentPopoverReservar, ContentPopoverEliminarReservacion } from "./Componentes/Bus";
import { injectIntl } from "react-intl";
import HeaderInformation from "../../../../partials/components/HeaderInformation";

const classNameAsientos = {
  'LI': 'blanco',
  'RE': 'azul-corporativo',
  'OC': 'marron',
  'IN': cssClassType.Inactivo,
  'NE': 'transparente-con-borde',
  'ND': 'transparente-con-borde',
}

const ManifiestoAsientos = props => {

  const { esModificable,intl } = props;
  const [configuracionVehiculo, setConfiguracionVehiculo] = useState({});
  const [configuracionAsientos, setConfiguracionAsientos] = useState([]);
  const [placa, setPlaca] = useState();

  const cssClassItem = data => classNameAsientos[data.IdEstadoAsiento.toUpperCase()];
  const ltConfig = {
    dataField: 'IdEstadoAsiento',
    tooltip: data => data.EstadoAsiento,
  }
  const rtConfig = {
    icon: 'fa fa-info-circle',
    isText: false,
    showPopoverWhenClicked: true,
    visible: data => data.IdEstadoAsiento !== 'IN' && data.IdEstadoAsiento !== 'NE',
    tooltip: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.VIEW.INFO" }),
  }
  const lbConfig = {
    icon: 'dx-icon dx-icon-rowfield',
    isText: false,
    visible: data => false && data.Activo && (data.IdEstadoAsiento === 'RE' || data.IdEstadoAsiento === 'OC'),
    tooltip: intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CHANGE.PASSENGER" }), // 'Cambiar pasajero',
  }
  const rbConfig = {
    icon: data => {
      if (data.IdEstadoAsiento === 'LI') return 'fa fa-plus-circle';
      if (data.IdEstadoAsiento === 'RE') return 'fa fa-minus-circle';
    },
    isText: false,
    showPopoverWhenClicked: true,
    visible: data => data.Activo,
    tooltip: data => {
      if (data.IdEstadoAsiento === 'LI') return  intl.formatMessage({ id: "TRANSPORTE.MANIFEST.RESEVED" }); //'Reservar'
      if (data.IdEstadoAsiento === 'RE') return intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DELETE.RESEVED" }); // 'Eliminar reserva';
    },
  }
  const closeOnOutsideClickPopover = type => {
    switch (type) {
      case sectionType.LeftBottom:
      case sectionType.RightBottom: return false;
    }
    return true;
  }
  const contentRenderPopover = ({ type, data, instance }) => {
    switch (type) {
      case sectionType.RightTop:
        if (data.IdEstadoAsiento !== 'ND')
          return <ContentPopoverInformacion
            data={data}
            popoverInstance={instance}
            esModificable={esModificable} />;
        if (data.IdEstadoAsiento === 'ND') return (
          <h5> {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.SEATS" })} <b> {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.LIBRE" })} </b> {intl.formatMessage({ id: "TRANSPORTE.MANIFEST.MSGMAXIMIUNPASSENGER" })} </h5>
        );
        break;
      case sectionType.RightBottom:
        if (data.IdEstadoAsiento === 'RE')
          return <ContentPopoverEliminarReservacion
            data={data}
            popoverInstance={instance}
            cargarConfiguracionAsientos={cargarConfiguracionAsientos} />;
        if (data.IdEstadoAsiento === 'LI')
          return <ContentPopoverReservar
            data={{ ...data, FechaProgramacion: props.FechaProgramacion }}
            popoverInstance={instance}
            trabajadores={getTrabajadoresReservados()}
            cargarConfiguracionAsientos={cargarConfiguracionAsientos} />;
        break;
    }
  }
  const titlePopover = (type, data) => {
    if (type === sectionType.RightTop) return  intl.formatMessage({ id: "TRANSPORTE.MANIFEST.INFORMATION" }).toUpperCase(); // 'Información';
    if (type === sectionType.RightBottom && data && data.IdEstadoAsiento === 'LI') return  intl.formatMessage({ id: "TRANSPORTE.MANIFEST.RESEVED" }).toUpperCase(); //'Reservar';
    if (type === sectionType.RightBottom && data && data.IdEstadoAsiento === 'RE') return intl.formatMessage({ id: "TRANSPORTE.MANIFEST.CONFIRMDELETE.RESERVED" }).toUpperCase(); //'¿Confirmación de eliminación de reserva?';
  }

  const getTrabajadoresReservados = () => {
    let trabajadores = [];
    configuracionAsientos.forEach(row => {
      if (row && row.length > 0) {
        row.forEach(item => {
          if (item && item.NumeroDocumentoIdentidad) {
            trabajadores.push(item.NumeroDocumentoIdentidad);
          }
        });
      }
    });
    return trabajadores;
  }
  const cargarConfiguracionVehiculo = async () => {
    setConfiguracionAsientos(undefined);
    await serviceVehiculo.obtener({ IdVehiculo: props.IdVehiculo }).then((response) => {
      const { Placa, EstaConfiguradoNivel1 } = response;
      setConfiguracionVehiculo(response);
      setPlaca(Placa);
      if (EstaConfiguradoNivel1) {
        cargarConfiguracionAsientos(response);
      } else {
        setConfiguracionAsientos(undefined);
      }
    }).catch(err => {
      handleErrorMessages(err);
    });
  }
  const cargarConfiguracionAsientos = async (configVehiculo = configuracionVehiculo) => {
      await service.listarInformacionAsientos({ IdManifiesto: props.IdManifiesto }).then((response) => {
        const config = getConfiguracionAsientos(response, configVehiculo);
      setConfiguracionAsientos(config);
    }).catch(err => {
      handleErrorMessages(err);
    });
  }
  const getConfiguracionAsientos = (list, configVehiculo) => {
    const { CantidadColumnasNivel1: CantidadColumnas } = configVehiculo;
    let config = [];
    if (list && list.length > 0) {
      const numMaxFila = list.map(({ Fila = -1 }) => Fila).sort((a, b) => b - a)[0];
      for (let i = 0; i <= numMaxFila; i++) config.push([]);
      for (let r = 0; r <= numMaxFila; r++) {
        for (let c = 0; c < CantidadColumnas; c++) {
          config[r][c] = getItemAsiento(r, c, list);
        }
      }
    }
    return config;
  }
  const getObjectFromListAsientos = (list) => {
    let obj = {};
    if (list && list.length > 0) {
      list.forEach(item => {
        const { Fila = -1, Columna = -1, EsEspacioVacio = false } = item;
        obj[`${Fila}-${Columna}`] = !EsEspacioVacio ? item : null;
      });
    }
    return obj;
  }
  const getItemAsiento = (fila, columna, list) => getObjectFromListAsientos(list)[`${fila}-${columna}`] ? getObjectFromListAsientos(list)[`${fila}-${columna}`] : null;

  useEffect(() => {
    cargarConfiguracionVehiculo();
  }, [props.IdManifiesto]);

  return (
    <>

      
  <HeaderInformation data={props.getInfo()} visible={true} labelLocation={'left'} colCount={3}
        toolbar={
          <PortletHeader
          title={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.DISTRIBUTION.SEATS" })} 
          toolbar={
            <PortletHeaderToolbar>
              &nbsp;
              <Button
                icon="refresh"
                type="success"
                text={intl.formatMessage({ id: "ACTION.REFRESH" })} 
                onClick={cargarConfiguracionVehiculo}
              />
              <Button
                className="ml-3"
                icon="fa fa-times-circle"
                type="normal"
                stylingMode="outlined"
                text={intl.formatMessage({ id: "ACTION.CANCEL" })} 
                onClick={props.cancelarEdicion}
              />
            </PortletHeaderToolbar>
          }
        />
        }
      />

      <Bus
        source={configuracionAsientos}
        columnCount={columnLayoutType.Five}
        width={500}
        cssClass="mb-3"
        uniqueDataField="Asiento"
        textDataField="Asiento"
        cssClassItem={cssClassItem}
        ltConfig={ltConfig}
        rtConfig={rtConfig}
        lbConfig={lbConfig}
        rbConfig={rbConfig}
        showTitlePopover={true}
        titlePopover={titlePopover}
        contentRenderPopover={contentRenderPopover}
        closeOnOutsideClickPopover={closeOnOutsideClickPopover}
        widthPopover={650}
        emptyDataMessage={intl.formatMessage({ id: "TRANSPORTE.MANIFEST.NOSETTING.SEATS" })} 
      />
    </>
  );
};

export default injectIntl(ManifiestoAsientos);
