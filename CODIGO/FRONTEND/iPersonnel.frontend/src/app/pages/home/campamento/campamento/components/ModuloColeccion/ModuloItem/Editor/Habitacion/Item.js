import { MultiView } from "devextreme-react";
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { useSelector } from "react-redux";
import { v4 as uuid4 } from "uuid";
import { HabitacionItemEditor, HabitacionItemDeshabilitado } from ".";
import { sectionContentType } from "../../../../../../../../../partials/components/BoxesGrid/BoxesGrid";
import { ItemSectionType, ClassNameHabitacion, prefixCama } from "../../../";

import "./style.css";
import { transformToFormattedData } from "../../../../../../../../../partials/components/BoxesGrid/BoxesGridHelper";

const dataViewType = {
  Editor: 'editor',
  Disabled: 'disabled',
};
const dataSource = [
  { type: dataViewType.Editor },
  { type: dataViewType.Disabled },
];

const HabitacionItem = ({
  parent,  // Módulo     ==> parent
  item: oriItem,    // Habitación ==> parent.Habitacion
  selectItemInEdit, // trabaja sobre "parent"
  visible,
  intl,
}) => {
  const [item, setItem]= useState({});
  const [selectedIndex, setSelectedIndex]= useState(0);

  const [cama, setCama] = useState(item.Cama);
  const [columnCount, setColumnCount] = useState(1);
  const [source, setSource] = useState([]);
  const [esReorganizacionNumerosHabitacion, setEsReorganizacionNumerosHabitacion] = useState(true);

  /* ================================================================================================================== */
  /* ****************************************************** DATA ****************************************************** */
  /* ================================================================================================================== */
  
  /* ================================================================================================================== */
  /* ************************************************** CONFIGURADOR ************************************************** */
  /* ================================================================================================================== */
  const [ uniqueId, uniqueDataField, textDataField, rowField, colField, valueForUndefined ] = [ 'id', 'IdCama', 'Etiqueta', 'FilaCama', 'ColumnaCama', {} ];
  const transformItem = item => ({ ...item, [textDataField]: getEtiquetaBasadaEnLaPosicion({ row: item[rowField], col: item[colField] }) });
  
  const getCssClassKey = ({ EsContenido, Activo, [uniqueDataField]: pk }) => EsContenido ? (!!pk ? (Activo ? 'S' : 'N') : 'E') : 'V';
  const cssClassBox = ({ CssClassKey }) => ClassNameHabitacion[CssClassKey];
  const getWidth = () => {
    return columnCount ? 110*columnCount : 550;
  }
  const ltConfig = {
    icon: 'fas fa-times',
    isText: false,
    visible: ({ EsContenido }) => EsContenido,
    tooltip: 'Definir como Espacio Vacío',
    clickHandler: ({ data, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
      const config = configNewValueForItem(data, uniqueId, getEmptyBox(data[uniqueId]));
      setSource(config);
      // generarResumen(config);
    },
  }
  const rtConfig = {
    icon: ({ [uniqueDataField]: pk }) => !!pk ? 'fas fa-cogs' : 'fas fa-pen',
    isText: false,
    visible: ({ EsContenido }) => EsContenido,
    tooltip: ({ [uniqueDataField]: pk }) => !!pk ? 'Configurar Cama' : 'Editar Cama',
    clickHandler: ({ data, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
    },
  }
  const mConfig = {
    icon: 'fas fa-plus',
    text: ({ Etiqueta }) => Etiqueta,
    cssClass: ({ data: { EsContenido }, contentType }) => !EsContenido && contentType === sectionContentType.Icon ? 'center-icon' : '',
    isText: data => data.EsContenido,
    tooltip: ({ EsContenido, Activo }) => EsContenido ? (Activo ? 'Cama Activa' : 'Cama Inactiva') : 'Definir como Cama',
    // showPopoverWhenClicked: ({ EsContenido }) => EsContenido,
    clickHandler: ({ data, position, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
      if (contentType === sectionContentType.Icon) {
        const estado = { Activo: true, EsContenido: true };
        const newValue = { ...data, ...estado, Etiqueta: getEtiquetaBasadaEnLaPosicion(position), CssClassKey: getCssClassKey(estado) };
        const config = configNewValueForItem(data, uniqueId, newValue);
        setSource(config);
        // generarResumen(config);
      }
    },
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
    if (esReorganizacionNumerosHabitacion && rearrange) configPrevio = [...getReconfiguracionNumerosHabitacion(configPrevio)];
    // configPrevio = getConfiguracionConEstilosRepetidos(configPrevio);
    return configPrevio;
  }
  const getReconfiguracionNumerosHabitacion = config => {
    let counter = 0;
    return [...config].map(row => {
      if (row && row.length > 0) {
        return row.map(item => {
          if (item && item.EsContenido && uniqueId in item) {
            return { ...item, Etiqueta: `${prefixCama}${(++counter).toString().padStart(2, '0')}` };
          }
          return item;
        });
      }
      return row;
    });
  }
  const getEtiquetaBasadaEnLaPosicion = ({ row, col }) => {
    const numeroHabitacion = row * columnCount + (col + 1);
    return `${prefixCama}${numeroHabitacion.toString().padStart(2, '0')}`;
  }
  const getNewRow = (config = source) => {
    const newRow = [];
    const estado = { Activo: true, EsContenido: true };
    for (let i = 0; i < columnCount; i++) {
      const Etiqueta = `${prefixCama}${(config.length * columnCount + i + 1).toString().padStart(2, '0')}`;
      const newItem = { [uniqueId]: uuid4(), ...estado, Etiqueta, CssClassKey: getCssClassKey(estado) };
      newRow.push(newItem);
    }
    return newRow;
  }
  const getNewItem = (indexRow) => {
    const estado = { Activo: true, EsContenido: true };
    const Etiqueta = `${prefixCama}${((indexRow + 1) * columnCount + 1).toString().padStart(2, '0')}`;
    return { [uniqueId]: uuid4(), ...estado, Etiqueta, CssClassKey: getCssClassKey(estado) };
  }
  const getCantidadFilas = (config = source) => {
    return config.filter(row => row).length;
  }
  const agregarFilaAlFinal = (config = source) => {
    const newRow = getNewRow(config);
    let aux = [...config, newRow];
    if (esReorganizacionNumerosHabitacion) aux = [...getReconfiguracionNumerosHabitacion(aux)];
    // aux = getConfiguracionConEstilosRepetidos(aux);
    setSource(aux);
    // generarResumen(aux);
  }
  const eliminarUltimaFila = () => {
    let aux = [...source];
    if (aux && aux.length > 0) {
      aux.splice(aux.length - 1, 1);
      if (esReorganizacionNumerosHabitacion) aux = [...getReconfiguracionNumerosHabitacion(aux)];
      // aux = getConfiguracionConEstilosRepetidos(aux);
      setSource(aux);
      // generarResumen(aux);
    }
  };
  const agregarColumnaALaDerecha = (config = source) => {
    setColumnCount(columnCount + 1);
    let aux = [...config];
    aux = aux.map((row, index) => [ ...row, getNewItem(index) ]);
    if (esReorganizacionNumerosHabitacion) aux = [...getReconfiguracionNumerosHabitacion(aux)];
    // aux = getConfiguracionConEstilosRepetidos(aux);
    setSource(aux);
    // generarResumen(aux);
  }
  const eliminarColumnaDeLaDerecha = () => {
    setColumnCount(columnCount - 1);
    let aux = [...source];
    aux = aux.map(row => {
      row.splice(row.length - 1, 1);
      return [ ...row ];
    });
    if (esReorganizacionNumerosHabitacion) aux = [...getReconfiguracionNumerosHabitacion(aux)];
    // aux = getConfiguracionConEstilosRepetidos(aux);
    setSource(aux);
    // generarResumen(aux);
  }
  const toolbar = [
    {
      text: 'Acciones del configurador',
      cssClass: 'toolbar-title'
    },
    {
      icon: 'fas fa-edit',
      cssClass: 'icon-inline mr-3',
      tooltip: 'Editar la configuración de la habitación',
      // disabled: columnCount === 12,
      onClick: () => console.log('editar'),
    },
    // {
    //   icon: 'fas fa-eye-slash',
    //   cssClass: 'icon-inline mr-3',
    //   tooltip: 'Ocultar la configuración de la habitación',
    //   // disabled: columnCount === 12,
    //   onClick: () => console.log('ocultar'),
    // },
    {
      icon: 'fas fa-save',
      cssClass: 'icon-inline mr-3',
      tooltip: 'Guardar la configuración de la habitación',
      // disabled: columnCount === 12,
      onClick: () => console.log('guardar'),
    },
    {
      icon: 'fas fa-ban',
      cssClass: 'icon-inline',
      tooltip: 'Cancelar la edición de la configuración de la habitación',
      // disabled: columnCount === 1,
      onClick: () => console.log('cancelar'),
    },
    {
      text: 'Acciones de Fila',
      cssClass: 'toolbar-title'
    },
    {
      // icon: 'fas fa-plus',
      icon: 'plus',
      cssClass: 'icon-inline mr-3',
      tooltip: 'Agregar fila al final',
      onClick: () => agregarFilaAlFinal(),
    },
    {
      // icon: 'fas fa-times',
      icon: 'close',
      cssClass: 'icon-inline',
      tooltip: 'Eliminar última fila',
      disabled: getCantidadFilas() === 0,
      onClick: () => eliminarUltimaFila(),
    },
    {
      text: 'Acciones de Columna',
      cssClass: 'toolbar-title'
    },
    {
      // icon: 'fas fa-plus',
      icon: 'plus',
      cssClass: 'icon-inline mr-3',
      tooltip: 'Agregar columna a la derecha',
      disabled: columnCount === 12,
      onClick: () => agregarColumnaALaDerecha(),
    },
    {
      // icon: 'fas fa-times',
      icon: 'close',
      cssClass: 'icon-inline',
      tooltip: 'Eliminar columna de la derecha',
      disabled: columnCount === 1,
      onClick: () => eliminarColumnaDeLaDerecha(),
    },
  ];

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
  const getItemSectionClassName = itemSectionType => {
    let className = 'pt-3';
    switch(itemSectionType) {
      case ItemSectionType.Configurator:
        className += ' hi-col-middle';
        break;
    }
    return className;
  }
  const getClassName = () => {
    return "hi px-0";
  }
  // --------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------
  const changeView = index => {
		setSelectedIndex(index);
  }
  
  const onSelectionChanged = args => {
    if (args.name == 'selectedIndex') {
      changeView(args.value);
    }
  }

  const viewItemComponent = ({data: { type }}) => {
    switch(type) {
        case dataViewType.Editor: 
          return (
            <HabitacionItemEditor parent={parent} 
              item={item} 
              child={cama}
              selectItemInEdit={selectItemInEdit}
              // ------------------
              source={source}
              uniqueId={uniqueId} 
              uniqueDataField={uniqueDataField} 
              textDataField={textDataField}
              columnCount={columnCount}
              cssClassBox={cssClassBox}
              ltConfig={ltConfig}
              rtConfig={rtConfig}
              mConfig={mConfig}
              readOnly={parent.DetailSectionType !== ItemSectionType.Configurator}
              // ----
              getClassName={getClassName}
              getItemSectionClassName={getItemSectionClassName}
              getWidth={getWidth}
              // ------------------
              toolbar={toolbar}
            />
          );
        case dataViewType.Disabled: 
          return (
            <HabitacionItemDeshabilitado parent={parent} 
              item={item} 
              source={source}
              uniqueId={uniqueId} 
              uniqueDataField={uniqueDataField} 
              textDataField={textDataField}
              columnCount={columnCount}
              cssClassBox={cssClassBox}
              mConfig={mConfig}
              readOnly={true}
              // ----
              getClassName={getClassName}
              getItemSectionClassName={getItemSectionClassName}
              getWidth={getWidth}
            />
          );
      default: 
        return undefined;
    }
  }
  // -------------------------------------------------------------------------------------------------------

  // -------------------------------------------------------------------------------------------------------
  useEffect(() => {
    setItem(oriItem || {});
  }, [oriItem]);

  useEffect(() => {
    changeView(item.Disabled ? 1 : 0);
  }, [item.Disabled]);
  // -------------------------------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  useEffect(() => {
    setCama(item.Cama);
  }, [item.Cama]);
  // --------------------------------------------------------------------------------

  useEffect(() => {
    const { Camas } = item;
    if (Array.isArray(Camas)) {
      const formattedSource = transformToFormattedData(Camas, { rowField, colField, uniqueId, uniqueDataField, valueForUndefined, transformItem });
      const colCount = Array.isArray(formattedSource) && Array.isArray(formattedSource[0]) ? formattedSource[0].length : 0;
      // console.log(">>>> parent, item, Camas, colCount", parent, item, Camas, colCount, generateConfig(formattedSource))
      setColumnCount(colCount);
      setSource(generateConfig(formattedSource) || []);
    } else setSource([]);
  }, [item.Camas]);
  // ------------------------------------------------------
  
  return (
    <>
      {
        !!visible &&
        <MultiView
          className="border-top-hi mt-n3"
          dataSource={dataSource}
          selectedIndex={selectedIndex}
          onOptionChanged={onSelectionChanged}
          itemComponent={viewItemComponent}
          animationEnabled={true} 
          swipeEnabled={false}
          loop={false}
        />
      }
    </>
  );
};

export default injectIntl(HabitacionItem);
