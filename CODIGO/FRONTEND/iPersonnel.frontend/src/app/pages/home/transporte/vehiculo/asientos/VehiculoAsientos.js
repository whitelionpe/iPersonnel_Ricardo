import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl";
import { Button } from 'devextreme-react';
import Form, { Item, GroupItem, SimpleItem } from "devextreme-react/form";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { v4 as uuid4 } from "uuid";

import { useStylesEncabezado } from "../../../../../store/config/Styles";
import Bus, { sectionType, eventType, cssClassType, sectionContentType } from "../../../../../partials/components/Bus";
import BoxStyleList from "../../../../../partials/components/BoxStyleList";
import { handleErrorMessages, handleSuccessMessages } from "../../../../../store/ducks/notify-messages";
import ControlSwitch from "../../../../../store/ducks/componente/componenteSwitch";
import HeaderInformation from "../../../../../partials/components/HeaderInformation";
import { PortletHeader, PortletHeaderToolbar } from "../../../../../partials/content/Portlet";
import { service } from "../../../../../api/transporte/vehiculoAsiento.api";
import { WithLoandingPanel } from "../../../../../partials/content/withLoandingPanel";
import { ContentPopoverAsiento } from "../Bus";

import "./style.css";

const classNameAsientos = {
  'S': 'azul-corporativo',
  'N': cssClassType.Inactivo,
  'V': cssClassType.Opaco50,
}

const classNameRepetidos = [
  'estilo-rojo',
  'estilo-anaranjado',
  'estilo-violeta',
  'estilo-verde-olivo',
  'estilo-verde-opaco',
  'estilo-verde-encendido',
  'estilo-amarillo',
];



const bgColors = {
  "S": "bg-asiento-activo",
  "N": "bg-asiento-inactivo",
  "V": "bg-asiento-vacio",
};

const frColors = {
  "S": "text-asiento-activo",
  "N": "text-asiento-inactivo",
  "V": "text-asiento-vacio",
};

