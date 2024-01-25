import { MultiView } from "devextreme-react";
import React, { useEffect, useState } from "react";
import { injectIntl } from "react-intl"; 
import { ModuloItemEditor, ModuloItemDeshabilitado } from ".";

// -------------------------------------------------------
import { useSelector } from "react-redux";
import { v4 as uuid4 } from "uuid";
import { sectionContentType } from "../../../../../../../partials/components/BoxesGrid/BoxesGrid";

import { ItemSectionType, ClassNameModulo, prefixHabitacion } from "../";
import { transformToFormattedData } from "../../../../../../../partials/components/BoxesGrid/BoxesGridHelper";

import { filtrar as filtrarCama } from "../../../../../../../api/campamento/habitacionCama.api";
import { handleErrorMessages } from "../../../../../../../store/ducks/notify-messages";
// -------------------------------------------------------

const dataViewType = {
  Editor: 'editor',
  Disabled: 'disabled',
};
const dataSource = [
  { type: dataViewType.Editor },
  { type: dataViewType.Disabled },
];

const ModuloItem = ({
  item,
  selectItemInEdit,
  intl,
}) => {
  const perfil = useSelector(state => state.perfil.perfilActual);

  const [selectedIndex, setSelectedIndex]= useState(item.Disabled ? 1 : 0);

  const [habitacion, setHabitacion] = useState(item.Habitacion);
  const [columnCount, setColumnCount] = useState(1);
  const [source, setSource] = useState([]);
  const [esReorganizacionNumerosModulo, setEsReorganizacionNumerosModulo] = useState(true);

  /* ================================================================================================================== */
  /* ****************************************************** DATA ****************************************************** */
  /* ================================================================================================================== */
  const getParams = (parent) => {
    const { IdCliente, IdDivision } = perfil;
    const { IdCampamento, IdModulo, Nivel, IdHabitacion, Fila, Columna } = parent;
    const [ filter, sort, pager ] = [ 
      { IdCliente, IdDivision, IdCampamento, IdModulo, Nivel, IdHabitacion, Fila, Columna }, 
      { OrderField: 'Configuracion', OrderDesc: false }, 
      { Skip: 0, Take: 0 } 
    ];
    return { filter, sort, pager };
  }
  const getCamas = async (parent) => {
    const { filter, sort, pager } = getParams(parent);
    return await filtrarCama({ filter, sort, pager }).catch(handleErrorMessages);
  }
  
  /* ================================================================================================================== */
  /* ************************************************** CONFIGURADOR ************************************************** */
  /* ================================================================================================================== */
  const [ uniqueId, uniqueDataField, textDataField, rowField, colField, valueForUndefined ] = [ 'id', 'IdHabitacion', 'Etiqueta', 'Fila', 'Columna', {} ];
  const transformItem = item => ({ ...item, [textDataField]: getEtiquetaBasadaEnLaPosicion({ row: item[rowField], col: item[colField] }) });
  
  const getCssClassKey = ({ EsContenido, Activo, [uniqueDataField]: pk }) => EsContenido ? (!!pk ? (Activo ? 'S' : 'N') : 'E') : 'V';
  const cssClassBox = ({ CssClassKey }) => ClassNameModulo[CssClassKey];
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
    tooltip: ({ [uniqueDataField]: pk }) => !!pk ? 'Configurar Habitación' : 'Editar Habitación',
    clickHandler: ({ data: Habitacion, contentType }) => {
      if (contentType === sectionContentType.Span) return false;
      const { [uniqueDataField]: pk } = Habitacion;
      if (!!pk) {
        (async () => {
          const Camas = (await getCamas(Habitacion));
          // console.log("perform -> Camas", Camas);
          Habitacion = { ...Habitacion, Camas };
          selectItemInEdit(item, { forSelected: { Habitacion, DetailSectionType: ItemSectionType.EditorContainer, ParentUniqueDataField: uniqueDataField } });
        })();
      } else {
        selectItemInEdit(item, { forSelected: { Habitacion, DetailSectionType: ItemSectionType.EditorContainer, ParentUniqueDataField: uniqueDataField } });
      }
    },
  }
  const mConfig = {
    icon: 'fas fa-plus',
    text: ({ Etiqueta }) => Etiqueta,
    cssClass: ({ data: { EsContenido }, contentType }) => !EsContenido && contentType === sectionContentType.Icon ? 'center-icon' : '',
    isText: data => data.EsContenido,
    tooltip: ({ EsContenido, Activo }) => EsContenido ? (Activo ? 'Habitación Activa' : 'Habitación Inactiva') : 'Definir como Habitación',
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
    if (esReorganizacionNumerosModulo && rearrange) configPrevio = [...getReconfiguracionNumerosModulo(configPrevio)];
    // configPrevio = getConfiguracionConEstilosRepetidos(configPrevio);
    return configPrevio;
  }
  const getReconfiguracionNumerosModulo = config => {
    let counter = 0;
    return [...config].map(row => {
      if (row && row.length > 0) {
        return row.map(item => {
          if (item && item.EsContenido && uniqueId in item) {
            return { ...item, Etiqueta: `${prefixHabitacion}${(++counter).toString().padStart(2, '0')}` };
          }
          return item;
        });
      }
      return row;
    });
  }
  const getEtiquetaBasadaEnLaPosicion = ({ row, col }) => {
    const numeroModulo = row * columnCount + (col + 1);
    return `${prefixHabitacion}${numeroModulo.toString().padStart(2, '0')}`;
  }
  const getNewRow = (config = source) => {
    const newRow = [];
    const estado = { Activo: true, EsContenido: true };
    for (let i = 0; i < columnCount; i++) {
      const Etiqueta = `${prefixHabitacion}${(config.length * columnCount + i + 1).toString().padStart(2, '0')}`;
      const newItem = { [uniqueId]: uuid4(), ...estado, Etiqueta, CssClassKey: getCssClassKey(estado) };
      newRow.push(newItem);
    }
    return newRow;
  }
  const getNewItem = (indexRow) => {
    const estado = { Activo: true, EsContenido: true };
    const Etiqueta = `${prefixHabitacion}${((indexRow + 1) * columnCount + 1).toString().padStart(2, '0')}`;
    return { [uniqueId]: uuid4(), ...estado, Etiqueta, CssClassKey: getCssClassKey(estado) };
  }
  const getCantidadFilas = (config = source) => {
    return config.filter(row => row).length;
  }
  const agregarFilaAlFinal = (config = source) => {
    const newRow = getNewRow(config);
    let aux = [...config, newRow];
    if (esReorganizacionNumerosModulo) aux = [...getReconfiguracionNumerosModulo(aux)];
    // aux = getConfiguracionConEstilosRepetidos(aux);
    setSource(aux);
    // generarResumen(aux);
  }
  const eliminarUltimaFila = () => {
    let aux = [...source];
    if (aux && aux.length > 0) {
      aux.splice(aux.length - 1, 1);
      if (esReorganizacionNumerosModulo) aux = [...getReconfiguracionNumerosModulo(aux)];
      // aux = getConfiguracionConEstilosRepetidos(aux);
      setSource(aux);
      // generarResumen(aux);
    }
  };
  const agregarColumnaALaDerecha = (config = source) => {
    setColumnCount(columnCount + 1);
    let aux = [...config];
    aux = aux.map((row, index) => [ ...row, getNewItem(index) ]);
    if (esReorganizacionNumerosModulo) aux = [...getReconfiguracionNumerosModulo(aux)];
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
    if (esReorganizacionNumerosModulo) aux = [...getReconfiguracionNumerosModulo(aux)];
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
      tooltip: 'Editar la configuración del módulo',
      // disabled: columnCount === 12,
      onClick: () => console.log('editar'),
    },
    {
      icon: 'fas fa-save',
      cssClass: 'icon-inline mr-3',
      tooltip: 'Guardar la configuración del módulo',
      // disabled: columnCount === 12,
      onClick: () => console.log('guardar'),
    },
    {
      icon: 'fas fa-ban',
      cssClass: 'icon-inline',
      tooltip: 'Cancelar la edición de la configuración del módulo',
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
    let className = '';
    switch(itemSectionType) {
      case ItemSectionType.Configurator:
        className = 'mi-col-middle';
        break;
    }
    return className;
  }
  const getClassName = () => {
    let className = 'mi';
    if (!!item.SectionType) className += ' with-border mt-3 py-3';
    return className;
  }
  // --------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
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
            <ModuloItemEditor item={item} 
              child={habitacion}
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
              readOnly={!!habitacion || (!!item && item.SectionType !== ItemSectionType.Configurator && !!!item.DetailSectionType)}
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
            <ModuloItemDeshabilitado item={item} 
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
  // --------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  useEffect(() => {
    changeView(item.Disabled ? 1 : 0);
  }, [item.Disabled]);
  // --------------------------------------------------------------------------------

  // --------------------------------------------------------------------------------
  useEffect(() => {
    setHabitacion(item.Habitacion);
  }, [item.Habitacion]);

  useEffect(() => {
    const { Habitaciones } = item;
    if (Array.isArray(Habitaciones)) {
      const formattedSource = transformToFormattedData(Habitaciones, { rowField, colField, uniqueId, uniqueDataField, valueForUndefined, transformItem });
      // console.log("formattedSource", formattedSource);
      const colCount = Array.isArray(formattedSource) && Array.isArray(formattedSource[0]) ? formattedSource[0].length : 0;
      setColumnCount(colCount);
      setSource(generateConfig(formattedSource) || []);
    } else setSource([]);
  }, [item.Habitaciones]);
  // ------------------------------------------------------

  return (
    <MultiView
      dataSource={dataSource}
      selectedIndex={selectedIndex}
      onOptionChanged={onSelectionChanged}
      itemComponent={viewItemComponent}
      animationEnabled={true} 
      swipeEnabled={false}
      loop={false}
    />
  );
};

export default injectIntl(ModuloItem);
