import React, { useEffect, useState } from "react";

// -------------------------------------------------------
import { v4 as uuid4 } from "uuid";
import { sectionContentType } from "../../../../../partials/components/BoxesGrid/BoxesGrid";

import { transformToFormattedData } from "../../../../../partials/components/BoxesGrid/BoxesGridHelper";
import { isArray, isFunction, isNullOrUndefined } from "../../../../../partials/shared/CommonHelper";
// -------------------------------------------------------

const BaseConfigurator = ({
  itemData: usrItemData,
  rtClickHandler,
  mClickHandler,
  uniqueId, 
  uniqueDataField, 
  textDataField, 
  rowField, 
  colField, 
  valueForUndefined, 
  childrenPropertyName, 
  classNameBox,
  prefixEtiqueta,
  toolTip,
  onChange,
  render,
}) => {
  const [itemData, setItemData] = useState(usrItemData);
  const [source, setSource] = useState([]);
  const [columnCount, setColumnCount] = useState(1);
  const [isReorganizationOfNumbers] = useState(true);

  /* ================================================================================================================== */
  /* ************************************************** CONFIGURADOR ************************************************** */
  /* ================================================================================================================== */
  const transformItem = item => ({ ...item, [textDataField]: getEtiquetaBasadaEnLaPosicion({ row: item[rowField], col: item[colField] }) });
  
  const getCssClassKey = ({ EsContenido, Activo, [uniqueDataField]: pk }) => EsContenido ? (!!pk ? (Activo ? 'S' : 'N') : 'E') : 'V';
  const cssClassBox = ({ CssClassKey } = {}) => !!CssClassKey && !!classNameBox ? classNameBox[CssClassKey] : '';
  const getWidth = () => columnCount ? 70.5 * columnCount : 550;
  const boxHelper = { cssClassBox };
  const ltConfig = {
    icon: 'fas fa-times',
    isText: false,
    visible: ({ EsContenido }) => EsContenido,
    tooltip: toolTip.DefineAsEmpty,
    clickHandler: ({ data, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
      const config = configNewValueForItem(data, uniqueId, getEmptyBox(data[uniqueId]));
      setSource(config);
    },
  }
  const rtConfig = {
    icon: ({ [uniqueDataField]: pk }) => !!pk ? 'fas fa-cogs' : 'fas fa-pen',
    isText: false,
    visible: ({ EsContenido }) => EsContenido,
    tooltip: ({ [uniqueDataField]: pk }) => !!pk ? toolTip.Configure : toolTip.Edit,
    clickHandler: (e) => isFunction(rtClickHandler) ? rtClickHandler(e) : void(0),
  }
  const mConfig = {
    icon: 'fas fa-plus',
    text: ({ Etiqueta }) => Etiqueta,
    cssClass: ({ data: { EsContenido }, contentType }) => !EsContenido && contentType === sectionContentType.Icon ? 'center-icon' : '',
    isText: data => data.EsContenido,
    tooltip: ({ EsContenido, Activo }) => EsContenido ? (Activo ? toolTip.Active : toolTip.Inactive) : toolTip.DefineAsContent,
    clickHandler: (e) => isFunction(mClickHandler) ? mClickHandler(e) : void(0),
  }
  const getEmptyBox = (id = undefined) => {
    return { [uniqueId]: (id || uuid4()), EsContenido: false, CssClassKey: getCssClassKey({ EsContenido: false }) };
  }
  const configNewValueForItem = (oldData, uniqueId, newData, rearrange = true) => {
    let iRow, iCol;
    let configPrevio = [...source];
    configPrevio.forEach((row, indexRow) => {
      if (row && row.length > 0) {
        row.forEach((item, indexCol) => {
          if (item && oldData && (uniqueId in item) && (uniqueId in oldData)) {
            if (item[uniqueId] === oldData[uniqueId]) {
              iRow = indexRow;
              iCol = indexCol;
            }
          }
        });
      }
    });
    if (iRow >= 0 && iCol >= 0) configPrevio[iRow][iCol] = newData;
    if (isReorganizationOfNumbers && rearrange) configPrevio = [...getReconfiguracionNumeros(configPrevio)];
    return configPrevio;
  }
  const getReconfiguracionNumeros = config => {
    let counter = 0;
    return [...config].map(row => {
      if (row && row.length > 0) {
        return row.map(item => {
          if (item && item.EsContenido && uniqueId in item) {
            return { ...item, Etiqueta: `${prefixEtiqueta}${(++counter).toString().padStart(2, '0')}` };
          }
          return item;
        });
      }
      return row;
    });
  }
  const getEtiquetaBasadaEnLaPosicion = ({ row, col }) => {
    const numero = row * columnCount + (col + 1);
    return `${prefixEtiqueta}${numero.toString().padStart(2, '0')}`;
  }
  const getNewRow = (config = source) => {
    const newRow = [];
    const estado = { Activo: true, EsContenido: true };
    for (let i = 0; i < columnCount; i++) {
      const Etiqueta = `${prefixEtiqueta}${(config.length * columnCount + i + 1).toString().padStart(2, '0')}`;
      const newItem = { [uniqueId]: uuid4(), ...estado, Etiqueta, CssClassKey: getCssClassKey(estado) };
      newRow.push(newItem);
    }
    return newRow;
  }
  const getNewItem = (indexRow) => {
    const estado = { Activo: true, EsContenido: true };
    const Etiqueta = `${prefixEtiqueta}${((indexRow + 1) * columnCount + 1).toString().padStart(2, '0')}`;
    return { [uniqueId]: uuid4(), ...estado, Etiqueta, CssClassKey: getCssClassKey(estado) };
  }
  const getCantidadFilas = (config = source) => {
    return config.filter(row => row).length;
  }
  const generateConfig = (data) => {
    if (!data || data.length === 0) return data;
    return data.map(row => {
      return row.map(item => {
        const { EsContenido, Activo, [uniqueDataField]: pk } = item;
        item = { ...item, [uniqueId]: uuid4(), CssClassKey: getCssClassKey({ EsContenido, Activo, [uniqueDataField]: pk }) };
        return item;
      });
    });
  }
  /* ================================================================================================================== */
  /* **************************************************** BOTONERA **************************************************** */
  /* ================================================================================================================== */
  const agregarFilaAlFinal = (config = source) => {
    const newRow = getNewRow(config);
    let aux = [...config, newRow];
    if (isReorganizationOfNumbers) aux = [...getReconfiguracionNumeros(aux)];
    setSource(aux);
  }
  const eliminarUltimaFila = () => {
    let aux = [...source];
    if (aux && aux.length > 0) {
      aux.splice(aux.length - 1, 1);
      if (isReorganizationOfNumbers) aux = [...getReconfiguracionNumeros(aux)];
      setSource(aux);
    }
  };
  const agregarColumnaALaDerecha = (config = source) => {
    setColumnCount(columnCount + 1);
    let aux = [...config];
    aux = aux.map((row, index) => [ ...row, getNewItem(index) ]);
    if (isReorganizationOfNumbers) aux = [...getReconfiguracionNumeros(aux)];
    setSource(aux);
  }
  const eliminarColumnaDeLaDerecha = () => {
    setColumnCount(columnCount - 1);
    let aux = [...source];
    aux = aux.map(row => {
      row.splice(row.length - 1, 1);
      return [ ...row ];
    });
    if (isReorganizationOfNumbers) aux = [...getReconfiguracionNumeros(aux)];
    setSource(aux);
  }
  const toolbar = [
    {
      icon: 'plus',
      className: 'icon-inline mr-3',
      hint: 'Agregar fila al final',
      onClick: () => agregarFilaAlFinal(),
    },
    {
      icon: 'close',
      className: 'icon-inline',
      hint: 'Eliminar última fila',
      disabled: getCantidadFilas() === 0,
      onClick: () => eliminarUltimaFila(),
    },
    {
      icon: 'plus',
      className: 'icon-inline mr-3',
      hint: 'Agregar columna a la derecha',
      // disabled: columnCount === 12,
      onClick: () => agregarColumnaALaDerecha(),
    },
    {
      icon: 'close',
      className: 'icon-inline',
      hint: 'Eliminar columna de la derecha',
      disabled: columnCount === 1,
      onClick: () => eliminarColumnaDeLaDerecha(),
    },
  ];
  // --------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  useEffect(() => {
    setItemData(!isNullOrUndefined(usrItemData) ? usrItemData: {});
  }, [usrItemData]);

  useEffect(() => {
    const { [childrenPropertyName]: children } = itemData;
    if (isArray(children)) {
      const formattedSource = transformToFormattedData(children, { rowField, colField, uniqueId, uniqueDataField, valueForUndefined, transformItem });
      const colCount = isArray(formattedSource) && isArray(formattedSource[0]) ? formattedSource[0].length : 0;
      setColumnCount(colCount);
      setSource(generateConfig(formattedSource) || []);
    } else setSource([]);
  }, [itemData[childrenPropertyName]]);

  useEffect(() => {
    if (isFunction(onChange)) {
      onChange({
        source,
        columnCount,
        ltConfig,
        rtConfig,
        mConfig,
        boxHelper,
        width: getWidth(),
        toolbar,
      });
    }
  }, [source, columnCount, classNameBox]);
  // ------------------------------------------------------

  return (
    <>
      {
        render({ 
          source,
          uniqueId,
          uniqueDataField,
          textDataField,
          columnCount,
          cssClassBox,
          ltConfig,
          rtConfig,
          mConfig,
          getWidth,
          toolbar,
        })
      }
    </>
  );
};

export default BaseConfigurator;