const VehiculoAsientos = props => {

  const { intl } = props;
  const classesEncabezado = useStylesEncabezado();
  const [configuracionVehiculo, setConfiguracionVehiculo] = useState({});
  const [layoutConfig, setLayoutConfig] = useState({ CantidadColumnas: 5, ColumnaPasadizo: 3 });
  const [cantidadColumnas, setCantidadColumnas] = useState(5);
  const [valorMaximoColumnaPasadizo, setValorMaximoColumnaPasadizo] = useState(5);
  const [listAsientos, setListAsientos] = useState([]);
  const [configuracionAsientos, setConfiguracionAsientos] = useState([]);
  const [resumen, setResumen] = useState();
  const [esReconfiguracion, setEsReconfiguracion] = useState(false);
  const [esReorganizacionNumerosAsientos, setEsReorganizacionNumerosAsientos] = useState(false);
  const [hayAsientosRepetidos, setHayAsientosRepetidos] = useState(false);
  const [summary, setSummary] = useState([]);

  const texts = {
    "S": ['asiento Activo', intl.formatMessage({ id: "TRANSPORTE.SEATING.ACTIVE" })],
    "N": ['asiento Inactivo', intl.formatMessage({ id: "TRANSPORTE.SEATING.INACTIVE" })],
    "V": ['espacio Vacío', intl.formatMessage({ id: "TRANSPORTE.SEATING.EMPTYSPACES" })],
  };

  const cssClassItem = data => (classNameAsientos[data.EstadoAsiento] + ' ' + (data.EstiloRepetido || '')) || '';
  const ltConfig = {
    icon: 'fas fa-times',
    isText: false,
    visible: data => data && !data.EsEspacioVacio,
    tooltip: 'Definir como Espacio Vacío',
    clickHandler: ({ data, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
      const config = configNewValueForItem(data, "id", getItemEspacioVacio(data.id));
      setConfiguracionAsientos(config);
      generarResumen(config);
    },
  }
  const mConfig = {
    icon: 'fas fa-plus',
    text: data => data.Asiento,
    cssClass: ({ data, contentType }) => data.EsEspacioVacio && contentType === sectionContentType.Icon ? 'icono-central' : '',
    isText: data => !data.EsEspacioVacio,
    tooltip: data => !data.EsEspacioVacio ? (data && data.Activo ? 'Asiento Activo' : 'Asiento Inactivo') : 'Definir como Asiento',
    showPopoverWhenClicked: data => !esReorganizacionNumerosAsientos ? !data.EsEspacioVacio : null,
    clickHandler: ({ data, position, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
      if (contentType === sectionContentType.Icon) {
        const estado = { Activo: true, EsEspacioVacio: false };
        const newValue = { ...data, ...estado, Asiento: getNumeroAsientoBasadoEnLaPosicion(position), EstadoAsiento: getEstadoAsiento(estado) };
        const config = configNewValueForItem(data, "id", newValue);
        setConfiguracionAsientos(config);
        generarResumen(config);
      }
    },
  }
  const rbConfig = {
    icon: data => data && data.Activo ? 'fas fa-ban' : 'fas fa-check',
    isText: false,
    visible: data => !data.EsEspacioVacio,
    tooltip: data => data && data.Activo ? 'Inactivar Asiento' : 'Activar Asiento',
    clickHandler: ({ data, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
      const estado = { EsEspacioVacio: data.EsEspacioVacio, Activo: !data.Activo };
      const config = configNewValueForItem(data, "id", { ...data, ...estado, EstadoAsiento: getEstadoAsiento(estado) }, false);
      setConfiguracionAsientos(config);
      generarResumen(config);
    },
  }
  const rToolbar = [
    {
      icon: 'fas fa-plus',
      text: intl.formatMessage({ id: "TRANSPORTE.SEATING.ADDROWEND" }),
      onClick: (event) => agregarFilaAlFinal(),
    },
    {
      icon: 'fas fa-times',
      text: intl.formatMessage({ id: "TRANSPORTE.SEATING.DELETELASTROW" }),
      onClick: (event) => eliminarUltimaFila(),
    },
  ]

  const obtenerNuevaFila = (config = configuracionAsientos) => {
    const newRow = [];
    const estado = { Activo: true, EsEspacioVacio: false };
    const { CantidadColumnas, ColumnaPasadizo } = layoutConfig;
    const tienePasadizo = ColumnaPasadizo > 0;
    const base = config.length;
    for (let i = 0; i < CantidadColumnas - (tienePasadizo ? 1 : 0); i++) {
      const numeroAsiento = base * (CantidadColumnas - (tienePasadizo ? 1 : 0)) + i + 1;
      const newItem = { id: uuid4(), ...estado, Asiento: numeroAsiento.toString().padStart(2, '0'), EstadoAsiento: getEstadoAsiento(estado) };
      newRow.push(newItem);
    }
    if (tienePasadizo) newRow.splice(ColumnaPasadizo - 1, 0, getItemEspacioVacio());
    return newRow;
  }

  const agregarFilaAlFinal = (config = configuracionAsientos) => {
    const newRow = obtenerNuevaFila(config);
    let aux = [...config, newRow];
    if (esReorganizacionNumerosAsientos) aux = [...getReconfiguracionNumeroAsientos(aux)];
    aux = getConfiguracionConEstilosRepetidos(aux);
    setConfiguracionAsientos(aux);
    generarResumen(aux);
  }

  const eliminarUltimaFila = () => {
    let aux = [...configuracionAsientos];
    if (aux && aux.length > 0) {
      aux.splice(aux.length - 1, 1);
      if (esReorganizacionNumerosAsientos) aux = [...getReconfiguracionNumeroAsientos(aux)];
      aux = getConfiguracionConEstilosRepetidos(aux);
      setConfiguracionAsientos(aux);
      generarResumen(aux);
    }
  }

  const getNumeroAsientoBasadoEnLaPosicion = position => {
    const { row, col } = position;
    const numeroAsiento = row * cantidadColumnas + (col + 1);
    return numeroAsiento.toString().padStart(2, '0');
  }

  const closeOnOutsideClickPopover = type => {
    switch (type) {
      case sectionType.Middle: return false;
    }
    return true;
  }
  const contentRenderPopover = ({ type, data, contentType, eventSourceType, instance }) => {
    if (type === sectionType.Middle && eventSourceType === eventType.Click && contentType === sectionContentType.Span) {
      return <ContentPopoverAsiento
        data={data}
        popoverInstance={instance}
        configNewValueForItem={configNewValueForItem}
        setConfiguracionAsientos={setConfiguracionAsientos}
      />
    }
  }
  const configNewValueForItem = (oldData, uniqueDataField, newData, rearrange = true) => {
    let iRow, iCol;
    let configPrevio = [...configuracionAsientos];
    configPrevio.forEach((row, indexRow) => {
      if (row && row.length > 0) {
        row.forEach((item, indexCol) => {
          if (item && oldData && (uniqueDataField in item) && (uniqueDataField in oldData)) {
            if (item[uniqueDataField] === oldData[uniqueDataField]) {
              iRow = indexRow;
              iCol = indexCol;
            }
          }
        });
      }
    });
    if (iRow >= 0 && iCol >= 0) configPrevio[iRow][iCol] = newData;
    if (esReorganizacionNumerosAsientos && rearrange) configPrevio = [...getReconfiguracionNumeroAsientos(configPrevio)];
    configPrevio = getConfiguracionConEstilosRepetidos(configPrevio);
    return configPrevio;
  }

  const cargarConfiguracionVehiculo = async () => {
    setConfiguracionAsientos(undefined);
    await service.obtener({ IdVehiculo: props.CodigoVehiculo }).then((response) => {
      setConfiguracionVehiculo(response);
      const { EstaConfiguradoNivel1 } = response;
      let { CantidadColumnasNivel1: CantidadColumnas, ColumnaPasadizoNivel1: ColumnaPasadizo } = response;
      if (EstaConfiguradoNivel1) {
        setLayoutConfig({ CantidadColumnas, ColumnaPasadizo });
      } else {
        ({ CantidadColumnas, ColumnaPasadizo } = layoutConfig);
      }
      cargarConfiguracionAsientos({ CantidadColumnas, ColumnaPasadizo }, response);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
  }

  const cargarConfiguracionAsientos = async (lytConfig = layoutConfig, configVehiculo = configuracionVehiculo) => {
    await service.obtenerTodos({ IdVehiculo: props.CodigoVehiculo }).then((response) => {
      if (response && response.length > 0) response = response.map(item => ({ ...item, EstadoAsiento: getEstadoAsiento(item) }));
      const { EstaConfiguradoNivel1 } = configVehiculo;
      const list = EstaConfiguradoNivel1 ? response : [];
      setListAsientos(list);
      configurarBus(lytConfig, configVehiculo, response, true);
    }).catch(err => {
      handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
    });
  }

  const configurarBus = (layoutConfig, configVehiculo = configuracionVehiculo, sourceList = listAsientos, noAgregarPasadizo = false) => {
    const { CantidadColumnas } = layoutConfig;
    const config = getConfiguracionAsientos(sourceList, layoutConfig, configVehiculo, noAgregarPasadizo);
    setCantidadColumnas(CantidadColumnas);
    setConfiguracionAsientos(config);
    generarResumen(config);
  }

  const getConfiguracionAsientos = (list, layoutConfig, configVehiculo, noAgregarPasadizo) => {
    const { EstaConfiguradoNivel1, CantidadColumnasNivel1, ColumnaPasadizoNivel1, ProvieneDeConfiguracion = false } = configVehiculo;
    let { CantidadColumnas, ColumnaPasadizo } = layoutConfig;
    if (EstaConfiguradoNivel1) {
      CantidadColumnas = CantidadColumnasNivel1;
      ColumnaPasadizo = ColumnaPasadizoNivel1;
    } else {
      noAgregarPasadizo = false;
      --CantidadColumnas;
      --ColumnaPasadizo;
      if (ColumnaPasadizo < 0 || ColumnaPasadizo > CantidadColumnas) ++CantidadColumnas;
    }
    if (list instanceof Array && list.length > 0) list = list.map(item => ({ ...item, id: uuid4() }));
    let config = [];
    if (EstaConfiguradoNivel1) {
      if (list && list.length > 0) {
        const numMaxFila = list.map(({ Fila = -1 }) => Fila).sort((a, b) => b - a)[0];
        for (let i = 0; i <= numMaxFila; i++) config.push([]);
        for (let r = 0; r <= numMaxFila; r++) {
          for (let c = 0; c < CantidadColumnas; c++) {
            config[r][c] = getItemAsiento(r, c, list);
          }
        }
      }
    } else {
      if (ProvieneDeConfiguracion) {
        let cantidadFilas = 0;
        let hayColumnasExactas = false;
        if (list instanceof Array && list.length > 0) {
          if (esReconfiguracion) {
            const { CantidadAsientos } = configuracionVehiculo;
            list = [];
            for (let i = 0; i < CantidadAsientos; i++) {
              list.push(getItemReconfiguracion(i + 1));
            }
          } else {
            list = list.filter(item => !item.EsEspacioVacio);
          }
          cantidadFilas = Math.ceil(list.length / CantidadColumnas);
          hayColumnasExactas = cantidadFilas === (list.length / CantidadColumnas);
          if (!hayColumnasExactas) {
            for (let i = 0; i < (cantidadFilas - 1) * (CantidadColumnas + 1); i++) list.push(getItemEspacioVacio());
          }
          for (let i = 0; i < cantidadFilas; i++) config.push([]);
          list.forEach((item, index) => {
            if (config[parseInt(index / CantidadColumnas)]) {
              config[parseInt(index / CantidadColumnas)].push(item);
            }
          });
        } else {
          const newRow = obtenerNuevaFila(config);
          config.push(newRow);
        }
      } else {
        const newRow = obtenerNuevaFila(config);
        config.push(newRow);
      }
    }
    // Ajuste para configurar el pasadizo
    if (ProvieneDeConfiguracion && (list instanceof Array && list.length > 0) && !noAgregarPasadizo && ColumnaPasadizo >= 0 && ColumnaPasadizo <= CantidadColumnas) config.map(item => item.splice(ColumnaPasadizo, 0, getItemEspacioVacio()));

    if (esReorganizacionNumerosAsientos) config = [...getReconfiguracionNumeroAsientos(config)];
    config = getConfiguracionConEstilosRepetidos(config);

    return config;
  }

  const getReconfiguracionNumeroAsientos = config => {
    let counter = 0;
    return [...config].map(row => {
      if (row && row.length > 0) {
        return row.map(item => {
          if (item && !item.EsEspacioVacio && 'id' in item) {
            return { ...item, Asiento: (++counter).toString().padStart(2, '0') };
          }
          return item;
        });
      }
      return row;
    });
  }

  const getConfiguracionConEstilosRepetidos = (config = configuracionAsientos) => {
    let aux = [...config];
    aux = aux.map(row => row.map(item => {
      delete item.EstiloRepetido;
      return item;
    }));
    const posiciones = getPosicionesDeAsientosRepetidos(config);
    const existenRepetidos = posiciones.length > 0;
    setHayAsientosRepetidos(existenRepetidos);
    posiciones.forEach((repetidos, index) => {
      const EstiloRepetido = classNameRepetidos[index % classNameRepetidos.length];
      if (repetidos && repetidos.length > 0) {
        repetidos.forEach(pos => {
          const { row, col } = pos;
          aux[row][col] = { ...aux[row][col], EstiloRepetido };
        })
      }
    });
    return aux;
  }

  const getNumeroAsiento = index => index.toString().padStart(2, '0');

  const getEstadoAsiento = item => (item.EsEspacioVacio ? 'V' : (item.Activo ? 'S' : 'N'));

  const getItemEspacioVacio = (id = undefined) => {
    return { id: (id || uuid4()), EsEspacioVacio: true, EstadoAsiento: getEstadoAsiento({ EsEspacioVacio: true }) };
  }

  const getItemReconfiguracion = index => ({ id: uuid4(), Asiento: getNumeroAsiento(index), Activo: true, EsEspacioVacio: false, EstadoAsiento: getEstadoAsiento({ Activo: true, EsEspacioVacio: false }) });

  const getObjectFromListAsientos = list => {
    let obj = {};
    if (list && list.length > 0) {
      list.forEach(item => {
        const { Fila = -1, Columna = -1 } = item;
        obj[`${Fila}-${Columna}`] = item;
      });
    }
    return obj;
  }
  const getItemAsiento = (fila, columna, list) => getObjectFromListAsientos(list)[`${fila}-${columna}`] ? getObjectFromListAsientos(list)[`${fila}-${columna}`] : getItemEspacioVacio();

  const guardar = async (e) => {
    if (e.validationGroup.validate().isValid) {
      const { CantidadColumnas: CantidadColumnasNivel1, ColumnaPasadizo: ColumnaPasadizoNivel1 } = layoutConfig;
      const params = {
        IdVehiculo: props.CodigoVehiculo,
        CantidadColumnasNivel1,
        ColumnaPasadizoNivel1,
        CantidadAsientos: (resumen['S'] + resumen['N']),
        Asientos: getDataAsientos(configuracionAsientos),
      };

      await service.crear(params).then(() => {
        handleSuccessMessages(intl.formatMessage({ id: "MESSAGES.SUCESS" }), intl.formatMessage({ id: "La configuración se guardó satisfactoriamente" }));
        cargarConfiguracionVehiculo();
      }).catch(err => {
        handleErrorMessages(intl.formatMessage({ id: "MESSAGES.INFO" }), err)
      });
    }
  }

  const generarResumen = config => {
    const contadores = { 'S': 0, 'N': 0, 'V': 0, };
    const list = getConfigToListWithPositions(config);
    list.forEach(item => {
      if (item) ++contadores[getEstadoAsiento(item)];
    });
    const listResumen = Object.keys(contadores).map(key => ({
      text: intl.formatMessage({ id: "TRANSPORTE.SEATING.THEREARE" }) + ` ${contadores[key]} ${getTextAsiento(key, contadores[key])}.`,
      textClass: frColors[key],
      boxClass: bgColors[key],
    }));
    setResumen(contadores);
    setSummary(listResumen);
  }

  const getConfigToListWithPositions = config => {
    const list = [];
    if (config && config.length > 0) {
      config.forEach((row, indexRow) => {
        if (row && row.length > 0) {
          row.forEach((item, indexCol) => {
            list.push({ ...item, Fila: indexRow, Columna: indexCol });
          });
        }
      });
    }
    return list;
  }
  const getDataAsientos = config => {
    const list = getConfigToListWithPositions(config);
    const arr = [];
    if (list && list.length > 0) {
      list.forEach(item => {
        if (item) {
          let { Asiento, Nivel = 1, Fila, Columna, Activo = true, EsEspacioVacio } = item;
          if (!EsEspacioVacio) arr.push({ Asiento, Nivel, Fila, Columna, Activo, EsEspacioVacio });
          else {
            arr.push({ Asiento: 0, Nivel, Fila, Columna, Activo, EsEspacioVacio });
          }
        }
      });
    }

    return arr;
  }

  const getAsientoDisponibleParaEspacioVacio = (fila, columna, list) => {
    const caracteresAuxiliares = "|_@$#&=¡!¿?^~><)(][}{.;:°-+*";
    const asientos = list.map(({ Asiento }) => Asiento).filter(item => item);
    let asiento = `${fila}${columna}`;
    const numeroMaximoIntentos = 1000;
    let intento = 0;
    while (asientos.includes(asiento) && intento <= numeroMaximoIntentos && asiento !== '') {
      const indexFila = Math.round(Math.random() * 100);
      const indexColumna = Math.round(Math.random() * 100);
      const indexCaracterAuxiliar = Math.round(Math.random() * 100);
      const indices = [indexFila, indexColumna, indexCaracterAuxiliar];
      let caracter = '';
      indices.sort((a, b) => a - b);
      asiento = '';
      for (let i = 0; i < indices.length; i++) {
        switch (indices[i]) {
          case indexFila: caracter = fila; break;
          case indexColumna: caracter = columna; break;
          case indexCaracterAuxiliar: caracter = caracteresAuxiliares[indexCaracterAuxiliar % caracteresAuxiliares.length]; break;
        }
        asiento = `${asiento}${caracter}`;
      }
      intento++;
    }
    return asiento;
  }

  const getWithBus = () => cantidadColumnas * 110;

  const getPosicionesDeAsientosRepetidos = (config = configuracionAsientos) => {
    const list = getDataAsientos(config);
    const asientos = list.filter(item => !item.EsEspacioVacio).map(item => item.Asiento);
    const asientosRepetidos = [...new Set(asientos.filter((item, index) => asientos.indexOf(item) != index))];
    const posicionesRepetidas = [];
    for (let i = 0; i < asientosRepetidos.length; i++) posicionesRepetidas.push([]);
    list.filter(item => !item.EsEspacioVacio).forEach(item => {
      const indexAsientoRepetido = asientosRepetidos.indexOf(item.Asiento);
      if (indexAsientoRepetido >= 0) {
        const { Fila: row, Columna: col } = item;
        posicionesRepetidas[indexAsientoRepetido].push({ row, col });
      }
    });
    return posicionesRepetidas;
  }

  const aplicarReorganizacionDeNumerosDeAsientos = () => {
    let config = getReconfiguracionNumeroAsientos(configuracionAsientos);
    config = getConfiguracionConEstilosRepetidos(config);
    setConfiguracionAsientos(config);
  }

  const toggleEsReorganizacionNumerosAsientos = () => setEsReorganizacionNumerosAsientos(!esReorganizacionNumerosAsientos);
  const toggleEsReconfiguracion = () => setEsReconfiguracion(!esReconfiguracion);

  const getTextAsiento = (tipo, contador) => contador === 1 ? texts[tipo][0] : texts[tipo][1];

  const renderReorganizarNumerosDeAsientos = () => {
    return (
      <div className="text-left" style={{ 'left': '-8px', 'position': 'relative' }}>
        <ControlSwitch checked={esReorganizacionNumerosAsientos}
          onChange={toggleEsReorganizacionNumerosAsientos}
        />
        <span onClick={toggleEsReorganizacionNumerosAsientos}>{esReorganizacionNumerosAsientos ? intl.formatMessage({ id: "TRANSPORTE.SEATING.DISABLE.REARRANGEMENT" }) : intl.formatMessage({ id: "TRANSPORTE.SEATING.ENABLED.REARRANGEMENT" })}</span>
      </div>
    );
  }

  useEffect(() => {
    cargarConfiguracionVehiculo();
  }, [props.CodigoVehiculo]);

  return (
    <>


      <HeaderInformation data={props.getInfo()} visible={props.showHeaderInformation} labelLocation={'left'} colCount={6}
        toolbar={
          <PortletHeader
            title=""
            toolbar={
              <PortletHeaderToolbar>
                &nbsp;
                <Button
                  icon="fa fa-save"
                  type="default"
                  useSubmitBehavior={true}
                  validationGroup="FormEdicion"
                  disabled={hayAsientosRepetidos}
                  hint={intl.formatMessage({ id: "ACTION.RECORD" })}
                  onClick={guardar}
                />
                &nbsp;
                <Button
                  icon="undo"
                  type="success"
                  hint={intl.formatMessage({ id: "COMMON.REVERT" })}
                  onClick={cargarConfiguracionVehiculo}
                />
                &nbsp;
                <Button
                  icon="fa fa-times-circle"
                  type="normal"
                  hint={intl.formatMessage({ id: "ACTION.CANCEL" })}
                  onClick={props.cancelarEdicion}
                />
              </PortletHeaderToolbar>
            }
          />
        }
      />

      <div style={{ 'text-align': 'center' }} className="py-4">
        <Form formData={layoutConfig} validationGroup="FormEdicion" className="cls_rowLeftRight">
          <Item>
            <AppBar position="static" elevation={0} className={classesEncabezado.secundario}>
              <Toolbar variant="dense" className={classesEncabezado.toolbar}>
                <Typography variant="h6" color="inherit" className={classesEncabezado.title}>{intl.formatMessage({ id: "TRANSPORTE.SEATING.BUSCOLUMN.CONFIGURATION" })}</Typography>
              </Toolbar>
            </AppBar>
          </Item>
          <GroupItem colCount={36}>
            <Item dataField="CantidadColumnas"
              colSpan={14}
              isRequired={true}
              itemType="dxNumberBox"
              label={{ text: intl.formatMessage({ id: "TRANSPORTE.SEATING.NUMBER.COLUMNS" }) }}
              editorOptions={{
                maxLength: 3,
                max: 7,
                min: 1,
                showSpinButtons: true,
                onKeyUp: ({ event: { target: { value } } }) => setValorMaximoColumnaPasadizo(value === 1 ? 0 : value),
                onValueChanged: ({ value }) => setValorMaximoColumnaPasadizo(value === 1 ? 0 : value),
              }}
            />
            <Item dataField="ColumnaPasadizo"
              colSpan={16}
              isRequired={true}
              itemType="dxNumberBox"
              label={{ text: intl.formatMessage({ id: "TRANSPORTE.SEATING.NUMBER.COLUMNSPASSAGEWAY" }) }}
              editorOptions={{
                maxLength: 3,
                max: valorMaximoColumnaPasadizo,
                min: 0,
                showSpinButtons: true,
              }}
            />
            <SimpleItem colSpan={6}
              width={120}
              // text="Configurar"
              itemType="button"
              buttonOptions={{
                icon: 'preferences',
                text: intl.formatMessage({ id: "TRANSPORTE.CONFIGURATION" }),
                type: 'default',
                onClick: () => configurarBus(layoutConfig, { ProvieneDeConfiguracion: true }),
              }}
            />
          </GroupItem>
          <GroupItem colCount={10}>
            <SimpleItem colSpan={7}
              label={{ visible: false }}
              render={renderReorganizarNumerosDeAsientos}
            />
            <SimpleItem colSpan={3}
              width={120}
              // text="Aplicar reorganización"
              itemType="button"
              visible={esReorganizacionNumerosAsientos}
              buttonOptions={{
                icon: 'check',
                text: intl.formatMessage({ id: "TRANSPORTE.SEATING.APPLY.REORGANIZATION" }),
                type: 'default',
                onClick: aplicarReorganizacionDeNumerosDeAsientos,
              }}
            />
          </GroupItem>
        </Form>
        <div className="container_only cls_rowLeftRight" >
          <React.Fragment>
            <div style={{ width: "500px" }}>
              <BoxStyleList list={summary} />
            </div>
            <div className="col-md-2">
              <div className="summary">
                <span className="caption">{intl.formatMessage({ id: "TRANSPORTE.SEATING.TOTAL.SEATS" })}</span>
                {resumen && <span className="data">{resumen['S'] + resumen['N']}</span>}
              </div>
            </div>
          </React.Fragment>
        </div>
      </div>
      <Bus source={configuracionAsientos}
        columnCount={cantidadColumnas}
        uniqueDataField="id"
        textDataField="Asiento"
        width={getWithBus()}
        cssClass="mb-3"
        cssClassItem={cssClassItem}
        ltConfig={ltConfig}
        mConfig={mConfig}
        rbConfig={rbConfig}
        rToolbar={rToolbar}
        showTitlePopover={true}
        titlePopover="Ingresar Asiento"
        contentRenderPopover={contentRenderPopover}
        closeOnOutsideClickPopover={closeOnOutsideClickPopover}
        widthPopover={650}
        showEvenWithoutData={true}
        emptyDataMessage="No se han configurado asientos."
      />
    </>
  );
};

// export default VehiculoAsientos;
export default injectIntl(WithLoandingPanel(VehiculoAsientos));
